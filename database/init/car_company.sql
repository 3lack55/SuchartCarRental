CREATE DATABASE  IF NOT EXISTS `car_company` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `car_company`;
-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: car_company
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `driver_id` int NOT NULL AUTO_INCREMENT,
  `prefix` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hire_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`driver_id`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maintenance_details`
--

DROP TABLE IF EXISTS `maintenance_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenance_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `maintenance_id` int NOT NULL,
  `service_item_id` int NOT NULL,
  `quantity` decimal(8,2) NOT NULL DEFAULT '1.00',
  `unit_price` decimal(10,2) NOT NULL,
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`detail_id`),
  KEY `service_item_id` (`service_item_id`),
  KEY `maintenance_id` (`maintenance_id`),
  CONSTRAINT `maintenance_details_ibfk_1` FOREIGN KEY (`service_item_id`) REFERENCES `service_items` (`service_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `maintenance_details_ibfk_2` FOREIGN KEY (`maintenance_id`) REFERENCES `maintenances` (`maintenance_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `maintenances`
--

DROP TABLE IF EXISTS `maintenances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenances` (
  `maintenance_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `service_date` date NOT NULL,
  `garage_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `garage_type` enum('center','shop') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mileage` int NOT NULL,
  `next_service_mileage` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`maintenance_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_maintenance_service_date` (`service_date`),
  CONSTRAINT `maintenances_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provinces` (
  `province_id` int NOT NULL AUTO_INCREMENT,
  `name_th` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`province_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service_category`
--

DROP TABLE IF EXISTS `service_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_category` (
  `service_category_id` int NOT NULL AUTO_INCREMENT,
  `service_category_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_category_id`),
  KEY `service_type_id` (`service_type_id`),
  CONSTRAINT `service_category_ibfk_1` FOREIGN KEY (`service_type_id`) REFERENCES `service_type` (`service_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service_items`
--

DROP TABLE IF EXISTS `service_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_items` (
  `service_item_id` int NOT NULL AUTO_INCREMENT,
  `service_item_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_category_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_item_id`),
  KEY `service_category_id` (`service_category_id`),
  CONSTRAINT `service_items_ibfk_1` FOREIGN KEY (`service_category_id`) REFERENCES `service_category` (`service_category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service_type`
--

DROP TABLE IF EXISTS `service_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_type` (
  `service_type_id` int NOT NULL AUTO_INCREMENT,
  `service_type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','manager','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_acts`
--

DROP TABLE IF EXISTS `vehicle_acts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_acts` (
  `act_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `insurance_company` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_paid_date` date NOT NULL,
  `expire_date` date NOT NULL,
  `premium_amount` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_act_expire` (`expire_date`),
  CONSTRAINT `vehicle_acts_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_act_dates` CHECK ((`expire_date` > `last_paid_date`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_insurances`
--

DROP TABLE IF EXISTS `vehicle_insurances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_insurances` (
  `insurance_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `insurance_company` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_paid_date` date NOT NULL,
  `expire_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`insurance_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_insurance_expire` (`expire_date`),
  CONSTRAINT `vehicle_insurances_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_insurance_dates` CHECK ((`expire_date` > `last_paid_date`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_taxes`
--

DROP TABLE IF EXISTS `vehicle_taxes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_taxes` (
  `tax_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `last_paid_date` date NOT NULL,
  `expire_date` date NOT NULL,
  `fee_amount` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tax_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_tax_expire` (`expire_date`),
  CONSTRAINT `vehicle_taxes_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_tax_dates` CHECK ((`expire_date` > `last_paid_date`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicle_type`
--

DROP TABLE IF EXISTS `vehicle_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_type` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `brand_model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plate_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plate_province_id` int NOT NULL,
  `driver_id` int DEFAULT NULL,
  `type_id` int DEFAULT NULL,
  `deleted` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`vehicle_id`),
  UNIQUE KEY `uq_plate` (`plate_number`,`plate_province_id`),
  KEY `driver_id` (`driver_id`),
  KEY `plate_province_id` (`plate_province_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `vehicles_ibfk_2` FOREIGN KEY (`plate_province_id`) REFERENCES `provinces` (`province_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `vehicles_ibfk_3` FOREIGN KEY (`type_id`) REFERENCES `vehicle_type` (`type_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `view_document_expiry`
--

DROP TABLE IF EXISTS `view_document_expiry`;
/*!50001 DROP VIEW IF EXISTS `view_document_expiry`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_document_expiry` AS SELECT 
 1 AS `document_type`,
 1 AS `document_id`,
 1 AS `vehicle_id`,
 1 AS `plate_number`,
 1 AS `plate_province`,
 1 AS `provider`,
 1 AS `last_paid_date`,
 1 AS `expire_date`,
 1 AS `days_remaining`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_maintenance_line_items`
--

DROP TABLE IF EXISTS `view_maintenance_line_items`;
/*!50001 DROP VIEW IF EXISTS `view_maintenance_line_items`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_maintenance_line_items` AS SELECT 
 1 AS `detail_id`,
 1 AS `maintenance_id`,
 1 AS `vehicle_id`,
 1 AS `plate_number`,
 1 AS `service_date`,
 1 AS `service_type_id`,
 1 AS `service_type_name`,
 1 AS `service_category_id`,
 1 AS `service_category_name`,
 1 AS `service_item_id`,
 1 AS `service_item_name`,
 1 AS `quantity`,
 1 AS `unit_price`,
 1 AS `line_total`,
 1 AS `remark`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_maintenance_summary`
--

DROP TABLE IF EXISTS `view_maintenance_summary`;
/*!50001 DROP VIEW IF EXISTS `view_maintenance_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_maintenance_summary` AS SELECT 
 1 AS `maintenance_id`,
 1 AS `vehicle_id`,
 1 AS `plate_number`,
 1 AS `plate_province`,
 1 AS `service_date`,
 1 AS `garage_name`,
 1 AS `garage_type`,
 1 AS `receipt_number`,
 1 AS `mileage`,
 1 AS `next_service_mileage`,
 1 AS `total_items`,
 1 AS `total_cost`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_violation_detail`
--

DROP TABLE IF EXISTS `view_violation_detail`;
/*!50001 DROP VIEW IF EXISTS `view_violation_detail`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_violation_detail` AS SELECT 
 1 AS `violation_id`,
 1 AS `incident_datetime`,
 1 AS `fine`,
 1 AS `is_paid`,
 1 AS `driver_id`,
 1 AS `driver_name`,
 1 AS `driver_phone`,
 1 AS `vehicle_id`,
 1 AS `plate_number`,
 1 AS `plate_province`,
 1 AS `reason_id`,
 1 AS `reason_name`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `violations`
--

DROP TABLE IF EXISTS `violations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violations` (
  `violation_id` int NOT NULL AUTO_INCREMENT,
  `driver_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  `reason_id` int NOT NULL,
  `incident_datetime` datetime DEFAULT NULL,
  `fine` decimal(8,2) NOT NULL DEFAULT '0.00',
  `is_paid` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`violation_id`),
  KEY `driver_id` (`driver_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `reason_id` (`reason_id`),
  KEY `idx_violation_incident_datetime` (`incident_datetime`),
  CONSTRAINT `violations_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `violations_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `violations_ibfk_3` FOREIGN KEY (`reason_id`) REFERENCES `violations_reasons` (`reason_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `violations_reasons`
--

DROP TABLE IF EXISTS `violations_reasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violations_reasons` (
  `reason_id` int NOT NULL AUTO_INCREMENT,
  `reason_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`reason_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'car_company'
--

--
-- Dumping routines for database 'car_company'
--

--
-- Final view structure for view `view_document_expiry`
--

/*!50001 DROP VIEW IF EXISTS `view_document_expiry`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_document_expiry` AS select 'tax' AS `document_type`,`t`.`tax_id` AS `document_id`,`t`.`vehicle_id` AS `vehicle_id`,`v`.`plate_number` AS `plate_number`,`p`.`name_th` AS `plate_province`,NULL AS `provider`,`t`.`last_paid_date` AS `last_paid_date`,`t`.`expire_date` AS `expire_date`,(to_days(`t`.`expire_date`) - to_days(curdate())) AS `days_remaining` from ((`vehicle_taxes` `t` join `vehicles` `v` on((`v`.`vehicle_id` = `t`.`vehicle_id`))) join `provinces` `p` on((`p`.`province_id` = `v`.`plate_province_id`))) where (`v`.`deleted` = 0) union all select 'act' AS `document_type`,`a`.`act_id` AS `document_id`,`a`.`vehicle_id` AS `vehicle_id`,`v`.`plate_number` AS `plate_number`,`p`.`name_th` AS `plate_province`,`a`.`insurance_company` AS `provider`,`a`.`last_paid_date` AS `last_paid_date`,`a`.`expire_date` AS `expire_date`,(to_days(`a`.`expire_date`) - to_days(curdate())) AS `days_remaining` from ((`vehicle_acts` `a` join `vehicles` `v` on((`v`.`vehicle_id` = `a`.`vehicle_id`))) join `provinces` `p` on((`p`.`province_id` = `v`.`plate_province_id`))) where (`v`.`deleted` = 0) union all select 'insurance' AS `document_type`,`i`.`insurance_id` AS `document_id`,`i`.`vehicle_id` AS `vehicle_id`,`v`.`plate_number` AS `plate_number`,`p`.`name_th` AS `plate_province`,`i`.`insurance_company` AS `provider`,`i`.`last_paid_date` AS `last_paid_date`,`i`.`expire_date` AS `expire_date`,(to_days(`i`.`expire_date`) - to_days(curdate())) AS `days_remaining` from ((`vehicle_insurances` `i` join `vehicles` `v` on((`v`.`vehicle_id` = `i`.`vehicle_id`))) join `provinces` `p` on((`p`.`province_id` = `v`.`plate_province_id`))) where (`v`.`deleted` = 0) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_maintenance_line_items`
--

/*!50001 DROP VIEW IF EXISTS `view_maintenance_line_items`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_maintenance_line_items` AS select `md`.`detail_id` AS `detail_id`,`md`.`maintenance_id` AS `maintenance_id`,`m`.`vehicle_id` AS `vehicle_id`,`veh`.`plate_number` AS `plate_number`,`m`.`service_date` AS `service_date`,`st`.`service_type_id` AS `service_type_id`,`st`.`service_type_name` AS `service_type_name`,`sc`.`service_category_id` AS `service_category_id`,`sc`.`service_category_name` AS `service_category_name`,`si`.`service_item_id` AS `service_item_id`,`si`.`service_item_name` AS `service_item_name`,`md`.`quantity` AS `quantity`,`md`.`unit_price` AS `unit_price`,(`md`.`quantity` * `md`.`unit_price`) AS `line_total`,`md`.`remark` AS `remark` from (((((`maintenance_details` `md` join `maintenances` `m` on((`m`.`maintenance_id` = `md`.`maintenance_id`))) join `vehicles` `veh` on((`veh`.`vehicle_id` = `m`.`vehicle_id`))) join `service_items` `si` on((`si`.`service_item_id` = `md`.`service_item_id`))) join `service_category` `sc` on((`sc`.`service_category_id` = `si`.`service_category_id`))) join `service_type` `st` on((`st`.`service_type_id` = `sc`.`service_type_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_maintenance_summary`
--

/*!50001 DROP VIEW IF EXISTS `view_maintenance_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_maintenance_summary` AS select `m`.`maintenance_id` AS `maintenance_id`,`m`.`vehicle_id` AS `vehicle_id`,`v`.`plate_number` AS `plate_number`,`p`.`name_th` AS `plate_province`,`m`.`service_date` AS `service_date`,`m`.`garage_name` AS `garage_name`,`m`.`garage_type` AS `garage_type`,`m`.`receipt_number` AS `receipt_number`,`m`.`mileage` AS `mileage`,`m`.`next_service_mileage` AS `next_service_mileage`,count(`md`.`detail_id`) AS `total_items`,coalesce(sum((`md`.`quantity` * `md`.`unit_price`)),0) AS `total_cost` from (((`maintenances` `m` join `vehicles` `v` on((`v`.`vehicle_id` = `m`.`vehicle_id`))) join `provinces` `p` on((`p`.`province_id` = `v`.`plate_province_id`))) left join `maintenance_details` `md` on((`md`.`maintenance_id` = `m`.`maintenance_id`))) group by `m`.`maintenance_id`,`m`.`vehicle_id`,`v`.`plate_number`,`p`.`name_th`,`m`.`service_date`,`m`.`garage_name`,`m`.`garage_type`,`m`.`receipt_number`,`m`.`mileage`,`m`.`next_service_mileage` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_violation_detail`
--

/*!50001 DROP VIEW IF EXISTS `view_violation_detail`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_violation_detail` AS select `vio`.`violation_id` AS `violation_id`,`vio`.`incident_datetime` AS `incident_datetime`,`vio`.`fine` AS `fine`,`vio`.`is_paid` AS `is_paid`,`d`.`driver_id` AS `driver_id`,concat(`d`.`prefix`,`d`.`first_name`,' ',`d`.`last_name`) AS `driver_name`,`d`.`phone` AS `driver_phone`,`veh`.`vehicle_id` AS `vehicle_id`,`veh`.`plate_number` AS `plate_number`,`p`.`name_th` AS `plate_province`,`r`.`reason_id` AS `reason_id`,`r`.`reason_name` AS `reason_name` from ((((`violations` `vio` join `drivers` `d` on((`d`.`driver_id` = `vio`.`driver_id`))) join `vehicles` `veh` on((`veh`.`vehicle_id` = `vio`.`vehicle_id`))) join `provinces` `p` on((`p`.`province_id` = `veh`.`plate_province_id`))) join `violations_reasons` `r` on((`r`.`reason_id` = `vio`.`reason_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-08 23:03:23
