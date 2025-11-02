-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for pos_db
CREATE DATABASE IF NOT EXISTS `pos_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pos_db`;

-- Dumping structure for table pos_db.categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table pos_db.categories: ~3 rows (approximately)
INSERT INTO `categories` (`id`, `nama`) VALUES
	(1, 'Makanan'),
	(2, 'Minuman'),
	(3, 'Cemilan');

-- Dumping structure for table pos_db.keranjangs
CREATE TABLE IF NOT EXISTS `keranjangs` (
  `id` varchar(50) NOT NULL,
  `jumlah` int NOT NULL,
  `keterangan` text,
  `product_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `keranjangs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table pos_db.keranjangs: ~0 rows (approximately)

-- Dumping structure for table pos_db.pesanans
CREATE TABLE IF NOT EXISTS `pesanans` (
  `id` varchar(50) NOT NULL,
  `total_bayar` int NOT NULL,
  `tanggal` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table pos_db.pesanans: ~0 rows (approximately)

-- Dumping structure for table pos_db.products
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode` varchar(50) NOT NULL,
  `nama` varchar(255) NOT NULL,
  `harga` int NOT NULL,
  `is_ready` tinyint(1) DEFAULT '1',
  `gambar` varchar(255) NOT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table pos_db.products: ~14 rows (approximately)
INSERT INTO `products` (`id`, `kode`, `nama`, `harga`, `is_ready`, `gambar`, `category_id`) VALUES
	(1, 'K-01', 'Sate Ayam', 16000, 1, 'sate-ayam.jpg', 1),
	(2, 'K-02', 'Nasi Goreng Telur', 14000, 1, 'nasi-goreng-telor.jpg', 1),
	(3, 'K-03', 'Nasi Rames', 12000, 1, 'nasi-rames.jpg', 1),
	(4, 'K-04', 'Lontong Opor Ayam', 18000, 1, 'lontong-opor-ayam.jpg', 1),
	(5, 'K-05', 'Mie Goreng', 13000, 1, 'mie-goreng.jpg', 1),
	(6, 'K-06', 'Bakso', 10000, 1, 'bakso.jpg', 1),
	(7, 'K-07', 'Mie Ayam Bakso', 14000, 1, 'mie-ayam-bakso.jpg', 1),
	(8, 'K-08', 'Pangsit 6 pcs', 5000, 1, 'pangsit.jpg', 3),
	(9, 'K-09', 'Kentang Goreng', 5000, 1, 'kentang-goreng.jpg', 3),
	(10, 'K-010', 'Cheese Burger', 15000, 1, 'cheese-burger.jpg', 3),
	(11, 'K-011', 'Coffe Late', 15000, 1, 'coffe-late.jpg', 2),
	(12, 'K-012', 'Es Jeruk', 7000, 1, 'es-jeruk.jpg', 2),
	(13, 'K-013', 'Es Teh', 5000, 1, 'es-teh.jpg', 2),
	(14, 'K-014', 'Teh Hangat', 3000, 1, 'teh-hangat.jpg', 2);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
