const Scripture = require('../models/scripture.model');
const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const {
  deleteManyUrls,
  collectScriptureImageUrls,
  diffRemovedUrls,
} = require('../utils/cloudinaryDelete');

const { FILTER_CATEGORY_SLUGS } = require('../data/defaultCategories');

const FILTER_CAT_KEYS = new Set(FILTER_CATEGORY_SLUGS);

async function getMainCategoryKeys() {
  const categories = await Category.find().select('slug');
  return new Set(categories.map((c) => c.slug));
}

async function assertCategoryExists(categorySlug) {
  const slug = categorySlug.trim().toLowerCase();
  const mainKeys = await getMainCategoryKeys();
  if (mainKeys.has(slug) || FILTER_CAT_KEYS.has(slug)) return slug;
  const exists = await Category.findOne({ slug });
  if (!exists) throw new AppError('Invalid category', 400, 'BAD_REQUEST');
  return slug;
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .filter((img) => img?.url?.trim())
    .map((img) => ({
      url: img.url.trim(),
      caption: img.caption?.trim() || '',
      page_number: img.page_number ? Number(img.page_number) : undefined,
    }));
}

const VALID_READING_LAYOUTS = ['paginated', 'verses', 'image_pages', 'pdf_pages'];

function isBookPdfLayout(body) {
  return body.reading_layout === 'pdf_pages';
}

function isBookImageLayout(body) {
  return body.reading_layout === 'image_pages';
}

function isImageGalleryCategory(parentKey, category) {
  return parentKey === 'chitralu' || category === 'chitralu';
}

function resolveContentPayload(body, placement) {
  const isGallery = isImageGalleryCategory(placement.parent_category, placement.category);
  if (isGallery) {
    const images = normalizeImages(body.images);
    if (!images.length) {
      throw new AppError('At least one image is required for Images category', 400, 'BAD_REQUEST');
    }
    return {
      verses: [],
      images,
      cover_url: body.cover_url || images[0]?.url || null,
      pdf_url: null,
    };
  }

  if (isBookPdfLayout(body)) {
    const pdfUrl = body.pdf_url?.trim();
    if (!pdfUrl) {
      throw new AppError('PDF file URL is required for PDF books', 400, 'BAD_REQUEST');
    }
    return {
      verses: [],
      images: [],
      cover_url: body.cover_url || null,
      pdf_url: pdfUrl,
    };
  }

  if (isBookImageLayout(body)) {
    const images = normalizeImages(body.images);
    if (!images.length) {
      throw new AppError('At least one page image is required for image-based books', 400, 'BAD_REQUEST');
    }
    return {
      verses: [],
      images,
      cover_url: body.cover_url || images[0]?.url || null,
    };
  }

  const verses = Array.isArray(body.verses)
    ? body.verses
      .filter((v) => v?.telugu?.trim() || v?.meaning?.trim())
      .map((v) => ({
        telugu: v.telugu?.trim() || '',
        meaning: v.meaning?.trim() || '',
        page_number: v.page_number ? Number(v.page_number) : undefined,
      }))
    : [];
  return {
    verses,
    images: [],
    cover_url: body.cover_url || null,
    pdf_url: null,
  };
}

async function resolveScripturePlacement({ category, parent_category, subcategory }) {
  const parentKey = parent_category?.trim().toLowerCase() || '';
  const subKey = subcategory?.trim().toLowerCase() || '';

  if (subKey && parentKey) {
    const sub = await Subcategory.findOne({
      key: subKey,
      parent_key: parentKey,
    });
    if (!sub) throw new AppError('Invalid subcategory for selected category', 400, 'BAD_REQUEST');
    return {
      category: sub.filter_cat || sub.parent_key,
      parent_category: sub.parent_key,
      subcategory: sub.key,
    };
  }

  if (!category?.trim()) {
    throw new AppError('Category is required', 400, 'BAD_REQUEST');
  }

  const normalizedCategory = await assertCategoryExists(category);
  return {
    category: normalizedCategory,
    parent_category: parentKey,
    subcategory: subKey,
  };
}

exports.listScriptures = catchAsync(async (req, res) => {
  const scriptures = await Scripture.find().sort({ createdAt: -1 });
  res.json(scriptures.map((s) => s.toAdminJSON()));
});

exports.getScripture = catchAsync(async (req, res) => {
  const scripture = await Scripture.findById(req.params.id);
  if (!scripture) throw new AppError('Scripture not found', 404, 'NOT_FOUND');
  res.json(scripture.toAdminJSON());
});

