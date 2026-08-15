// src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true }); // needed to read :cafeId from parent mount
const {
  getReviewsForCafe,
  createReview,
  deleteReview
} = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');
const { checkLicense, requireLicense } = require('../middleware/license');

router.get('/', getReviewsForCafe);
router.post('/', authenticate, checkLicense, requireLicense, createReview);
router.delete('/:id', authenticate, deleteReview);

module.exports = router;