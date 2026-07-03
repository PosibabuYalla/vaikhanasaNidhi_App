const { isConfigured } = require('../config/cloudinary');
const { uploadBuffer, uploadBuffersParallel, uploadRawBuffer } = require('../utils/cloudinaryUpload');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.uploadScriptureImages = catchAsync(async (req, res) => {
  if (!isConfigured) {
    throw new AppError('Image upload is not configured. Set Cloudinary env variables.', 503, 'SERVICE_UNAVAILABLE');
  }

  const files = req.files || [];
  if (!files.length) {
    throw new AppError('At least one image is required', 400, 'BAD_REQUEST');
  }

  const uploads = await uploadBuffersParallel(files, 'vaikhanasa-nidhi/scriptures');

  res.json({
    images: uploads.map((result) => result.secure_url),
  });
});

exports.uploadGalleryPhotos = catchAsync(async (req, res) => {
  if (!isConfigured) {
    throw new AppError('Image upload is not configured. Set Cloudinary env variables.', 503, 'SERVICE_UNAVAILABLE');
  }

  const files = req.files || [];
  if (!files.length) {
    throw new AppError('At least one image is required', 400, 'BAD_REQUEST');
  }

  const uploads = await uploadBuffersParallel(files, 'vaikhanasa-nidhi/gallery');

  res.json({
    images: uploads.map((result) => result.secure_url),
  });
});

exports.uploadVerificationProof = catchAsync(async (req, res) => {
  if (!isConfigured) {
    throw new AppError('Image upload is not configured. Set Cloudinary env variables.', 503, 'SERVICE_UNAVAILABLE');
  }
  if (!req.file) {
    throw new AppError('Proof file is required', 400, 'BAD_REQUEST');
  }

  const result = await uploadBuffer(req.file.buffer, 'vaikhanasa-nidhi/verification');
  res.json({ url: result.secure_url });
});

exports.uploadBookPdf = catchAsync(async (req, res) => {
  if (!isConfigured) {
    throw new AppError('Upload is not configured. Set Cloudinary env variables.', 503, 'SERVICE_UNAVAILABLE');
  }
  if (!req.file) {
    throw new AppError('PDF file is required', 400, 'BAD_REQUEST');
  }

  const result = await uploadRawBuffer(req.file.buffer, 'vaikhanasa-nidhi/books');

  res.json({
    url: result.secure_url,
    bytes: result.bytes,
    original_name: req.file.originalname,
  });
});
