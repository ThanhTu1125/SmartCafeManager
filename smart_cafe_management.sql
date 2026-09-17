-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: smart_cafe_management
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `account_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `password_changed_at` datetime(6) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime(6) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `role_id` bigint DEFAULT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `UC_ACCOUNTEMAIL_COL` (`email`),
  UNIQUE KEY `UC_ACCOUNTUSERNAME_COL` (`username`),
  KEY `FKd4vb66o896tay3yy52oqxr9w0` (`role_id`),
  CONSTRAINT `FKd4vb66o896tay3yy52oqxr9w0` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES (1,'2026-07-12 19:19:00.000000','system',NULL,'2026-09-01 20:49:11.969000','admin','codegymintern@gmail.com','$2a$10$PSTNDujCZNh.yAhPu.9dOu11jwMw.iGJnA.ZjqyMVErWBh5QZKjuG','2026-09-01 20:49:11.868000','7734a6e7-1122-472f-91e7-6ed0be6fc164','2026-07-22 22:49:15.290000','ACTIVE','admin',1),(2,'2026-07-12 19:19:00.000000','admin',NULL,'2026-09-02 00:54:18.067000',NULL,'staff01@smartcafe.com','$2a$10$e6xq.oDEnoH3bimnhZEJ7umWvKzYGDROB9aUZKKiCv.Cbha7etKl6','2026-09-02 00:54:18.010000',NULL,NULL,'ACTIVE','staff01',2),(3,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'staff02@smartcafe.com','$2a$10$tDjHK77akloaamnCYJHKw.vA6l6zl9NhVEZyLff/UCeEbRu0pUmQu','2026-07-12 19:19:00.000000',NULL,NULL,'ACTIVE','staff02',2),(4,'2026-07-12 19:19:00.000000','system',NULL,'2026-09-01 20:50:32.722000',NULL,'thanhbinhk645@gmail.com','$2a$10$B1bcANFuX/Hte0Rg34p1E.gAe5dufcNpSjhpjhYBD6WIR91F.shj.','2026-09-01 20:50:32.721000',NULL,NULL,'ACTIVE','customer01',3),(5,'2026-07-12 19:19:00.000000','system',NULL,NULL,NULL,'customer02@gmail.com','$2a$10$tDjHK77akloaamnCYJHKw.vA6l6zl9NhVEZyLff/UCeEbRu0pUmQu','2026-07-12 19:19:00.000000',NULL,NULL,'ACTIVE','customer02',3);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cafe_table`
--

