// src/config/seed.js
require('dotenv').config();
const { pool } = require('./db');

const sampleCafes = [
  {
    name: 'The Grind House',
    address: '12 Independence Ave, Yaoundé',
    lat: 3.8480,
    lng: 11.5021,
    wifi_rating: 5,
    outlet_rating: 4,
    noise_level: 'quiet',
    seating_rating: 4
  },
  {
    name: 'Café Central',
    address: '45 Rue de la Paix, Yaoundé',
    lat: 3.8667,
    lng: 11.5167,
    wifi_rating: 3,
    outlet_rating: 2,
    noise_level: 'moderate',
    seating_rating: 5
  },
  {
    name: 'Brew & Books',
    address: '8 Avenue Kennedy, Yaoundé',
    lat: 3.8600,
    lng: 11.5200,
    wifi_rating: 4,
    outlet_rating: 5,
    noise_level: 'quiet',
    seating_rating: 3
  },
  {
    name: 'Sunset Roasters',
    address: '23 Boulevard du 20 Mai, Yaoundé',
    lat: 3.8550,
    lng: 11.5100,
    wifi_rating: 2,
    outlet_rating: 2,
    noise_level: 'loud',
    seating_rating: 4
  },
  {
    name: 'The Study Cup',
    address: '5 Rue Joss, Yaoundé',
    lat: 3.8700,
    lng: 11.5250,
    wifi_rating: 5,
    outlet_rating: 5,
    noise_level: 'quiet',
    seating_rating: 5
  },
  {
    name: 'Corner Bean',
    address: '17 Avenue Foch, Yaoundé',
    lat: 3.8620,
    lng: 11.5080,
    wifi_rating: 3,
    outlet_rating: 3,
    noise_level: 'moderate',
    seating_rating: 3
  }
];

async function seed() {
  try {
    console.log('🌱 Seeding cafes...');

    for (const cafe of sampleCafes) {
      await pool.query(
        `INSERT INTO cafes (name, address, lat, lng, wifi_rating, outlet_rating, noise_level, seating_rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [cafe.name, cafe.address, cafe.lat, cafe.lng, cafe.wifi_rating, cafe.outlet_rating, cafe.noise_level, cafe.seating_rating]
      );
    }

    console.log(`✅ Seeded ${sampleCafes.length} cafes.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();