exports.createScripture = catchAsync(async (req, res) => {
  const {
    title_telugu,
    title_english,
    category,
    parent_category,
    subcategory,
    deity,
    description,
    cover_url,
    popularity,
    verses,
    images,
    reading_layout,
    page_count,
    pdf_url,
  } = req.body;

  if (!title_telugu?.trim()) {
    throw new AppError('Telugu title is required', 400, 'BAD_REQUEST');
  }

  const placement = await resolveScripturePlacement({ category, parent_category, subcategory });
  const content = resolveContentPayload({
    verses, images, cover_url, reading_layout, pdf_url,
  }, placement);

  const scripture = await Scripture.create({
    title_telugu: title_telugu.trim(),
    title_english: title_english?.trim() || '',
    ...placement,
    deity: deity?.trim() || '',
    description: description || '',
    cover_url: content.cover_url,
    pdf_url: content.pdf_url || null,
    popularity: popularity ?? 80,
    verses: content.verses,
    images: content.images,
    reading_layout: VALID_READING_LAYOUTS.includes(reading_layout)
      ? reading_layout
      : (content.pdf_url ? 'pdf_pages' : 'verses'),
    page_count: page_count != null && page_count !== ''
      ? Number(page_count)
      : (content.verses.length || 0),
  });

  res.status(201).json(scripture.toAdminJSON());
});

exports.updateScripture = catchAsync(async (req, res) => {
  const scripture = await Scripture.findById(req.params.id);
  if (!scripture) throw new AppError('Scripture not found', 404, 'NOT_FOUND');

  const {
    title_telugu,
    title_english,
    category,
    parent_category,
    subcategory,
    deity,
    description,
    cover_url,
    popularity,
    verses,
    images,
    reading_layout,
    page_count,
    pdf_url,
  } = req.body;

  if (title_telugu !== undefined && !title_telugu.trim()) {
    throw new AppError('Telugu title is required', 400, 'BAD_REQUEST');
  }

  if (category !== undefined || parent_category !== undefined || subcategory !== undefined) {
    const placement = await resolveScripturePlacement({
      category: category ?? scripture.category,
      parent_category: parent_category ?? scripture.parent_category,
      subcategory: subcategory ?? scripture.subcategory,
    });
    scripture.category = placement.category;
    scripture.parent_category = placement.parent_category;
    scripture.subcategory = placement.subcategory;
  }

  if (title_telugu !== undefined) scripture.title_telugu = title_telugu.trim();
  if (title_english !== undefined) scripture.title_english = title_english.trim();
  if (deity !== undefined) scripture.deity = deity.trim();
  if (description !== undefined) scripture.description = description;
  if (popularity !== undefined) scripture.popularity = popularity;

  const previousUrls = collectScriptureImageUrls(scripture);

  if (verses !== undefined || images !== undefined || category !== undefined
    || parent_category !== undefined || subcategory !== undefined
    || reading_layout !== undefined || pdf_url !== undefined) {
    const content = resolveContentPayload(
      {
        verses: verses ?? scripture.verses,
        images: images ?? scripture.images,
        cover_url: cover_url ?? scripture.cover_url,
        reading_layout: reading_layout ?? scripture.reading_layout,
        pdf_url: pdf_url ?? scripture.pdf_url,
      },
      {
        parent_category: scripture.parent_category,
        category: scripture.category,
      }
    );
    scripture.verses = content.verses;
    scripture.images = content.images;
    scripture.cover_url = content.cover_url;
    scripture.pdf_url = content.pdf_url ?? null;
    if (reading_layout !== undefined) {
      scripture.reading_layout = VALID_READING_LAYOUTS.includes(reading_layout)
        ? reading_layout
        : 'verses';
    }
    if (page_count !== undefined) {
      scripture.page_count = Number(page_count) || content.verses.length;
    }
  } else if (cover_url !== undefined) {
    scripture.cover_url = cover_url;
  }

  const nextUrls = collectScriptureImageUrls(scripture);
  const removedUrls = diffRemovedUrls(previousUrls, nextUrls);
  if (removedUrls.length) {
    await deleteManyUrls(removedUrls);
  }

  await scripture.save();
  res.json(scripture.toAdminJSON());
});

exports.deleteScripture = catchAsync(async (req, res) => {
  const scripture = await Scripture.findByIdAndDelete(req.params.id);
  if (!scripture) throw new AppError('Scripture not found', 404, 'NOT_FOUND');
  await deleteManyUrls(collectScriptureImageUrls(scripture));
  res.json({ ok: true });
});
