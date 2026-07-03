export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const health = '/health';
export const signup = '/auth/signup';
export const login = '/auth/login';
export const adminLogin = '/auth/admin/login';
export const guest = '/auth/guest';
export const changePassword = '/auth/change-password';
export const me = '/auth/me';
export const logout = '/auth/logout';

export const adminDashboard = '/admin/dashboard';
export const adminScriptures = '/admin/scriptures';
export const adminScriptureById = (id) => `/admin/scriptures/${id}`;
export const adminCategories = '/admin/categories';
export const adminCategoryById = (id) => `/admin/categories/${id}`;
export const adminSubcategories = '/admin/subcategories';
export const adminSubcategoryById = (id) => `/admin/subcategories/${id}`;
export const adminUploadScriptureImages = '/admin/uploads/scripture-images';
export const adminUploadBookPdf = '/admin/uploads/book-pdf';
export const adminUploadGalleryPhotos = '/admin/uploads/gallery-photos';
export const adminGalleryEvents = '/admin/gallery/events';
export const adminGalleryEventBySlug = (slug) => `/admin/gallery/events/${slug}`;
export const adminGalleryPhotos = '/admin/gallery/photos';
export const adminGalleryPhotoById = (id) => `/admin/gallery/photos/${id}`;

export const scriptures = '/scriptures';
export const recentScriptures = '/scriptures/recent';
export const scriptureById = (id) => `/scriptures/${id}`;
export const scripturePdf = (id) => `/scriptures/${id}/pdf`;
export const subcategories = '/subcategories';
export const categories = '/categories';
export const stats = '/stats';
export const dailySloka = '/daily-sloka';
export const galleryEvents = '/gallery/events';
export const galleryPhotos = '/gallery/photos';
export const panchangam = '/panchangam';

export const userData = '/users/me/data';
export const userSync = '/users/me/sync';
export const userBookmarks = '/users/me/bookmarks';
export const userBookmarkById = (id) => `/users/me/bookmarks/${id}`;
export const userProgress = '/users/me/progress';
export const userProgressById = (id) => `/users/me/progress/${id}`;
export const userPassword = '/users/me/password';
export const userSettings = '/users/me/settings';
export const userProfile = '/users/me';
export const userVerification = '/users/me/verification';
export const userVerificationProof = '/users/me/verification/proof';

export const adminVerification = '/admin/verification';
export const adminVerificationById = (id) => `/admin/verification/${id}`;
