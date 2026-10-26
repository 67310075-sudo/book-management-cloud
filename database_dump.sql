-- =============================================================================
-- Book Management System - Database Dump (MySQL 8.4 / Aiven Cloud)
-- Lab 9.5, 9.6, and 9.7
-- Target Database: defaultdb (or your chosen MySQL database)
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. Table structure for `users` (Role-Based Access Control)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'viewer',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_token` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table structure for `Book_Management_books`
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `Book_Management_books`;
CREATE TABLE `Book_Management_books` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL DEFAULT '',
  `author` varchar(200) NOT NULL DEFAULT '',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `category` varchar(200) NOT NULL DEFAULT '',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Seed Data for `users`
-- Passwords: All hashed with bcrypt ('123456', length 60 chars)
-- -----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `is_verified`, `verification_token`, `created_at`) VALUES
(1, 'User A (Viewer)', 'usera@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer', 1, NULL, NOW()),
(2, 'User B (Editor)', 'userb@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'editor', 1, NULL, NOW()),
(3, 'User C (Admin)',  'userc@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin',  1, NULL, NOW()),
(4, 'Manager',         'manager@test.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'manager', 1, NULL, NOW());

-- -----------------------------------------------------------------------------
-- 4. Seed Data for `Book_Management_books` (5 Sample Books)
-- -----------------------------------------------------------------------------
INSERT INTO `Book_Management_books` (`id`, `title`, `author`, `price`, `stock`, `category`, `created_at`, `updated_at`) VALUES
(1, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 450.00, 15, 'Programming', NOW(), NOW()),
(2, 'The Pragmatic Programmer: Your Journey To Mastery', 'David Thomas & Andrew Hunt', 520.00, 10, 'Software Engineering', NOW(), NOW()),
(3, 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 590.00, 8, 'Architecture', NOW(), NOW()),
(4, 'Learning Python (5th Edition)', 'Mark Lutz', 650.00, 12, 'Python', NOW(), NOW()),
(5, 'Building Microservices: Designing Fine-Grained Systems', 'Sam Newman', 480.00, 20, 'Cloud Computing', NOW(), NOW());

SET FOREIGN_KEY_CHECKS = 1;
