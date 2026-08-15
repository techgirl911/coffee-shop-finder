// src/controllers/reviewController.js
const reviewModel = require('../models/reviewModel');

async function getReviewsForCafe(req, res) {
  try {
    const reviews = await reviewModel.findByCafe(req.params.cafeId);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews.', details: err.message });
  }
}

async function createReview(req, res) {
  try {
    const { rating, comment } = req.body;
    const cafe_id = req.params.cafeId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const review = await reviewModel.create({
      cafe_id,
      user_id: req.user.id,
      rating,
      comment: comment || null
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review.', details: err.message });
  }
}

async function deleteReview(req, res) {
  try {
    const deleted = await reviewModel.remove(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found or not yours to delete.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review.', details: err.message });
  }
}

module.exports = { getReviewsForCafe, createReview, deleteReview };