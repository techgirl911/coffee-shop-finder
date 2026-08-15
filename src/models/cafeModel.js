// src/models/cafeModel.js
const { pool } = require('../config/db');

async function findAll({ limit } = {}) {
  const sql = limit
    ? 'SELECT * FROM cafes ORDER BY created_at DESC LIMIT ?'
    : 'SELECT * FROM cafes ORDER BY created_at DESC';
  const params = limit ? [limit] : [];
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM cafes WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByFilters({ wifi, outlets, noise, seating }) {
  let sql = 'SELECT * FROM cafes WHERE 1=1';
  const params = [];

  if (wifi) { sql += ' AND wifi_rating >= ?'; params.push(wifi); }
  if (outlets) { sql += ' AND outlet_rating >= ?'; params.push(outlets); }
  if (noise) { sql += ' AND noise_level = ?'; params.push(noise); }
  if (seating) { sql += ' AND seating_rating >= ?'; params.push(seating); }

  sql += ' ORDER BY created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function create({ name, address, lat, lng, wifi_rating, outlet_rating, noise_level, seating_rating, created_by }) {
  const [result] = await pool.query(
    `INSERT INTO cafes (name, address, lat, lng, wifi_rating, outlet_rating, noise_level, seating_rating, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, address, lat, lng, wifi_rating, outlet_rating, noise_level, seating_rating, created_by]
  );
  return findById(result.insertId);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM cafes WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByFilters, create, remove };