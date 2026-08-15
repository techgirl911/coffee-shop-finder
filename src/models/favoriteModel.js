// src/models/favoriteModel.js
const { pool } = require('../config/db');

async function findByUser(userId) {
  const [rows] = await pool.query(
    `SELECT cafes.*
     FROM favorites
     JOIN cafes ON cafes.id = favorites.cafe_id
     WHERE favorites.user_id = ?
     ORDER BY favorites.created_at DESC`,
    [userId]
  );
  return rows;
}

async function add(userId, cafeId) {
  await pool.query(
    'INSERT IGNORE INTO favorites (user_id, cafe_id) VALUES (?, ?)',
    [userId, cafeId]
  );
  return findByUser(userId);
}

async function remove(userId, cafeId) {
  const [result] = await pool.query(
    'DELETE FROM favorites WHERE user_id = ? AND cafe_id = ?',
    [userId, cafeId]
  );
  return result.affectedRows > 0;
}

async function countByUser(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM favorites WHERE user_id = ?',
    [userId]
  );
  return rows[0].count;
}

async function exists(userId, cafeId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM favorites WHERE user_id = ? AND cafe_id = ? LIMIT 1',
    [userId, cafeId]
  );
  return rows.length > 0;
}

module.exports = { findByUser, add, remove, countByUser, exists };