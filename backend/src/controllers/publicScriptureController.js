const Scripture = require('../models/scripture.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.listScriptures = catchAsync(async (req, res) => {
  const { category, parent_category, subcategory, q, sort = 'recent', limit } = req.query;
  const filter = {};

  if (category && category !== 'all') {
    filter.category = category.trim().toLowerCase();
  }
  if (parent_category?.trim()) {
    filter.parent_category = parent_category.trim().toLowerCase();
  }
  if (subcategory?.trim()) {
    filter.subcategory = subcategory.trim().toLowerCase();
  }

  if (q?.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { title_telugu: regex },
      { title_english: regex },
      { deity: regex },
      { description: regex },
      { 'verses.telugu': regex },
      { 'verses.meaning': regex },
    ];
  }

  const sortOption = sort === 'popular' ? { popularity: -1 } : { createdAt: -1 };

  let query = Scripture.find(filter).sort(sortOption);
  if (limit) {
    const parsed = Number.parseInt(limit, 10);
    if (parsed > 0) query = query.limit(parsed);
  }

  const scriptures = await query;
  res.json(scriptures.map((s) => s.toAdminJSON()));
});

exports.getRecentScriptures = catchAsync(async (req, res) => {
  const limit = Math.min(Number.parseInt(req.query.limit, 10) || 8, 24);
  const scriptures = await Scripture.find().sort({ createdAt: -1 }).limit(limit);
  res.json(scriptures.map((s) => s.toAdminJSON()));
});

exports.getScripture = catchAsync(async (req, res) => {
  const scripture = await Scripture.findById(req.params.id);
  if (!scripture) throw new AppError('Scripture not found', 404, 'NOT_FOUND');
  res.json(scripture.toAdminJSON());
});

/** Stream stored PDF through API — avoids browser CORS issues with Cloudinary raw files */
exports.streamScripturePdf = catchAsync(async (req, res) => {
  const scripture = await Scripture.findById(req.params.id);
  if (!scripture) throw new AppError('Scripture not found', 404, 'NOT_FOUND');
  const pdfUrl = scripture.pdf_url?.trim();
  if (!pdfUrl) throw new AppError('No PDF linked to this book', 404, 'NOT_FOUND');

  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new AppError('Could not fetch PDF from storage', 502, 'BAD_GATEWAY');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': buffer.length,
    'Cache-Control': 'private, max-age=3600',
  });
  res.send(buffer);
});
