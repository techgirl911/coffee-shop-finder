// src/controllers/favoriteController.js
const favoriteModel = require('../models/favoriteModel');
const { DEMO_LIMITS } = require('../middleware/license');

async function getFavorites(req, res) {
  try {
    const favorites = await favoriteModel.findByUser(req.user.id);
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites.', details: err.message });
  }
}

async function addFavorite(req, res) {
  try {
    const { cafeId } = req.params;

    if (!req.hasLicense) {
      const count = await favoriteModel.countByUser(req.user.id);
      if (count >= DEMO_LIMITS.maxFavorites) {
        return res.status(403).json({
          error: `Demo mode allows up to ${DEMO_LIMITS.maxFavorites} favorites. Upgrade for unlimited.`,
          upgradeUrl: process.env.UPGRADE_URL || 'https://your-store-link.example.com'
        });
      }
    }

    const favorites = await favoriteModel.add(req.user.id, cafeId);
    res.status(201).json(favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favorite.', details: err.message });
  }
}

async function removeFavorite(req, res) {
  try {
    const removed = await favoriteModel.remove(req.user.id, req.params.cafeId);
    if (!removed) return res.status(404).json({ error: 'Favorite not found.' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite.', details: err.message });
  }
}

module.exports = { getFavorites, addFavorite, removeFavorite };