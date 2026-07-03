const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const publicScriptureController = require('../controllers/publicScriptureController');
const publicCategoryController = require('../controllers/publicCategoryController');
const publicGalleryController = require('../controllers/publicGalleryController');
const publicStatsController = require('../controllers/publicStatsController');
const panchangamController = require('../controllers/panchangamController');
const dailySlokaController = require('../controllers/dailySlokaController');

const router = express.Router();

router.use(authenticate);

router.get('/stats', publicStatsController.getPublicStats);
router.get('/daily-sloka', dailySlokaController.getDailySloka);
router.get('/categories', publicCategoryController.listCategories);
router.get('/gallery/events', publicGalleryController.listEvents);
router.get('/gallery/photos', publicGalleryController.listPhotos);
router.get('/scriptures/recent', publicScriptureController.getRecentScriptures);
router.get('/scriptures', publicScriptureController.listScriptures);
router.get('/scriptures/:id/pdf', publicScriptureController.streamScripturePdf);
router.get('/scriptures/:id', publicScriptureController.getScripture);
router.get('/subcategories', publicCategoryController.listSubcategories);
router.get('/panchangam', panchangamController.getPanchangam);
router.get('/panchang', panchangamController.getPanchangam);

module.exports = router;