DROP TABLE IF EXISTS `cafe_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cafe_table` (
  `table_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `is_occupied` bit(1) NOT NULL,
  `physical_state` varchar(255) NOT NULL,
  `service_status` varchar(255) NOT NULL,
  `table_name` varchar(255) NOT NULL,
  PRIMARY KEY (`table_id`),
  UNIQUE KEY `UC_CAFE_TABLETABLE_NAME_COL` (`table_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cafe_table`
--

LOCK TABLES `cafe_table` WRITE;
/*!40000 ALTER TABLE `cafe_table` DISABLE KEYS */;
INSERT INTO `cafe_table` VALUES (1,'2026-07-12 19:19:00.000000',NULL,NULL,'2026-09-02 01:30:12.112000',NULL,_binary '\0','GOOD','NORMAL','Bàn 01'),(2,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,_binary '\0','GOOD','NORMAL','Bàn 02'),(3,'2026-07-12 19:19:00.000000',NULL,NULL,'2026-09-02 02:11:54.060000',NULL,_binary '\0','GOOD','EMPTY','Bàn 03'),(4,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,_binary '\0','MAINTENANCE','NORMAL','Bàn 04');
/*!40000 ALTER TABLE `cafe_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `customer_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `date_of_birth` datetime(6) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `loyalty_points` int DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `account_id` bigint NOT NULL,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `UC_CUSTOMERACCOUNT_ID_COL` (`account_id`),
  UNIQUE KEY `UC_CUSTOMERPHONE_NUMBER_COL` (`phone_number`),
  CONSTRAINT `FKn9x2k8svpxj3r328iy1rpur83` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'2026-07-12 19:19:00.000000','customer01',NULL,'2026-07-17 08:24:14.370000',NULL,'123 Nguyễn Văn Linh, Đà Nẵng','1995-05-14 07:00:00.000000','Phạm Khách Hàng 1 (sửa)','MALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1784251454/lbvflfgrwhwowrafhpy9.png',100,'0905123456',4),(2,'2026-07-12 19:19:00.000000','customer02',NULL,NULL,NULL,'456 Lê Duẩn, Đà Nẵng','1998-10-20 00:00:00.000000','Đặng Khách Hàng 2','FEMALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/avatar_cus2.png',50,'0935987654',5);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `databasechangelog`
--

DROP TABLE IF EXISTS `databasechangelog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `databasechangelog` (
  `ID` varchar(255) NOT NULL,
  `AUTHOR` varchar(255) NOT NULL,
  `FILENAME` varchar(255) NOT NULL,
  `DATEEXECUTED` datetime NOT NULL,
  `ORDEREXECUTED` int NOT NULL,
  `EXECTYPE` varchar(10) NOT NULL,
  `MD5SUM` varchar(35) DEFAULT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `COMMENTS` varchar(255) DEFAULT NULL,
  `TAG` varchar(255) DEFAULT NULL,
  `LIQUIBASE` varchar(20) DEFAULT NULL,
  `CONTEXTS` varchar(255) DEFAULT NULL,
  `LABELS` varchar(255) DEFAULT NULL,
  `DEPLOYMENT_ID` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `databasechangelog`
--

LOCK TABLES `databasechangelog` WRITE;
/*!40000 ALTER TABLE `databasechangelog` DISABLE KEYS */;
INSERT INTO `databasechangelog` VALUES ('1785813881236-1','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',1,'EXECUTED','9:145535597cf2b664827e9c67c02494d6','createTable tableName=account','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-2','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',2,'EXECUTED','9:c7eb05a64b9e72d980878d6bd10df3ae','createTable tableName=cafe_table','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-3','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',3,'EXECUTED','9:53bba0632b53c47c2c5d62106dc0fc6b','createTable tableName=customer','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-4','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',4,'EXECUTED','9:d3d7d54efe2297e328f721bc28dea1c5','createTable tableName=employee','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-5','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',5,'EXECUTED','9:0c26cf27eb7a8a8e7e5eb62888c85595','createTable tableName=feedback','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-6','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',6,'EXECUTED','9:261facc172d5e9319eeecc23728a3e51','createTable tableName=item','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-7','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',7,'EXECUTED','9:8a5a411116013b0e5c273ef24e0c5966','createTable tableName=menu_category','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-8','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',8,'EXECUTED','9:2db5c38ebc08246e09a36ae18026a097','createTable tableName=news','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-9','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',9,'EXECUTED','9:0990292dc9eda4b456c80127fb025b0f','createTable tableName=order_detail','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-10','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',10,'EXECUTED','9:9425ba171166a211ac128c74840712d3','createTable tableName=role','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-11','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',11,'EXECUTED','9:ef927bcfd49ce7a49effc96da6e3ff8e','createTable tableName=table_order','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-12','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:27',12,'EXECUTED','9:e846568ef6bcae797c063f39aecc6874','addUniqueConstraint constraintName=UC_ACCOUNTEMAIL_COL, tableName=account','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-13','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',13,'EXECUTED','9:2751bfb60a7346131593d32c0ff47d89','addUniqueConstraint constraintName=UC_ACCOUNTUSERNAME_COL, tableName=account','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-14','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',14,'EXECUTED','9:66688e39c667c89cc56ca6c6fa1bd81f','addUniqueConstraint constraintName=UC_CAFE_TABLETABLE_NAME_COL, tableName=cafe_table','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-15','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',15,'EXECUTED','9:1165a7fe70551b7550d1a3a40489e084','addUniqueConstraint constraintName=UC_CUSTOMERACCOUNT_ID_COL, tableName=customer','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-16','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',16,'EXECUTED','9:4ed5962440c0fc153ad1b8983c4ea5bd','addUniqueConstraint constraintName=UC_CUSTOMERPHONE_NUMBER_COL, tableName=customer','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-17','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',17,'EXECUTED','9:6db9753c7f295f8df1f0d2d470437295','addUniqueConstraint constraintName=UC_EMPLOYEEACCOUNT_ID_COL, tableName=employee','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-18','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',18,'EXECUTED','9:44eb3fabc4ea5d2af284f01561e1402c','addUniqueConstraint constraintName=UC_EMPLOYEEPHONE_NUMBER_COL, tableName=employee','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-19','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',19,'EXECUTED','9:22343ff8f1cc9bc641879759197625fe','addUniqueConstraint constraintName=UC_ITEMITEM_CODE_COL, tableName=item','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-20','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',20,'EXECUTED','9:4e2d879b80cabba2f2d242675d6a82af','addUniqueConstraint constraintName=UC_ITEMITEM_NAME_COL, tableName=item','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-21','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',21,'EXECUTED','9:5ab3e49bbb1ee9be90981bb480b8053f','addUniqueConstraint constraintName=UC_MENU_CATEGORYCATEGORY_NAME_COL, tableName=menu_category','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-22','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',22,'EXECUTED','9:c5b2a982433f729a7b2c9ed1973fc535','addUniqueConstraint constraintName=UC_ROLEROLE_NAME_COL, tableName=role','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-23','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',23,'EXECUTED','9:f6cff3b22d4da364a94bbdfa33b2cd8e','addForeignKeyConstraint baseTableName=order_detail, constraintName=FK4dtqbi7ilse9x730y087wagm2, referencedTableName=item','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-24','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:28',24,'EXECUTED','9:57784f0100127f62be4f22928d76f4db','addForeignKeyConstraint baseTableName=table_order, constraintName=FK5tx3lr2wfe6vggtq35atnviiv, referencedTableName=customer','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-25','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:29',25,'EXECUTED','9:86596c827def5e97cc122cbc54be9d63','addForeignKeyConstraint baseTableName=item, constraintName=FK7bhw51h2808m4nbmq62pn9tco, referencedTableName=menu_category','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-26','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:29',26,'EXECUTED','9:7a07cb968bb942fe453196d897933f3b','addForeignKeyConstraint baseTableName=news, constraintName=FK9jgaemfexdg06ffxt30n6acwq, referencedTableName=account','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-27','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:29',27,'EXECUTED','9:9e266e89659870dfd953e3c91e5ec1ab','addForeignKeyConstraint baseTableName=employee, constraintName=FKcfg6ajo8oske94exynxpf7tf9, referencedTableName=account','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-28','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:29',28,'EXECUTED','9:ee7d15d912d329c39fd2dc63dc6d24c0','addForeignKeyConstraint baseTableName=account, constraintName=FKd4vb66o896tay3yy52oqxr9w0, referencedTableName=role','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-29','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:29',29,'EXECUTED','9:c79dda905d1e191c90dc22d57c015f96','addForeignKeyConstraint baseTableName=order_detail, constraintName=FKd7u0gc7kgc44yf8juueqhu8ey, referencedTableName=table_order','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-30','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:29',30,'EXECUTED','9:8fba2b9386eb1750731264dacc30dc80','addForeignKeyConstraint baseTableName=table_order, constraintName=FKkxxygsd18l03f7lqtjge09clo, referencedTableName=employee','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-31','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:30',31,'EXECUTED','9:2cd81ae1ee0fe21aad4865cf21ecf543','addForeignKeyConstraint baseTableName=feedback, constraintName=FKmb01nh42pdh08swkfwgn9lfvi, referencedTableName=item','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-32','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:30',32,'EXECUTED','9:40b78f454457fc97af9d6c4c25511192','addForeignKeyConstraint baseTableName=customer, constraintName=FKn9x2k8svpxj3r328iy1rpur83, referencedTableName=account','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-33','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:30',33,'EXECUTED','9:fa5854b64721bf11c8261feb7eae40c9','addForeignKeyConstraint baseTableName=table_order, constraintName=FKotmcbqjiyur4250cdlcn325f3, referencedTableName=cafe_table','',NULL,'4.27.0',NULL,NULL,'8268946850'),('1785813881236-34','ASUS (generated)','db/changelog/versions/v1.0-generated.yaml','2026-09-01 13:22:30',34,'EXECUTED','9:652c944b41767802b85829821c9f84d1','addForeignKeyConstraint baseTableName=feedback, constraintName=FKpi2y2j7n01ypo49fone3knjry, referencedTableName=customer','',NULL,'4.27.0',NULL,NULL,'8268946850'),('insert-sample-data-from-dump','admin','db/changelog/versions/v1.1-insert-data.yaml','2026-09-01 13:22:30',35,'EXECUTED','9:671eec1bf91a5fa2b7d5328f7ba85df0','sqlFile path=db/changelog/data/init-data.sql','',NULL,'4.27.0',NULL,NULL,'8268946850');
/*!40000 ALTER TABLE `databasechangelog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `databasechangeloglock`
--

DROP TABLE IF EXISTS `databasechangeloglock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `databasechangeloglock` (
  `ID` int NOT NULL,
  `LOCKED` tinyint NOT NULL,
  `LOCKGRANTED` datetime DEFAULT NULL,
  `LOCKEDBY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `databasechangeloglock`
--

LOCK TABLES `databasechangeloglock` WRITE;
/*!40000 ALTER TABLE `databasechangeloglock` DISABLE KEYS */;
INSERT INTO `databasechangeloglock` VALUES (1,0,NULL,NULL);
/*!40000 ALTER TABLE `databasechangeloglock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `employee_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `date_of_birth` datetime(6) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `salary` decimal(38,2) NOT NULL,
  `account_id` bigint NOT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `UC_EMPLOYEEACCOUNT_ID_COL` (`account_id`),
  UNIQUE KEY `UC_EMPLOYEEPHONE_NUMBER_COL` (`phone_number`),
  CONSTRAINT `FKcfg6ajo8oske94exynxpf7tf9` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'2026-07-12 19:19:00.000000','system',NULL,'2026-07-22 22:42:42.967000','admin','Đà Nẵng','1989-12-31 07:00:00.000000','Admin Codegym','MALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/avatar_admin.png','0377584918',15000000.00,1),(2,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'789 Trần Phú, Đà Nẵng','2000-02-14 00:00:00.000000','Trần Thị Nhân Viên 1','FEMALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/avatar_staff1.png','0912111222',8000000.00,2),(3,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'321 Bạch Đằng, Đà Nẵng','1999-12-12 00:00:00.000000','Lê Văn Nhân Viên 2','MALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/avatar_staff2.png','0988333444',8000000.00,3);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `feedback` (
  `feedback_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `content` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `rating` int NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `sent_at` datetime(6) NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `item_id` bigint DEFAULT NULL,
  PRIMARY KEY (`feedback_id`),
  KEY `FKmb01nh42pdh08swkfwgn9lfvi` (`item_id`),
  KEY `FKpi2y2j7n01ypo49fone3knjry` (`customer_id`),
  CONSTRAINT `FKmb01nh42pdh08swkfwgn9lfvi` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`),
  CONSTRAINT `FKpi2y2j7n01ypo49fone3knjry` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
INSERT INTO `feedback` VALUES (1,'2026-07-12 19:19:00.000000','customer01',NULL,NULL,NULL,'Trà đào rất ngon, phục vụ chu đáo!','customer01@gmail.com','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/feedback_photo.png',5,'Phạm Khách Hàng 1','2026-07-12 19:19:00.000000',1,3);
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item`
--

DROP TABLE IF EXISTS `item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item` (
  `item_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` bit(1) NOT NULL,
  `item_code` varchar(255) NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `price` decimal(15,0) NOT NULL,
  `total_order_count` int NOT NULL,
  `category_id` bigint DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY `UC_ITEMITEM_CODE_COL` (`item_code`),
  UNIQUE KEY `UC_ITEMITEM_NAME_COL` (`item_name`),
  KEY `FK7bhw51h2808m4nbmq62pn9tco` (`category_id`),
  CONSTRAINT `FK7bhw51h2808m4nbmq62pn9tco` FOREIGN KEY (`category_id`) REFERENCES `menu_category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item`
--

LOCK TABLES `item` WRITE;
/*!40000 ALTER TABLE `item` DISABLE KEYS */;
INSERT INTO `item` VALUES (1,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Cà phê đen đá pha phin truyền thống, đậm vị nguyên bản.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/cf_den_da.png',_binary '','CF01','Cà phê Đen Đá',25000,150,1),(2,'2026-07-12 19:19:00.000000','admin',NULL,'2026-09-02 16:37:48.298000',NULL,'Cà phê sữa đá pha phin thơm béo, đậm đà khó quên.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/cf_sua_da.png',_binary '\0','CF02','Cà phê Sữa Đá',29000,200,1),(3,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Trà đào cam sả thanh mát, giải nhiệt tức thì cho mùa hè.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/tra_dao.png',_binary '','TR01','Trà Đào Cam Sả',45000,120,2),(4,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Trà vải nhiệt đới ngọt thanh, kết hợp cùng trái vải ngâm giòn.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/tra_vai.png',_binary '','TR02','Trà Vải Nhiệt Đới',45000,90,2),(5,'2026-07-12 19:19:00.000000','admin',NULL,'2026-09-01 21:41:34.936000',NULL,'Bánh Tiramisu Ý mềm mịn, lớp kem béo ngậy vị cà phê cacao.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/tiramisu.png',_binary '','BN01','Tiramisu',35000,41,3);
/*!40000 ALTER TABLE `item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_category`
--

DROP TABLE IF EXISTS `menu_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_category` (
  `category_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `category_name` varchar(255) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `UC_MENU_CATEGORYCATEGORY_NAME_COL` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_category`
--

LOCK TABLES `menu_category` WRITE;
/*!40000 ALTER TABLE `menu_category` DISABLE KEYS */;
INSERT INTO `menu_category` VALUES (1,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,'Cà phê truyền thống'),(2,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,'Trà trái cây'),(3,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,'Bánh ngọt');
/*!40000 ALTER TABLE `menu_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `news_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `content` text,
  `image_url` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `summary` text,
  `title` varchar(255) NOT NULL,
  `account_id` bigint DEFAULT NULL,
  PRIMARY KEY (`news_id`),
  KEY `FK9jgaemfexdg06ffxt30n6acwq` (`account_id`),
  CONSTRAINT `FK9jgaemfexdg06ffxt30n6acwq` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Nội dung chi tiết chương trình khai trương dành cho khách hàng...','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/news_grand_opening.png','PUBLISHED','Tuần lễ khai trương giảm giá 20%','Khai trương hồng phát',1),(2,'2026-07-12 19:19:00.000000','staff01',NULL,'2026-09-02 17:42:01.132000',NULL,'Cùng thưởng thức menu đồ uống giải nhiệt mùa hè của Smart Cafe...','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/news_summer.png','PUBLISHED','Thử ngay Trà Vải Nhiệt Đới','Ra mắt thức uống mới',2),(3,'2026-07-12 12:32:29.972000','admin','2026-07-12 12:39:21.502000','2026-07-12 12:39:21.502000','admin','Không có gì hết ở nội dung','https://res.cloudinary.com/xqkvkmdf/image/upload/v1783859551/htyhtuz9cz7bc9vrqesx.png','PENDING','Không có gì hết ở tóm tắt','Mẫu thử',1),(4,'2026-07-15 13:23:05.974000','admin',NULL,'2026-07-28 09:46:16.140000','admin','aaaa','https://res.cloudinary.com/xqkvkmdf/image/upload/v1784121790/zn7zqisdad984ha8qs0i.png','PUBLISHED','aaaa','aaaa',1);
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_detail`
--

DROP TABLE IF EXISTS `order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_detail` (
  `order_detail_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `status` varchar(255) NOT NULL,
  `unit_price` decimal(15,0) NOT NULL,
  `item_id` bigint DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  PRIMARY KEY (`order_detail_id`),
  KEY `FK4dtqbi7ilse9x730y087wagm2` (`item_id`),
  KEY `FKd7u0gc7kgc44yf8juueqhu8ey` (`order_id`),
  CONSTRAINT `FK4dtqbi7ilse9x730y087wagm2` FOREIGN KEY (`item_id`) REFERENCES `item` (`item_id`),
  CONSTRAINT `FKd7u0gc7kgc44yf8juueqhu8ey` FOREIGN KEY (`order_id`) REFERENCES `table_order` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_detail`
--

LOCK TABLES `order_detail` WRITE;
/*!40000 ALTER TABLE `order_detail` DISABLE KEYS */;
INSERT INTO `order_detail` VALUES (1,'2026-07-12 19:19:00.000000','customer01',NULL,NULL,NULL,'Ít đá, không đường',1,'SERVED',25000,1,1),(2,'2026-07-12 19:19:00.000000','customer01',NULL,NULL,NULL,NULL,1,'SERVED',45000,3,1),(3,'2026-07-12 19:19:00.000000','customer02',NULL,NULL,NULL,'Nhiều trân châu',2,'PENDING',45000,4,2),(4,'2026-09-01 21:41:32.665000',NULL,NULL,'2026-09-02 00:54:47.967000',NULL,NULL,1,'SERVED',35000,5,3);
/*!40000 ALTER TABLE `order_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `role_name` varchar(255) NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `UC_ROLEROLE_NAME_COL` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,NULL,NULL,NULL,NULL,NULL,'ADMIN'),(2,NULL,NULL,NULL,NULL,NULL,'STAFF'),(3,NULL,NULL,NULL,NULL,NULL,'USER');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `table_order`
--

DROP TABLE IF EXISTS `table_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `table_order` (
  `order_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `close_at` datetime(6) DEFAULT NULL,
  `open_at` datetime(6) NOT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `total_amount` decimal(15,0) NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `table_id` bigint DEFAULT NULL,
  `cancel_reason` varchar(255) DEFAULT NULL,
  `is_deleted` bit(1) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `FK5tx3lr2wfe6vggtq35atnviiv` (`customer_id`),
  KEY `FKkxxygsd18l03f7lqtjge09clo` (`employee_id`),
  KEY `FKotmcbqjiyur4250cdlcn325f3` (`table_id`),
  CONSTRAINT `FK5tx3lr2wfe6vggtq35atnviiv` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  CONSTRAINT `FKkxxygsd18l03f7lqtjge09clo` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`employee_id`),
  CONSTRAINT `FKotmcbqjiyur4250cdlcn325f3` FOREIGN KEY (`table_id`) REFERENCES `cafe_table` (`table_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `table_order`
--

LOCK TABLES `table_order` WRITE;
/*!40000 ALTER TABLE `table_order` DISABLE KEYS */;
INSERT INTO `table_order` VALUES (1,'2026-07-12 17:19:00.000000','customer01',NULL,'2026-07-12 18:30:00.000000','staff01','2026-07-12 18:30:00.000000','2026-07-12 17:19:00.000000','2026-07-12 18:30:00.000000','CASH','PAID',70000,1,2,1,NULL,NULL),(2,'2026-07-12 19:19:00.000000','customer02',NULL,'2026-09-02 02:11:53.981000',NULL,'2026-09-02 02:11:53.809882','2026-07-12 19:19:00.000000','2026-09-02 02:11:53.809854','CASH','PAID',90000,2,3,3,NULL,NULL),(3,'2026-09-01 21:41:32.367000',NULL,NULL,'2026-09-02 00:54:47.960000',NULL,'2026-09-02 00:54:47.904403','2026-09-01 21:41:32.244595','2026-09-02 00:54:47.904166','CASH','PAID',35000,NULL,NULL,1,NULL,_binary '\0');
/*!40000 ALTER TABLE `table_order` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-02 18:38:33
