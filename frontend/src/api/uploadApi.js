import axiosInstance from '../lib/axiosInstance';
import { adminUploadScriptureImages, adminUploadBookPdf } from '../lib/apiUrls';
import { compressImageFiles } from '../utils/compressImage';

const UPLOAD_TIMEOUT_MS = 180000;
const BATCH_SIZE = 8;

async function postMultipart(url, formData) {
  const { data } = await axiosInstance.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return data;
}

/** Upload many images in parallel batches for faster throughput */
export async function uploadScriptureImages(files) {
  const compressed = await compressImageFiles(files);
  const allUrls = [];

  for (let i = 0; i < compressed.length; i += BATCH_SIZE) {
    const batch = compressed.slice(i, i + BATCH_SIZE);
    const formData = new FormData();
    batch.forEach((file) => formData.append('images', file));
    const data = await postMultipart(adminUploadScriptureImages, formData);
    allUrls.push(...(data.images || []));
  }

  return { images: allUrls };
}

/**
 * Upload a single PDF book file (~5–50 MB). Pages render in the reader — no per-page images stored.
 */
export async function uploadBookPdf(file, onProgress) {
  const formData = new FormData();
  formData.append('pdf', file);
  const { data } = await axiosInstance.post(adminUploadBookPdf, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 600000,
    onUploadProgress: (e) => {
      if (e.total) {
        onProgress?.({
          phase: 'upload',
          current: e.loaded,
          total: e.total,
        });
      }
    },
  });
  return data;
}

/**
 * Upload rendered PDF page images to Cloudinary in batches.
 * @param {Array<{ blob: Blob, pageNumber: number, fileName: string }>} pageBlobs
 */
export async function uploadBookPageImages(pageBlobs, onProgress) {
  const images = [];

  for (let i = 0; i < pageBlobs.length; i += BATCH_SIZE) {
    const batch = pageBlobs.slice(i, i + BATCH_SIZE);
    const formData = new FormData();
    batch.forEach(({ blob, fileName }) => {
      formData.append('images', blob, fileName);
    });

    const data = await postMultipart(adminUploadScriptureImages, formData);
    const urls = data.images || [];

    urls.forEach((url, idx) => {
      const pageNumber = batch[idx]?.pageNumber ?? i + idx + 1;
      images.push({
        url,
        caption: `Page ${pageNumber}`,
        page_number: pageNumber,
      });
    });

    onProgress?.({
      phase: 'upload',
      current: Math.min(i + BATCH_SIZE, pageBlobs.length),
      total: pageBlobs.length,
    });
  }

  return images.sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
}
