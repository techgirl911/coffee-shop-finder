-- schema.sql
CREATE DATABASE IF NOT EXISTS coffee_shop_finder;
USE coffee_shop_finder;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  license_key VARCHAR(64) DEFAULT NULL,   -- unlocks full app when set (paywall)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cafes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  google_place_id VARCHAR(150) DEFAULT NULL,
  wifi_rating TINYINT DEFAULT NULL,       -- 1-5
  outlet_rating TINYINT DEFAULT NULL,     -- 1-5
  noise_level ENUM('quiet','moderate','loud') DEFAULT NULL,
  seating_rating TINYINT DEFAULT NULL,    -- 1-5
  created_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cafe_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL,               -- 1-5 overall
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE favorites (
  user_id INT NOT NULL,
  cafe_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, cafe_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
);