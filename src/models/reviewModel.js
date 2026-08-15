// src/models/reviewModel.js
const { pool } = require('../config/db');

async function findByCafe(cafeId) {
  const [rows] = await pool.query(
    `SELECT reviews.id, reviews.rating, reviews.comment, reviews.created_at,
            users.name AS reviewer_name
     FROM reviews
     JOIN users ON users.id = reviews.user_id
     WHERE reviews.cafe_id = ?
     ORDER BY reviews.created_at DESC`,
    [cafeId]
  );
  return rows;
}

async function create({ cafe_id, user_id, rating, comment }) {
  const [result] = await pool.query(
    'INSERT INTO reviews (cafe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [cafe_id, user_id, rating, comment]
  );
  const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
  return rows[0];
}

async function remove(id, userId) {
  // only the review's author can delete it
  const [result] = await pool.query(
    'DELETE FROM reviews WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
}

async function countByUser(userId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM reviews WHERE user_id = ?',
    [userId]
  );
  return rows[0].count;
}

module.exports = { findByCafe, create, remove, countByUser };