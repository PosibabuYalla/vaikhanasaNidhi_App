const { cloudinary, isConfigured } = require('../config/cloudinary');

function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('res.cloudinary.com')) return null;

  const uploadIdx = url.indexOf('/upload/');
  if (uploadIdx === -1) return null;

  let path = url.slice(uploadIdx + '/upload/'.length);
  path = path.replace(/^v\d+\//, '');
  path = path.replace(/\.[a-zA-Z0-9]+$/, '');
  return decodeURIComponent(path);
}

async function deleteByUrl(url, resourceType = 'image') {
  if (!isConfigured) return { skipped: true, reason: 'not_configured' };

  const publicId = extractPublicId(url);
  if (!publicId) return { skipped: true, reason: 'not_cloudinary' };

  const type = resourceType === 'raw' || url.includes('/raw/upload/') ? 'raw' : 'image';

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: type });
    return { publicId, result: result.result };
  } catch (err) {
    console.warn(`[cloudinary] delete failed for ${publicId}:`, err.message);
    return { publicId, error: err.message };
  }
}

async function deleteManyUrls(urls = []) {
  const unique = [...new Set(urls.filter(Boolean))];
  if (!unique.length) return [];

  const results = await Promise.allSettled(unique.map((url) => deleteByUrl(url)));
  return results.map((r, i) => ({
    url: unique[i],
    ...(r.status === 'fulfilled' ? r.value : { error: r.reason?.message || 'failed' }),
  }));
}

function collectScriptureImageUrls(scripture) {
  const urls = [];
  if (scripture?.cover_url) urls.push(scripture.cover_url);
  if (scripture?.pdf_url) urls.push(scripture.pdf_url);
  if (Array.isArray(scripture?.images)) {
    scripture.images.forEach((img) => {
      if (img?.url) urls.push(img.url);
    });
  }
  return urls;
}

function diffRemovedUrls(previousUrls, nextUrls) {
  const nextSet = new Set(nextUrls.filter(Boolean));
  return previousUrls.filter((url) => url && !nextSet.has(url));
}

module.exports = {
  extractPublicId,
  deleteByUrl,
  deleteManyUrls,
  collectScriptureImageUrls,
  diffRemovedUrls,
};
