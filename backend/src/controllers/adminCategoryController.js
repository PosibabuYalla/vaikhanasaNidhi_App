const Category = require('../models/category.model');
const Subcategory = require('../models/subcategory.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { resolveCategoryStyles } = require('../utils/categoryStyles');
const { FILTER_CATEGORY_SLUGS } = require('../data/defaultCategories');

function slugify(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '_');
}

const FILTER_CAT_KEYS = new Set(FILTER_CATEGORY_SLUGS);

async function getMainCategoryKeys() {
  const categories = await Category.find().select('slug');
  return new Set(categories.map((c) => c.slug));
}

exports.listCategories = catchAsync(async (req, res) => {
  const categories = await Category.find().sort({ label_en: 1 });
  res.json(categories.map((c) => c.toAdminJSON()));
});

exports.getCategory = catchAsync(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.id });
  if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');
  res.json(category.toAdminJSON());
});

exports.createCategory = catchAsync(async (req, res) => {
  const { label, label_en, color, bg, text, id } = req.body;

  if (!label?.trim() || !label_en?.trim()) {
    throw new AppError('Telugu and English names are required', 400, 'BAD_REQUEST');
  }

  const slug = id?.trim() || slugify(label_en);
  const existing = await Category.findOne({ slug });
  if (existing) throw new AppError('Category already exists', 409, 'DUPLICATE');

  const category = await Category.create({
    slug,
    label: label.trim(),
    label_te: label.trim(),
    label_en: label_en.trim(),
    color: color || 'from-stone-600 to-stone-800',
    bg: bg || '',
    text: text || '',
  });

  res.status(201).json(category.toAdminJSON());
});

exports.updateCategory = catchAsync(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.id });
  if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');

  const { label, label_en, color, bg, text } = req.body;

  if (label !== undefined) {
    category.label = label.trim();
    category.label_te = label.trim();
  }
  if (label_en !== undefined) category.label_en = label_en.trim();
  if (color !== undefined) category.color = color;
  if (bg !== undefined) category.bg = bg;
  if (text !== undefined) category.text = text;

  await category.save();
  res.json(category.toAdminJSON());
});

exports.deleteCategory = catchAsync(async (req, res) => {
  const category = await Category.findOneAndDelete({ slug: req.params.id });
  if (!category) throw new AppError('Category not found', 404, 'NOT_FOUND');
  res.json({ ok: true });
});

exports.listSubcategories = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.parent_key) {
    filter.parent_key = req.query.parent_key.trim().toLowerCase();
  }
  const subcategories = await Subcategory.find(filter).sort({ parent_key: 1, label_en: 1 });
  res.json(subcategories.map((s) => s.toAdminJSON()));
});

exports.createSubcategory = catchAsync(async (req, res) => {
  const {
    parent_key,
    filter_cat,
    label,
    label_te,
    label_en,
    search_terms,
    color,
    bg,
    text,
    key,
    id,
  } = req.body;

  const parentKey = parent_key?.trim().toLowerCase();
  const mainKeys = await getMainCategoryKeys();
  if (!parentKey || !mainKeys.has(parentKey)) {
    throw new AppError('Valid parent category is required', 400, 'BAD_REQUEST');
  }
  if (!label?.trim() || !label_en?.trim()) {
    throw new AppError('Telugu and English names are required', 400, 'BAD_REQUEST');
  }

  const normalizedKey = (key || id || slugify(label_en)).trim().toLowerCase();
  const slug = `${parentKey}__${normalizedKey}`;
  const existing = await Subcategory.findOne({ slug });
  if (existing) throw new AppError('Subcategory already exists', 409, 'DUPLICATE');

  const filterCat = (filter_cat || parentKey).trim().toLowerCase();
  const styles = resolveCategoryStyles(filterCat, parentKey);

  const subcategory = await Subcategory.create({
    slug,
    key: normalizedKey,
    parent_key: parentKey,
    filter_cat: filterCat,
    label: label.trim(),
    label_te: (label_te || label).trim(),
    label_en: label_en.trim(),
    search_terms: Array.isArray(search_terms)
      ? search_terms.map((item) => String(item).trim()).filter(Boolean)
      : [],
    color: color || 'from-stone-600 to-stone-800',
    bg: bg || styles.bg,
    text: text || styles.text,
  });

  res.status(201).json(subcategory.toAdminJSON());
});

exports.updateSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findOne({ slug: req.params.id });
  if (!subcategory) throw new AppError('Subcategory not found', 404, 'NOT_FOUND');

  const {
    parent_key,
    filter_cat,
    label,
    label_te,
    label_en,
    search_terms,
    color,
    bg,
    text,
  } = req.body;

  if (parent_key !== undefined) {
    const parentKey = parent_key.trim().toLowerCase();
    const mainKeys = await getMainCategoryKeys();
    if (!mainKeys.has(parentKey)) {
      throw new AppError('Valid parent category is required', 400, 'BAD_REQUEST');
    }
    subcategory.parent_key = parentKey;
  }
  if (filter_cat !== undefined) subcategory.filter_cat = filter_cat.trim().toLowerCase();
  if (label !== undefined) subcategory.label = label.trim();
  if (label_te !== undefined) subcategory.label_te = label_te.trim();
  if (label_en !== undefined) subcategory.label_en = label_en.trim();
  if (color !== undefined) subcategory.color = color;
  if (bg !== undefined) subcategory.bg = bg;
  if (text !== undefined) subcategory.text = text;
  if (search_terms !== undefined) {
    subcategory.search_terms = Array.isArray(search_terms)
      ? search_terms.map((item) => String(item).trim()).filter(Boolean)
      : [];
  }

  await subcategory.save();
  res.json(subcategory.toAdminJSON());
});

exports.deleteSubcategory = catchAsync(async (req, res) => {
  const subcategory = await Subcategory.findOneAndDelete({ slug: req.params.id });
  if (!subcategory) throw new AppError('Subcategory not found', 404, 'NOT_FOUND');
  res.json({ ok: true });
});
