-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: kosmo
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `et_banner`
--

DROP TABLE IF EXISTS `et_banner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_banner` (
  `banner_id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`banner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_banner`
--

LOCK TABLES `et_banner` WRITE;
/*!40000 ALTER TABLE `et_banner` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_banner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_cart`
--

DROP TABLE IF EXISTS `et_cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_cart` (
  `cart_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`cart_id`),
  KEY `fk_cart_user` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_cart`
--

LOCK TABLES `et_cart` WRITE;
/*!40000 ALTER TABLE `et_cart` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_cart_item`
--

DROP TABLE IF EXISTS `et_cart_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_cart_item` (
  `cart_item_id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `sku_id` bigint NOT NULL,
  `quantity` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_item_id`),
  KEY `fk_cartitem_cart` (`cart_id`),
  KEY `fk_cartitem_sku` (`sku_id`),
  CONSTRAINT `fk_cartitem_cart` FOREIGN KEY (`cart_id`) REFERENCES `et_cart` (`cart_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cartitem_sku` FOREIGN KEY (`sku_id`) REFERENCES `et_product_sku` (`sku_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_cart_item`
--

LOCK TABLES `et_cart_item` WRITE;
/*!40000 ALTER TABLE `et_cart_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_cart_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_category`
--

DROP TABLE IF EXISTS `et_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_category` (
  `category_id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `fk_category_parent` (`parent_id`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `et_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_category`
--

LOCK TABLES `et_category` WRITE;
/*!40000 ALTER TABLE `et_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_email_verification`
--

DROP TABLE IF EXISTS `et_email_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_email_verification` (
  `verification_id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `is_verified` tinyint DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `used_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`verification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_email_verification`
--

LOCK TABLES `et_email_verification` WRITE;
/*!40000 ALTER TABLE `et_email_verification` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_email_verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_file`
--

DROP TABLE IF EXISTS `et_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_file` (
  `file_id` bigint NOT NULL AUTO_INCREMENT,
  `ref_type` varchar(100) DEFAULT NULL,
  `ref_id` bigint DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `stored_name` varchar(255) DEFAULT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_file`
--

LOCK TABLES `et_file` WRITE;
/*!40000 ALTER TABLE `et_file` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_file` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_order`
--

DROP TABLE IF EXISTS `et_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_order` (
  `order_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `order_code` varchar(255) DEFAULT NULL,
  `order_status` varchar(50) DEFAULT NULL,
  `total_amount` bigint DEFAULT NULL,
  `receiver_name` varchar(255) DEFAULT NULL,
  `receiver_phone` varchar(30) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `address_base` varchar(255) DEFAULT NULL,
  `address_detail` varchar(255) DEFAULT NULL,
  `ordered_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `delivery_status` varchar(50) DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `fk_order_user` (`user_id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_order`
--

LOCK TABLES `et_order` WRITE;
/*!40000 ALTER TABLE `et_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_order_item`
--

DROP TABLE IF EXISTS `et_order_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_order_item` (
  `order_item_id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `sku_id` bigint NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `price` bigint DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_item_id`),
  KEY `fk_orderitem_order` (`order_id`),
  KEY `fk_orderitem_sku` (`sku_id`),
  CONSTRAINT `fk_orderitem_order` FOREIGN KEY (`order_id`) REFERENCES `et_order` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orderitem_sku` FOREIGN KEY (`sku_id`) REFERENCES `et_product_sku` (`sku_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_order_item`
--

LOCK TABLES `et_order_item` WRITE;
/*!40000 ALTER TABLE `et_order_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_order_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_payment`
--

DROP TABLE IF EXISTS `et_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_payment` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `fk_payment_order` (`order_id`),
  CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `et_order` (`order_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_payment`
--

LOCK TABLES `et_payment` WRITE;
/*!40000 ALTER TABLE `et_payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_point_history`
--

DROP TABLE IF EXISTS `et_point_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_point_history` (
  `point_history_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `point_amount` int NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `ref_id` bigint DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`point_history_id`),
  KEY `fk_point_user` (`user_id`),
  CONSTRAINT `fk_point_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_point_history`
--

LOCK TABLES `et_point_history` WRITE;
/*!40000 ALTER TABLE `et_point_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_point_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_popup`
--

DROP TABLE IF EXISTS `et_popup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_popup` (
  `popup_id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `image_url` varchar(255) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`popup_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_popup`
--

LOCK TABLES `et_popup` WRITE;
/*!40000 ALTER TABLE `et_popup` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_popup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_post`
--

DROP TABLE IF EXISTS `et_post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_post` (
  `post_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `post_type` varchar(50) DEFAULT NULL,
  `ref_type` varchar(50) DEFAULT NULL,
  `ref_id` bigint DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`post_id`),
  KEY `fk_post_user` (`user_id`),
  CONSTRAINT `fk_post_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_post`
--

LOCK TABLES `et_post` WRITE;
/*!40000 ALTER TABLE `et_post` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_product`
--

DROP TABLE IF EXISTS `et_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_product` (
  `product_id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint DEFAULT NULL,
  `product_code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `base_price` bigint DEFAULT NULL,
  `description` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_code` (`product_code`),
  KEY `fk_product_category` (`category_id`),
  CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `et_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_product`
--

LOCK TABLES `et_product` WRITE;
/*!40000 ALTER TABLE `et_product` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_product_discount`
--

DROP TABLE IF EXISTS `et_product_discount`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_product_discount` (
  `discount_id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `discount_value` int DEFAULT NULL,
  `discount_type` varchar(50) DEFAULT NULL,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `is_active` tinyint DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`discount_id`),
  KEY `fk_discount_product` (`product_id`),
  CONSTRAINT `fk_discount_product` FOREIGN KEY (`product_id`) REFERENCES `et_product` (`product_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_product_discount`
--

LOCK TABLES `et_product_discount` WRITE;
/*!40000 ALTER TABLE `et_product_discount` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_product_discount` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_product_option_group`
--

DROP TABLE IF EXISTS `et_product_option_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_product_option_group` (
  `option_group_id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`option_group_id`),
  KEY `fk_opt_group_product` (`product_id`),
  CONSTRAINT `fk_opt_group_product` FOREIGN KEY (`product_id`) REFERENCES `et_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_product_option_group`
--

LOCK TABLES `et_product_option_group` WRITE;
/*!40000 ALTER TABLE `et_product_option_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_product_option_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_product_option_value`
--

DROP TABLE IF EXISTS `et_product_option_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_product_option_value` (
  `option_value_id` bigint NOT NULL AUTO_INCREMENT,
  `option_group_id` bigint NOT NULL,
  `value` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`option_value_id`),
  KEY `fk_opt_value_group` (`option_group_id`),
  CONSTRAINT `fk_opt_value_group` FOREIGN KEY (`option_group_id`) REFERENCES `et_product_option_group` (`option_group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_product_option_value`
--

LOCK TABLES `et_product_option_value` WRITE;
/*!40000 ALTER TABLE `et_product_option_value` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_product_option_value` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_product_review`
--

DROP TABLE IF EXISTS `et_product_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_product_review` (
  `review_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `rating` tinyint DEFAULT NULL,
  `content` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`review_id`),
  KEY `fk_review_user` (`user_id`),
  KEY `fk_review_product` (`product_id`),
  KEY `fk_review_order` (`order_id`),
  CONSTRAINT `fk_review_order` FOREIGN KEY (`order_id`) REFERENCES `et_order` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_product` FOREIGN KEY (`product_id`) REFERENCES `et_product` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_product_review`
--

LOCK TABLES `et_product_review` WRITE;
/*!40000 ALTER TABLE `et_product_review` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_product_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_product_sku`
--

DROP TABLE IF EXISTS `et_product_sku`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_product_sku` (
  `sku_id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `sku_code` varchar(255) DEFAULT NULL,
  `price` bigint DEFAULT NULL,
  `stock` bigint DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sku_id`),
  KEY `fk_sku_product` (`product_id`),
  CONSTRAINT `fk_sku_product` FOREIGN KEY (`product_id`) REFERENCES `et_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_product_sku`
--

LOCK TABLES `et_product_sku` WRITE;
/*!40000 ALTER TABLE `et_product_sku` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_product_sku` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_qna_message`
--

DROP TABLE IF EXISTS `et_qna_message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_qna_message` (
  `message_id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` bigint NOT NULL,
  `sender` varchar(20) DEFAULT NULL,
  `message` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `fk_qna_msg_room` (`room_id`),
  CONSTRAINT `fk_qna_msg_room` FOREIGN KEY (`room_id`) REFERENCES `et_qna_room` (`room_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_qna_message`
--

LOCK TABLES `et_qna_message` WRITE;
/*!40000 ALTER TABLE `et_qna_message` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_qna_message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_qna_room`
--

DROP TABLE IF EXISTS `et_qna_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_qna_room` (
  `room_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `last_message_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  KEY `fk_qna_room_user` (`user_id`),
  CONSTRAINT `fk_qna_room_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_qna_room`
--

LOCK TABLES `et_qna_room` WRITE;
/*!40000 ALTER TABLE `et_qna_room` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_qna_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_social_account`
--

DROP TABLE IF EXISTS `et_social_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_social_account` (
  `social_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `provider_user_id` varchar(255) DEFAULT NULL,
  `connected_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`social_id`),
  UNIQUE KEY `uq_provider_user` (`provider`,`provider_user_id`),
  KEY `fk_social_user` (`user_id`),
  CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_social_account`
--

LOCK TABLES `et_social_account` WRITE;
/*!40000 ALTER TABLE `et_social_account` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_social_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_user`
--

DROP TABLE IF EXISTS `et_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `tel` varchar(30) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `address_base` varchar(255) DEFAULT NULL,
  `address_detail` varchar(255) DEFAULT NULL,
  `email_verified` char(1) DEFAULT 'N',
  `provider` varchar(30) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE',
  `role` varchar(30) DEFAULT 'USER',
  `last_login_at` datetime DEFAULT NULL,
  `password_updated_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_user`
--

LOCK TABLES `et_user` WRITE;
/*!40000 ALTER TABLE `et_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_user_attribute`
--

DROP TABLE IF EXISTS `et_user_attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_user_attribute` (
  `attribute_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `attribute_key` varchar(100) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `is_required` tinyint DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`attribute_id`),
  UNIQUE KEY `key` (`attribute_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_user_attribute`
--

LOCK TABLES `et_user_attribute` WRITE;
/*!40000 ALTER TABLE `et_user_attribute` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_user_attribute` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_user_attribute_value`
--

DROP TABLE IF EXISTS `et_user_attribute_value`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_user_attribute_value` (
  `value_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `attribute_id` bigint NOT NULL,
  `value_text` text,
  `value_number` int DEFAULT NULL,
  `value_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`value_id`),
  KEY `fk_uav_user` (`user_id`),
  KEY `fk_uav_attr` (`attribute_id`),
  CONSTRAINT `fk_uav_attr` FOREIGN KEY (`attribute_id`) REFERENCES `et_user_attribute` (`attribute_id`),
  CONSTRAINT `fk_uav_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_user_attribute_value`
--

LOCK TABLES `et_user_attribute_value` WRITE;
/*!40000 ALTER TABLE `et_user_attribute_value` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_user_attribute_value` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `et_user_recommendation`
--

DROP TABLE IF EXISTS `et_user_recommendation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `et_user_recommendation` (
  `recommendation_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `rank_no` int DEFAULT NULL,
  `score` float DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`recommendation_id`),
  KEY `fk_reco_user` (`user_id`),
  KEY `fk_reco_product` (`product_id`),
  CONSTRAINT `fk_reco_product` FOREIGN KEY (`product_id`) REFERENCES `et_product` (`product_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reco_user` FOREIGN KEY (`user_id`) REFERENCES `et_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `et_user_recommendation`
--

LOCK TABLES `et_user_recommendation` WRITE;
/*!40000 ALTER TABLE `et_user_recommendation` DISABLE KEYS */;
/*!40000 ALTER TABLE `et_user_recommendation` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-06  9:46:07


