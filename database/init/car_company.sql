-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: car_company
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Current Database: `car_company`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `car_company` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `car_company`;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_activity_logs_created` (`created_at`),
  KEY `idx_activity_logs_user` (`user_id`),
  CONSTRAINT `fk_activity_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES (1,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"bobo\")','::ffff:172.19.0.1','2026-08-19 12:19:22'),(2,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"bobo\")','::ffff:172.19.0.1','2026-08-19 12:20:43'),(3,3,'staff1','auth.login_success','user',3,'เข้าสู่ระบบสำเร็จ \"staff1\"','::ffff:172.19.0.1','2026-08-19 12:21:21'),(4,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"bobo\")','::ffff:172.19.0.1','2026-08-19 12:21:35'),(5,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-19 12:21:40'),(6,1,'admin','user.create','user',5,'เพิ่มผู้ใช้งานใหม่ \"bobo\" (สิทธิ์ admin)','::ffff:172.19.0.1','2026-08-19 12:22:34'),(7,5,'bobo','auth.login_success','user',5,'เข้าสู่ระบบสำเร็จ \"bobo\"','::ffff:172.19.0.1','2026-08-19 12:28:07'),(8,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-19 12:28:28'),(9,1,'admin','user.password_reset','user',4,'รีเซ็ตรหัสผ่านผู้ใช้งาน \"staff2\"','::ffff:172.19.0.1','2026-08-19 12:37:37'),(10,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"staff2\")','::ffff:172.19.0.1','2026-08-19 12:37:50'),(11,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"staff1\")','::ffff:172.19.0.1','2026-08-19 12:37:56'),(12,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"ิิิิิbobo\")','::ffff:172.19.0.1','2026-08-19 12:38:18'),(13,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"ิิิิิbobo\")','::ffff:172.19.0.1','2026-08-19 12:38:24'),(14,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-19 12:38:43'),(15,1,'admin','user.password_reset','user',5,'รีเซ็ตรหัสผ่านผู้ใช้งาน \"bobo\"','::ffff:172.19.0.1','2026-08-19 12:40:12'),(16,5,'bobo','auth.login_success','user',5,'เข้าสู่ระบบสำเร็จ \"bobo\"','::ffff:172.19.0.1','2026-08-19 12:40:45'),(17,5,'bobo','driver.update','driver',1,'แก้ไขข้อมูลคนขับ \"นายสมชาย ใจดี\"','::ffff:172.19.0.1','2026-08-19 12:56:40'),(18,5,'bobo','driver.delete','driver',6,'ลบคนขับ driver_id=6','::ffff:172.19.0.1','2026-08-19 12:56:49'),(19,5,'bobo','vehicle.delete','vehicle',1,'ลบรถยนต์ vehicle_id=1','::ffff:172.19.0.1','2026-08-19 12:56:55'),(20,5,'bobo','vehicle.restore','vehicle',1,'กู้คืนรถยนต์ vehicle_id=1','::ffff:172.19.0.1','2026-08-19 12:57:11'),(38,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"staff1\")','::ffff:172.19.0.1','2026-08-19 13:10:55'),(47,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-19 13:30:44'),(48,5,'bobo','vehicle.create','vehicle',10,'เพิ่มรถยนต์ทะเบียน \"4 ฉช 8765\"','::ffff:172.19.0.1','2026-08-19 13:31:45'),(49,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-19 13:35:58'),(50,3,'staff1','auth.login_success','user',3,'เข้าสู่ระบบสำเร็จ \"staff1\"','::ffff:172.19.0.1','2026-08-19 13:36:16'),(51,3,'staff1','auth.login_success','user',3,'เข้าสู่ระบบสำเร็จ \"staff1\"','::ffff:172.19.0.1','2026-08-19 13:39:30'),(52,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"admin\")','172.19.0.1','2026-08-19 14:11:56'),(53,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"admin\")','172.19.0.1','2026-08-19 14:13:34'),(54,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"admin\")','172.19.0.1','2026-08-19 14:13:35'),(55,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"admin\")','172.19.0.1','2026-08-19 14:13:35'),(56,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"admin\")','172.19.0.1','2026-08-19 14:13:36'),(57,3,'staff1','auth.login_success','user',3,'เข้าสู่ระบบสำเร็จ \"staff1\"','::ffff:172.19.0.1','2026-08-25 13:56:37'),(58,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-25 13:56:45'),(59,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-25 14:33:23'),(60,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-25 14:34:20'),(61,NULL,'system','auth.login_failed','user',NULL,'เข้าสู่ระบบไม่สำเร็จ (username: \"admin\")','::ffff:172.19.0.1','2026-08-25 14:36:25'),(62,1,'admin','auth.login_success','user',1,'เข้าสู่ระบบสำเร็จ \"admin\"','::ffff:172.19.0.1','2026-08-25 15:52:31');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `driver_id` int NOT NULL AUTO_INCREMENT,
  `prefix` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hire_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`driver_id`),
  UNIQUE KEY `phone` (`phone`) /*!80000 INVISIBLE */,
  UNIQUE KEY `drivername` (`first_name`,`last_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,'นาย','สมชาย','ใจดี','0891234567','2022-01-15 00:00:00',0,'2026-08-10 14:56:22','2026-08-19 12:56:40'),(2,'นาย','วิชัย','รักงาน','0812345678','2022-03-01 00:00:00',0,'2026-08-10 14:56:22','2026-08-14 16:41:19'),(3,'นาง','สุนีย์','ขยันดี','0898765432','2023-05-19 17:00:00',0,'2026-08-10 14:56:22','2026-08-14 16:37:19'),(4,'นาย','ประยุทธ','มั่นคง','0865554321','2021-11-09 17:00:00',0,'2026-08-10 14:56:22','2026-08-17 12:22:42'),(5,'นาย','อนุชา','พากเพียร','0876543210','2024-01-31 17:00:00',1,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(6,'นาย','ชนแหลก','แหกประกัน','0621378901','2026-08-01 00:00:00',1,'2026-08-14 16:17:12','2026-08-19 12:56:49'),(8,'นาย','สมหมาย','ใจกล้า','0839578888','2026-08-18 00:00:00',0,'2026-08-17 17:57:03','2026-08-17 17:57:03');
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

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
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`detail_id`),
  KEY `service_item_id` (`service_item_id`),
  KEY `maintenance_id` (`maintenance_id`),
  CONSTRAINT `maintenance_details_ibfk_1` FOREIGN KEY (`service_item_id`) REFERENCES `service_items` (`service_item_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `maintenance_details_ibfk_2` FOREIGN KEY (`maintenance_id`) REFERENCES `maintenances` (`maintenance_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_details`
--

LOCK TABLES `maintenance_details` WRITE;
/*!40000 ALTER TABLE `maintenance_details` DISABLE KEYS */;
INSERT INTO `maintenance_details` VALUES (1,1,6,4.00,320.00,'เปลี่ยนน้ำมันเครื่องตามรอบ','2026-08-10 14:56:22','2026-08-10 14:56:22'),(2,1,7,1.00,250.00,NULL,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,1,8,1.00,180.00,NULL,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(4,2,11,1.00,850.00,'ผ้าเบรกหน้าใกล้หมด เปลี่ยนก่อนกำหนด','2026-08-10 14:56:22','2026-08-10 14:56:22'),(5,2,6,4.00,300.00,NULL,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(6,3,9,1.00,450.00,'เติมน้ำมันเบรกให้เต็มระดับ','2026-08-10 14:56:22','2026-08-10 14:56:22'),(7,4,14,4.00,2800.00,'เปลี่ยนยางทั้ง 4 เส้น','2026-08-10 14:56:22','2026-08-10 14:56:22');
/*!40000 ALTER TABLE `maintenance_details` ENABLE KEYS */;
UNLOCK TABLES;

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
  `garage_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `garage_type` enum('center','shop') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_number` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mileage` int NOT NULL,
  `next_service_mileage` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`maintenance_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_maintenance_service_date` (`service_date`),
  CONSTRAINT `maintenances_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenances`
--

LOCK TABLES `maintenances` WRITE;
/*!40000 ALTER TABLE `maintenances` DISABLE KEYS */;
INSERT INTO `maintenances` VALUES (1,1,'2026-07-01','ศูนย์บริการ Toyota สาขารามอินทรา','center','RCP-2026-0001',45000,50000,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(2,2,'2026-06-15','อู่ช่างแดง ออโต้เซอร์วิส','shop','RCP-2026-0002',78000,83000,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,3,'2026-07-20','ศูนย์บริการ Honda สาขาชลบุรี','center','RCP-2026-0003',22000,27000,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(4,4,'2026-05-30','อู่ป้าแอ๋ว การช่าง','shop',NULL,61000,66000,'2026-08-10 14:56:22','2026-08-10 14:56:22');
/*!40000 ALTER TABLE `maintenances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provinces` (
  `province_id` int NOT NULL AUTO_INCREMENT,
  `name_th` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`province_id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES (1,'กรุงเทพมหานคร'),(2,'กระบี่'),(3,'กาญจนบุรี'),(4,'กาฬสินธุ์'),(5,'กำแพงเพชร'),(6,'ขอนแก่น'),(7,'จันทบุรี'),(8,'ฉะเชิงเทรา'),(9,'ชลบุรี'),(10,'ชัยนาท'),(11,'ชัยภูมิ'),(12,'ชุมพร'),(13,'เชียงราย'),(14,'เชียงใหม่'),(15,'ตรัง'),(16,'ตราด'),(17,'ตาก'),(18,'นครนายก'),(19,'นครปฐม'),(20,'นครพนม'),(21,'นครราชสีมา'),(22,'นครศรีธรรมราช'),(23,'นครสวรรค์'),(24,'นนทบุรี'),(25,'นราธิวาส'),(26,'น่าน'),(27,'บึงกาฬ'),(28,'บุรีรัมย์'),(29,'ปทุมธานี'),(30,'ประจวบคีรีขันธ์'),(31,'ปราจีนบุรี'),(32,'ปัตตานี'),(33,'พระนครศรีอยุธยา'),(34,'พะเยา'),(35,'พังงา'),(36,'พัทลุง'),(37,'พิจิตร'),(38,'พิษณุโลก'),(39,'เพชรบุรี'),(40,'เพชรบูรณ์'),(41,'แพร่'),(42,'ภูเก็ต'),(43,'มหาสารคาม'),(44,'มุกดาหาร'),(45,'แม่ฮ่องสอน'),(46,'ยโสธร'),(47,'ยะลา'),(48,'ร้อยเอ็ด'),(49,'ระนอง'),(50,'ระยอง'),(51,'ราชบุรี'),(52,'ลพบุรี'),(53,'ลำปาง'),(54,'ลำพูน'),(55,'เลย'),(56,'ศรีสะเกษ'),(57,'สกลนคร'),(58,'สงขลา'),(59,'สตูล'),(60,'สมุทรปราการ'),(61,'สมุทรสงคราม'),(62,'สมุทรสาคร'),(63,'สระแก้ว'),(64,'สระบุรี'),(65,'สิงห์บุรี'),(66,'สุโขทัย'),(67,'สุพรรณบุรี'),(68,'สุราษฎร์ธานี'),(69,'สุรินทร์'),(70,'หนองคาย'),(71,'หนองบัวลำภู'),(72,'อ่างทอง'),(73,'อำนาจเจริญ'),(74,'อุดรธานี'),(75,'อุตรดิตถ์'),(76,'อุทัยธานี'),(77,'อุบลราชธานี');
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_category`
--

DROP TABLE IF EXISTS `service_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_category` (
  `service_category_id` int NOT NULL AUTO_INCREMENT,
  `service_category_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_type_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_category_id`),
  KEY `service_type_id` (`service_type_id`),
  CONSTRAINT `service_category_ibfk_1` FOREIGN KEY (`service_type_id`) REFERENCES `service_type` (`service_type_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_category`
--

LOCK TABLES `service_category` WRITE;
/*!40000 ALTER TABLE `service_category` DISABLE KEYS */;
INSERT INTO `service_category` VALUES (1,'ซ่อมระบบเบรก',1,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(2,'ซ่อมระบบไฟฟ้า',1,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,'ซ่อมช่วงล่าง',1,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(4,'เปลี่ยนของเหลวเครื่องยนต์',2,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(5,'เปลี่ยนอะไหล่เบรก',2,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(6,'เปลี่ยนยางและล้อ',2,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(7,'เปลี่ยนแบตเตอรี่',2,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(8,'ตรวจเช็คระยะตามกำหนด',3,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(9,'ตรวจเช็คระบบเบรก',3,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(10,'ซ่อมเครื่องยนต์',1,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(11,'ซ่อมระบบเกียร์',1,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(12,'ซ่อมระบบแอร์',1,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(13,'ซ่อมตัวถังและสี',1,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(14,'ซ่อมกระจกและไฟส่องสว่าง',1,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(15,'ซ่อมระบบไอเสีย',1,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(16,'ซ่อมระบบเชื้อเพลิง',1,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(17,'เปลี่ยนอะไหล่เครื่องยนต์',2,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(18,'เปลี่ยนไส้กรองแอร์',2,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(19,'เปลี่ยนไฟส่องสว่าง',2,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(20,'เปลี่ยนอุปกรณ์เบ็ดเตล็ด',2,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(21,'ตรวจเช็คยางและล้อ',3,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(22,'ตรวจเช็คระบบแอร์',3,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(23,'ตรวจเช็คระบบไฟฟ้าและแบตเตอรี่',3,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(24,'ตรวจสภาพตามกฎหมาย',3,'2026-08-19 00:00:00','2026-08-19 00:00:00');
/*!40000 ALTER TABLE `service_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_items`
--

DROP TABLE IF EXISTS `service_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_items` (
  `service_item_id` int NOT NULL AUTO_INCREMENT,
  `service_item_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `service_category_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_item_id`),
  KEY `service_category_id` (`service_category_id`),
  CONSTRAINT `service_items_ibfk_1` FOREIGN KEY (`service_category_id`) REFERENCES `service_category` (`service_category_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_items`
--

LOCK TABLES `service_items` WRITE;
/*!40000 ALTER TABLE `service_items` DISABLE KEYS */;
INSERT INTO `service_items` VALUES (1,'ซ่อมคาลิปเปอร์เบรกรั่ว',1,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(2,'ซ่อมระบบไฮดรอลิกเบรก',1,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,'ซ่อมไดชาร์จ',2,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(4,'ซ่อมระบบสายไฟ',2,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(5,'ซ่อมโช้คอัพรั่ว',3,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(6,'เปลี่ยนน้ำมันเครื่อง 5W-30 สังเคราะห์แท้',4,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(7,'เปลี่ยนไส้กรองน้ำมันเครื่อง',4,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(8,'เปลี่ยนไส้กรองอากาศ',4,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(9,'เปลี่ยนน้ำมันเบรก DOT4',4,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(10,'เปลี่ยนน้ำยาหล่อเย็นเครื่องยนต์',4,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(11,'เปลี่ยนผ้าเบรกหน้า',5,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(12,'เปลี่ยนผ้าเบรกหลัง',5,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(13,'เปลี่ยนจานเบรก',5,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(14,'เปลี่ยนยางรถยนต์ 205/60R16',6,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(15,'เปลี่ยนแบตเตอรี่รถยนต์ 12V 60Ah',7,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(16,'ตรวจเช็คระยะ 10,000 กม.',8,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(17,'ตรวจเช็คระยะ 50,000 กม.',8,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(18,'ตรวจเช็คระดับน้ำมันเบรกและผ้าเบรก',9,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(19,'เครื่องยนต์สะดุด/เดินไม่เรียบ',10,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(20,'น้ำมันเครื่องรั่วซึม',10,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(21,'ไฟ Check Engine ติด',10,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(22,'ซ่อมปั๊มน้ำ',10,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(23,'ซ่อมหม้อน้ำรั่ว',10,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(24,'เกียร์กระตุก/ลื่น',11,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(25,'น้ำมันเกียร์รั่ว',11,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(26,'ซ่อมคลัตช์',11,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(27,'คอมแอร์เสีย',12,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(28,'น้ำยาแอร์รั่ว',12,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(29,'แอร์ไม่เย็น/พัดลมแอร์เสีย',12,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(30,'ซ่อมรอยขีดข่วน/บุบ',13,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(31,'พ่นสีใหม่',13,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(32,'ซ่อมกันชนหน้า/หลัง',13,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(33,'เปลี่ยนกระจกบังลมหน้าแตก/ร้าว',14,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(34,'ซ่อมไฟหน้า/ไฟท้ายแตก',14,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(35,'ซ่อมท่อไอเสียรั่ว/ผุ',15,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(36,'ซ่อมเครื่องฟอกไอเสีย',15,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(37,'ซ่อมปั๊มน้ำมันเชื้อเพลิง',16,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(38,'ซ่อมหัวฉีด',16,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(39,'เปลี่ยนน้ำมันเกียร์',4,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(40,'เติมน้ำยาฉีดกระจก',4,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(41,'เปลี่ยนผ้าเบรกมือ',5,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(42,'เปลี่ยนยางอะไหล่',6,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(43,'เปลี่ยนจุ๊บลมยาง',6,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(44,'เปลี่ยนหัวเทียน',17,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(45,'เปลี่ยนสายพานราวลิ้น',17,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(46,'เปลี่ยนสายพานหน้าเครื่อง',17,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(47,'เปลี่ยนกรองน้ำมันเชื้อเพลิง',17,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(48,'เปลี่ยนไส้กรองแอร์ห้องโดยสาร',18,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(49,'เปลี่ยนหลอดไฟหน้า',19,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(50,'เปลี่ยนหลอดไฟท้าย',19,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(51,'เปลี่ยนหลอดไฟเลี้ยว',19,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(52,'เปลี่ยนใบปัดน้ำฝน',20,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(53,'เปลี่ยนกระจกมองข้าง',20,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(54,'ตรวจเช็คระยะ 5,000 กม.',8,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(55,'ตรวจเช็คระยะ 20,000 กม.',8,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(56,'ตรวจเช็คระยะ 40,000 กม.',8,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(57,'ตรวจเช็คระยะ 100,000 กม.',8,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(58,'ตรวจเช็คลมยาง',21,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(59,'ตรวจเช็ค/ตั้งศูนย์ถ่วงล้อ',21,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(60,'ตรวจเช็คดอกยาง',21,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(61,'ตรวจเช็คน้ำยาแอร์',22,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(62,'ตรวจเช็คแรงดันแบตเตอรี่',23,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(63,'ตรวจเช็คไฟส่องสว่างรอบคัน',23,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(64,'ตรวจสภาพรถประจำปี (ตรอ.)',24,'2026-08-19 00:00:00','2026-08-19 00:00:00'),(65,'ตรวจเช็คถังดับเพลิง/อุปกรณ์ฉุกเฉิน',24,'2026-08-19 00:00:00','2026-08-19 00:00:00');
/*!40000 ALTER TABLE `service_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_type`
--

DROP TABLE IF EXISTS `service_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_type` (
  `service_type_id` int NOT NULL AUTO_INCREMENT,
  `service_type_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_type`
--

LOCK TABLES `service_type` WRITE;
/*!40000 ALTER TABLE `service_type` DISABLE KEYS */;
INSERT INTO `service_type` VALUES (1,'ซ่อม','2026-08-10 14:56:22','2026-08-10 14:56:22'),(2,'เปลี่ยน','2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,'ตรวจเช็ค','2026-08-10 14:56:22','2026-08-10 14:56:22');
/*!40000 ALTER TABLE `service_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','manager','staff') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$12$/Y5CJrRFIae04dWCX1A3vuXQN3VwIlmQVaTFQjPsVAjx5XW8nH59O','admin',1,'2026-08-25 15:52:31','2026-08-10 14:56:22','2026-08-25 15:52:31'),(2,'manager','$2b$12$F97WmnT2zt97YIf2B4AAKux85u7Ca3PoLFuilY0jkpgf6kghMSH7m','manager',1,NULL,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,'staff1','$2b$12$F97WmnT2zt97YIf2B4AAKux85u7Ca3PoLFuilY0jkpgf6kghMSH7m','staff',1,'2026-08-25 13:56:37','2026-08-10 14:56:22','2026-08-25 13:56:37'),(4,'staff2','$2b$12$RHHaWUMEC2nxW2yAMbUv1uzgWERDR8BxUbJ8OyWntpKjrWI10alrC','staff',0,NULL,'2026-08-10 14:56:22','2026-08-19 12:37:37'),(5,'bobo','$2b$12$NCrWqsRMVc48MSuu2rPPieBEZK3tMjtWJUI3jO60ybFSbyxg6.DlO','admin',1,'2026-08-19 12:40:45','2026-08-19 12:22:34','2026-08-19 12:40:45');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_act_tax`
--

DROP TABLE IF EXISTS `vehicle_act_tax`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_act_tax` (
  `act_tax_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `insurance_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_paid_date` date NOT NULL,
  `expire_date` date NOT NULL,
  `premium_amount` decimal(8,2) NOT NULL,
  `fee_amount` decimal(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_tax_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_act_tax_expire` (`expire_date`),
  CONSTRAINT `vehicle_act_tax_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_act_tax_dates` CHECK ((`expire_date` > `last_paid_date`))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_act_tax`
--

LOCK TABLES `vehicle_act_tax` WRITE;
/*!40000 ALTER TABLE `vehicle_act_tax` DISABLE KEYS */;
INSERT INTO `vehicle_act_tax` VALUES (1,1,'บริษัท กลางคุ้มครองผู้ประสบภัยจากรถ จำกัด','2025-08-01','2026-08-01',645.21,1200.00,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(2,2,'บริษัท วิริยะประกันภัย จำกัด (มหาชน)','2025-09-15','2026-09-15',1182.35,2100.00,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,3,'บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)','2025-07-20','2026-08-20',645.21,800.00,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(4,4,'บริษัท กลางคุ้มครองผู้ประสบภัยจากรถ จำกัด','2025-08-05','2026-08-15',967.28,1500.00,'2026-08-10 14:56:22','2026-08-10 14:56:22'),(5,5,'บริษัท ทิพยประกันภัย จำกัด (มหาชน)','2025-06-10','2026-06-10',1546.51,3200.00,'2026-08-10 14:56:22','2026-08-10 14:56:22');
/*!40000 ALTER TABLE `vehicle_act_tax` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_insurances`
--

DROP TABLE IF EXISTS `vehicle_insurances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_insurances` (
  `insurance_id` int NOT NULL AUTO_INCREMENT,
  `vehicle_id` int NOT NULL,
  `insurance_company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_paid_date` date NOT NULL,
  `expire_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`insurance_id`),
  KEY `vehicle_id` (`vehicle_id`),
  KEY `idx_insurance_expire` (`expire_date`),
  CONSTRAINT `vehicle_insurances_ibfk_1` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_insurance_dates` CHECK ((`expire_date` > `last_paid_date`))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_insurances`
--

LOCK TABLES `vehicle_insurances` WRITE;
/*!40000 ALTER TABLE `vehicle_insurances` DISABLE KEYS */;
INSERT INTO `vehicle_insurances` VALUES (1,1,'บริษัท วิริยะประกันภัย จำกัด (มหาชน)','2025-08-01','2026-08-01','2026-08-10 14:56:22','2026-08-10 14:56:22'),(2,2,'บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)','2025-09-15','2026-09-15','2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,3,'บริษัท ทิพยประกันภัย จำกัด (มหาชน)','2025-07-20','2026-08-20','2026-08-10 14:56:22','2026-08-10 14:56:22'),(4,4,'บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)','2025-08-05','2026-08-15','2026-08-10 14:56:22','2026-08-10 14:56:22');
/*!40000 ALTER TABLE `vehicle_insurances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_type`
--

DROP TABLE IF EXISTS `vehicle_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicle_type` (
  `type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_type`
--

LOCK TABLES `vehicle_type` WRITE;
/*!40000 ALTER TABLE `vehicle_type` DISABLE KEYS */;
INSERT INTO `vehicle_type` VALUES (1,'รถกระบะ','#f97316','2026-08-10 14:56:22','2026-08-25 14:35:18'),(2,'รถตู้','#3b82f6','2026-08-10 14:56:22','2026-08-25 14:35:18'),(3,'รถเก๋ง','#10b981','2026-08-10 14:56:22','2026-08-25 14:35:18'),(4,'รถ SUV','#a855f7','2026-08-10 14:56:22','2026-08-25 15:37:10');
/*!40000 ALTER TABLE `vehicle_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `brand_model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plate_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,'Toyota Hilux Revo 2022','1 กข 1234',1,1,1,0,'2026-08-10 14:56:22','2026-08-19 12:57:11'),(2,'Toyota Commuter 2021','2 ขค 5678',1,2,2,0,'2026-08-10 14:56:22','2026-08-11 15:18:30'),(3,'Honda City 2023','กท 9956',9,3,3,0,'2026-08-10 14:56:22','2026-08-15 14:37:37'),(4,'Isuzu D-Max 2020','3 งจ 4321',14,4,1,0,'2026-08-10 14:56:22','2026-08-11 15:18:30'),(5,'Hino 6 ล้อ 2019','4 ฉช 8765',21,NULL,4,0,'2026-08-10 14:56:22','2026-08-11 15:18:30'),(6,'Hyundai H-1','1 กจ 5627',21,NULL,2,0,'2026-08-15 14:39:43','2026-08-19 12:56:49'),(7,'Toyota Commuter ','1 หญ',1,NULL,2,0,'2026-08-15 14:41:24','2026-08-19 12:56:49'),(8,'React Query Test Car (edited)','ทดสอบ1826',2,NULL,NULL,1,'2026-08-16 17:14:21','2026-08-16 17:14:23'),(10,'Hino 6 ล้อ 2019','4 ฉช 8765',1,NULL,4,0,'2026-08-19 13:31:45','2026-08-19 13:31:45');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `view_current_documents`
--

DROP TABLE IF EXISTS `view_current_documents`;
/*!50001 DROP VIEW IF EXISTS `view_current_documents`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_current_documents` AS SELECT 
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
-- Temporary view structure for view `view_dashboard_overview`
--

DROP TABLE IF EXISTS `view_dashboard_overview`;
/*!50001 DROP VIEW IF EXISTS `view_dashboard_overview`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_dashboard_overview` AS SELECT 
 1 AS `total_vehicles`,
 1 AS `total_drivers`,
 1 AS `vehicles_without_driver`,
 1 AS `vehicles_without_insurance`,
 1 AS `act_tax_expiring_30d`,
 1 AS `act_tax_expired`,
 1 AS `insurance_expiring_30d`,
 1 AS `insurance_expired`,
 1 AS `documents_expiring_30d_total`,
 1 AS `documents_expired_total`,
 1 AS `unpaid_violations_count`,
 1 AS `unpaid_violations_total_fine`,
 1 AS `violations_this_month`,
 1 AS `maintenances_this_month`,
 1 AS `maintenance_cost_this_month`*/;
SET character_set_client = @saved_cs_client;

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
 1 AS `model`,
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violations`
--

LOCK TABLES `violations` WRITE;
/*!40000 ALTER TABLE `violations` DISABLE KEYS */;
INSERT INTO `violations` VALUES (1,1,1,1,'2026-06-10 14:23:00',1000.00,0,'2026-08-10 14:56:22','2026-08-17 17:56:13'),(2,2,2,3,'2026-07-02 09:15:00',500.00,1,'2026-08-10 14:56:22','2026-08-17 18:12:19'),(3,3,3,2,'2026-07-18 17:40:00',1000.00,1,'2026-08-10 14:56:22','2026-08-17 18:09:32'),(4,4,4,5,'2026-05-25 11:05:00',400.00,0,'2026-08-10 14:56:22','2026-08-17 17:40:13');
/*!40000 ALTER TABLE `violations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `violations_reasons`
--

DROP TABLE IF EXISTS `violations_reasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `violations_reasons` (
  `reason_id` int NOT NULL AUTO_INCREMENT,
  `reason_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`reason_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `violations_reasons`
--

LOCK TABLES `violations_reasons` WRITE;
/*!40000 ALTER TABLE `violations_reasons` DISABLE KEYS */;
INSERT INTO `violations_reasons` VALUES (1,'ขับรถเร็วเกินกำหนด','2026-08-10 14:56:22','2026-08-10 14:56:22'),(2,'ฝ่าฝืนสัญญาณไฟจราจร','2026-08-10 14:56:22','2026-08-10 14:56:22'),(3,'จอดรถในที่ห้ามจอด','2026-08-10 14:56:22','2026-08-10 14:56:22'),(4,'ไม่คาดเข็มขัดนิรภัย','2026-08-10 14:56:22','2026-08-10 14:56:22'),(5,'ใช้โทรศัพท์ขณะขับรถ','2026-08-10 14:56:22','2026-08-10 14:56:22'),(6,'ฝ่าฝืนเขตจำกัดความเร็ว (เขตโรงเรียน/ชุมชน)','2026-08-19 11:09:31','2026-08-19 11:09:31'),(7,'จอดรถซ้อนคัน/กีดขวางการจราจร','2026-08-19 11:09:31','2026-08-19 11:09:31'),(8,'ขับรถบนทางเท้า','2026-08-19 11:09:31','2026-08-19 11:09:31'),(9,'เมาแล้วขับ','2026-08-19 11:09:31','2026-08-19 11:09:31'),(10,'ขับรถขณะง่วงนอน/สภาพร่างกายไม่พร้อม','2026-08-19 11:09:31','2026-08-19 11:09:31'),(11,'ขับรถย้อนศร/สวนเลน','2026-08-19 11:09:31','2026-08-19 11:09:31'),(12,'แซงในที่คับขัน/เส้นทึบ','2026-08-19 11:09:31','2026-08-19 11:09:31'),(13,'เปลี่ยนช่องทางกะทันหันไม่ปลอดภัย','2026-08-19 11:09:31','2026-08-19 11:09:31'),(14,'ไม่ให้สัญญาณไฟเลี้ยว','2026-08-19 11:09:31','2026-08-19 11:09:31'),(15,'ไม่หยุดให้คนข้ามทางม้าลาย','2026-08-19 11:09:31','2026-08-19 11:09:31'),(16,'ขับรถโดยประมาทเป็นเหตุให้ทรัพย์สินผู้อื่นเสียหาย','2026-08-19 11:09:31','2026-08-19 11:09:31'),(17,'ขับรถโดยประมาทเป็นเหตุให้ผู้อื่นได้รับบาดเจ็บ/เสียชีวิต','2026-08-19 11:09:31','2026-08-19 11:09:31'),(18,'ไม่มีใบขับขี่/ใบขับขี่หมดอายุ','2026-08-19 11:09:31','2026-08-19 11:09:31'),(19,'ไม่พกเอกสารประจำรถ (พรบ./ทะเบียน)','2026-08-19 11:09:31','2026-08-19 11:09:31'),(20,'ป้ายทะเบียนไม่ชัดเจน/ไม่ติดป้ายทะเบียน','2026-08-19 11:09:31','2026-08-19 11:09:31'),(21,'บรรทุกน้ำหนักเกินกำหนด','2026-08-19 11:09:31','2026-08-19 11:09:31'),(22,'ฝ่าฝืนเครื่องหมาย/ป้ายจราจร','2026-08-19 11:09:31','2026-08-19 11:09:31'),(23,'หลบเลี่ยงด่านตรวจ','2026-08-19 11:09:31','2026-08-19 11:09:31');
/*!40000 ALTER TABLE `violations_reasons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `car_company`
--

USE `car_company`;

--
-- Final view structure for view `view_current_documents`
--

/*!50001 DROP VIEW IF EXISTS `view_current_documents`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_current_documents` AS select `ranked`.`document_type` AS `document_type`,`ranked`.`document_id` AS `document_id`,`ranked`.`vehicle_id` AS `vehicle_id`,`ranked`.`plate_number` AS `plate_number`,`ranked`.`plate_province` AS `plate_province`,`ranked`.`provider` AS `provider`,`ranked`.`last_paid_date` AS `last_paid_date`,`ranked`.`expire_date` AS `expire_date`,`ranked`.`days_remaining` AS `days_remaining` from (select `vde`.`document_type` AS `document_type`,`vde`.`document_id` AS `document_id`,`vde`.`vehicle_id` AS `vehicle_id`,`vde`.`plate_number` AS `plate_number`,`vde`.`plate_province` AS `plate_province`,`vde`.`provider` AS `provider`,`vde`.`last_paid_date` AS `last_paid_date`,`vde`.`expire_date` AS `expire_date`,`vde`.`days_remaining` AS `days_remaining`,row_number() OVER (PARTITION BY `vde`.`document_type`,`vde`.`vehicle_id` ORDER BY `vde`.`expire_date` desc )  AS `rn` from `view_document_expiry` `vde`) `ranked` where (`ranked`.`rn` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_dashboard_overview`
--

/*!50001 DROP VIEW IF EXISTS `view_dashboard_overview`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `view_dashboard_overview` AS select (select count(0) from `vehicles` where (`vehicles`.`deleted` = 0)) AS `total_vehicles`,(select count(0) from `drivers` where (`drivers`.`deleted` = 0)) AS `total_drivers`,(select count(0) from `vehicles` where ((`vehicles`.`deleted` = 0) and (`vehicles`.`driver_id` is null))) AS `vehicles_without_driver`,(select count(0) from `vehicles` `v` where ((`v`.`deleted` = 0) and exists(select 1 from `vehicle_insurances` `vi` where (`vi`.`vehicle_id` = `v`.`vehicle_id`)) is false)) AS `vehicles_without_insurance`,(select count(0) from `view_current_documents` where ((`view_current_documents`.`document_type` = 'act_tax') and (`view_current_documents`.`days_remaining` between 0 and 30))) AS `act_tax_expiring_30d`,(select count(0) from `view_current_documents` where ((`view_current_documents`.`document_type` = 'act_tax') and (`view_current_documents`.`days_remaining` < 0))) AS `act_tax_expired`,(select count(0) from `view_current_documents` where ((`view_current_documents`.`document_type` = 'insurance') and (`view_current_documents`.`days_remaining` between 0 and 30))) AS `insurance_expiring_30d`,(select count(0) from `view_current_documents` where ((`view_current_documents`.`document_type` = 'insurance') and (`view_current_documents`.`days_remaining` < 0))) AS `insurance_expired`,(select count(0) from `view_current_documents` where (`view_current_documents`.`days_remaining` between 0 and 30)) AS `documents_expiring_30d_total`,(select count(0) from `view_current_documents` where (`view_current_documents`.`days_remaining` < 0)) AS `documents_expired_total`,(select count(0) from `violations` where (`violations`.`is_paid` = 0)) AS `unpaid_violations_count`,(select coalesce(sum(`violations`.`fine`),0) from `violations` where (`violations`.`is_paid` = 0)) AS `unpaid_violations_total_fine`,(select count(0) from `violations` where ((year(`violations`.`incident_datetime`) = year(curdate())) and (month(`violations`.`incident_datetime`) = month(curdate())))) AS `violations_this_month`,(select count(0) from `maintenances` where ((year(`maintenances`.`service_date`) = year(curdate())) and (month(`maintenances`.`service_date`) = month(curdate())))) AS `maintenances_this_month`,(select coalesce(sum((`md`.`quantity` * `md`.`unit_price`)),0) from (`maintenances` `m` join `maintenance_details` `md` on((`md`.`maintenance_id` = `m`.`maintenance_id`))) where ((year(`m`.`service_date`) = year(curdate())) and (month(`m`.`service_date`) = month(curdate())))) AS `maintenance_cost_this_month` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

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
/*!50001 VIEW `view_document_expiry` AS select ('act_tax' collate utf8mb4_unicode_ci) AS `document_type`,`at`.`act_tax_id` AS `document_id`,`at`.`vehicle_id` AS `vehicle_id`,`v`.`plate_number` AS `plate_number`,`p`.`name_th` AS `plate_province`,`at`.`insurance_company` AS `provider`,`at`.`last_paid_date` AS `last_paid_date`,`at`.`expire_date` AS `expire_date`,(to_days(`at`.`expire_date`) - to_days(curdate())) AS `days_remaining` from ((`vehicle_act_tax` `at` join `vehicles` `v` on((`v`.`vehicle_id` = `at`.`vehicle_id`))) join `provinces` `p` on((`p`.`province_id` = `v`.`plate_province_id`))) where (`v`.`deleted` = 0) union all select ('insurance' collate utf8mb4_unicode_ci) AS `document_type`,`i`.`insurance_id` AS `document_id`,`i`.`vehicle_id` AS `vehicle_id`,`v`.`plate_number` AS `plate_number`,`p`.`name_th` AS `plate_province`,`i`.`insurance_company` AS `provider`,`i`.`last_paid_date` AS `last_paid_date`,`i`.`expire_date` AS `expire_date`,(to_days(`i`.`expire_date`) - to_days(curdate())) AS `days_remaining` from ((`vehicle_insurances` `i` join `vehicles` `v` on((`v`.`vehicle_id` = `i`.`vehicle_id`))) join `provinces` `p` on((`p`.`province_id` = `v`.`plate_province_id`))) where (`v`.`deleted` = 0) */;
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
/*!50001 VIEW `view_maintenance_summary` AS select `m`.`maintenance_id` AS `maintenance_id`,`m`.`vehicle_id` AS `vehicle_id`,`v`.`plate_number` AS `plate_number`,`v`.`brand_model` AS `model`,`p`.`name_th` AS `plate_province`,`m`.`service_date` AS `service_date`,`m`.`garage_name` AS `garage_name`,`m`.`garage_type` AS `garage_type`,`m`.`receipt_number` AS `receipt_number`,`m`.`mileage` AS `mileage`,`m`.`next_service_mileage` AS `next_service_mileage`,count(`md`.`detail_id`) AS `total_items`,coalesce(sum((`md`.`quantity` * `md`.`unit_price`)),0) AS `total_cost` from (((`maintenances` `m` join `vehicles` `v` on((`v`.`vehicle_id` = `m`.`vehicle_id`))) join `provinces` `p` on((`p`.`province_id` = `v`.`plate_province_id`))) left join `maintenance_details` `md` on((`md`.`maintenance_id` = `m`.`maintenance_id`))) group by `m`.`maintenance_id`,`m`.`vehicle_id`,`v`.`plate_number`,`p`.`name_th`,`m`.`service_date`,`m`.`garage_name`,`m`.`garage_type`,`m`.`receipt_number`,`m`.`mileage`,`m`.`next_service_mileage` */;
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

-- Dump completed on 2026-08-25 15:56:28
