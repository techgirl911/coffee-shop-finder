// src/controllers/cafeController.js
const cafeModel = require('../models/cafeModel');
const { DEMO_LIMITS } = require('../middleware/license');

async function getAllCafes(req, res) {
  try {
    const { wifi, outlets, noise, seating } = req.query;
    const hasFilters = wifi || outlets || noise || seating;

    let cafes = hasFilters
      ? await cafeModel.findByFilters({ wifi, outlets, noise, seating })
      : await cafeModel.findAll();

    // Demo mode: cap results instead of blocking the route entirely
    if (!req.hasLicense && cafes.length > DEMO_LIMITS.maxCafesVisible) {
      cafes = cafes.slice(0, DEMO_LIMITS.maxCafesVisible);
    }

    res.json({ cafes, demoMode: !req.hasLicense });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cafes.', details: err.message });
  }
}

async function getCafeById(req, res) {
  try {
    const cafe = await cafeModel.findById(req.params.id);
    if (!cafe) return res.status(404).json({ error: 'Cafe not found.' });
    res.json(cafe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cafe.', details: err.message });
  }
}

async function createCafe(req, res) {
  try {
    const { name, address, lat, lng, wifi_rating, outlet_rating, noise_level, seating_rating } = req.body;

    if (!name || !address || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'name, address, lat, and lng are required.' });
    }

    const cafe = await cafeModel.create({
      name, address, lat, lng,
      wifi_rating, outlet_rating, noise_level, seating_rating,
      created_by: req.user.id
    });

    res.status(201).json(cafe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create cafe.', details: err.message });
  }
}

async function deleteCafe(req, res) {
  try {
    const deleted = await cafeModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Cafe not found.' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete cafe.', details: err.message });
  }
}

module.exports = { getAllCafes, getCafeById, createCafe, deleteCafe };