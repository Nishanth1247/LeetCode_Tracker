-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: leetcode_tracker
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Current Database: `leetcode_tracker`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `leetcode_tracker` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `leetcode_tracker`;

--
-- Table structure for table `leetcode_stats_history`
--

DROP TABLE IF EXISTS `leetcode_stats_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leetcode_stats_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_solved` int NOT NULL DEFAULT '0',
  `easy_solved` int NOT NULL DEFAULT '0',
  `medium_solved` int NOT NULL DEFAULT '0',
  `hard_solved` int NOT NULL DEFAULT '0',
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_recorded` (`user_id`,`recorded_at`),
  CONSTRAINT `leetcode_stats_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leetcode_stats_history`
--

LOCK TABLES `leetcode_stats_history` WRITE;
/*!40000 ALTER TABLE `leetcode_stats_history` DISABLE KEYS */;
INSERT INTO `leetcode_stats_history` VALUES (1,2,100,65,32,3,'2026-09-09 08:54:15');
/*!40000 ALTER TABLE `leetcode_stats_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leetcode_submissions`
--

DROP TABLE IF EXISTS `leetcode_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leetcode_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `problem_title` varchar(255) NOT NULL,
  `problem_slug` varchar(255) NOT NULL,
  `difficulty` enum('EASY','MEDIUM','HARD') DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `solved_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_problem_solved` (`user_id`,`problem_slug`,`solved_at`),
  KEY `idx_user_solved_at` (`user_id`,`solved_at`),
  KEY `idx_user_problem` (`user_id`,`problem_slug`),
  CONSTRAINT `leetcode_submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leetcode_submissions`
--

LOCK TABLES `leetcode_submissions` WRITE;
/*!40000 ALTER TABLE `leetcode_submissions` DISABLE KEYS */;
INSERT INTO `leetcode_submissions` VALUES (1,2,'To Lower Case','to-lower-case','EASY',NULL,'2026-09-08 20:12:09','2026-09-09 09:22:40'),(2,2,'Squares of a Sorted Array','squares-of-a-sorted-array','EASY',NULL,'2026-09-08 20:06:34','2026-09-09 09:22:40'),(3,2,'Find All Numbers Disappeared in an Array','find-all-numbers-disappeared-in-an-array','EASY',NULL,'2026-09-08 19:58:24','2026-09-09 09:22:40'),(4,2,'Richest Customer Wealth','richest-customer-wealth','EASY',NULL,'2026-09-08 15:55:09','2026-09-09 09:22:40'),(5,2,'Kids With the Greatest Number of Candies','kids-with-the-greatest-number-of-candies','EASY',NULL,'2026-09-08 15:51:50','2026-09-09 09:22:40'),(6,2,'Shuffle the Array','shuffle-the-array','EASY',NULL,'2026-09-08 15:45:02','2026-09-09 09:22:40'),(7,2,'Concatenation of Array','concatenation-of-array','EASY',NULL,'2026-09-08 14:56:13','2026-09-09 09:22:40'),(8,2,'Running Sum of 1d Array','running-sum-of-1d-array','EASY',NULL,'2026-09-08 14:53:35','2026-09-09 09:22:40'),(9,2,'Minimum Distance to the Target Element','minimum-distance-to-the-target-element','EASY',NULL,'2026-09-08 14:39:18','2026-09-09 09:22:40'),(10,2,'Count Commas in Range','count-commas-in-range','EASY',NULL,'2026-09-08 10:58:54','2026-09-09 09:22:40'),(11,2,'N-Queens','n-queens','HARD',NULL,'2026-09-03 21:08:18','2026-09-09 09:22:40'),(12,2,'Split Array Largest Sum','split-array-largest-sum','HARD',NULL,'2026-09-03 21:04:18','2026-09-09 09:22:40'),(13,2,'Permutation in String','permutation-in-string','MEDIUM',NULL,'2026-08-30 16:11:23','2026-09-09 09:22:40'),(14,2,'Find All Anagrams in a String','find-all-anagrams-in-a-string','MEDIUM',NULL,'2026-08-30 16:08:07','2026-09-09 09:22:40'),(15,2,'Longest Substring Without Repeating Characters','longest-substring-without-repeating-characters','MEDIUM',NULL,'2026-08-29 12:47:13','2026-09-09 09:22:40'),(16,2,'Sort Characters By Frequency','sort-characters-by-frequency','MEDIUM',NULL,'2026-08-29 12:34:34','2026-09-09 09:22:40'),(17,2,'Group Anagrams','group-anagrams','MEDIUM',NULL,'2026-08-29 12:23:27','2026-09-09 09:22:40'),(18,2,'Top K Frequent Elements','top-k-frequent-elements','MEDIUM',NULL,'2026-08-29 12:16:27','2026-09-09 09:22:40'),(19,2,'Contains Duplicate II','contains-duplicate-ii','EASY',NULL,'2026-08-29 12:05:04','2026-09-09 09:22:40'),(20,2,'Intersection of Two Arrays II','intersection-of-two-arrays-ii','EASY',NULL,'2026-08-29 11:58:02','2026-09-09 09:22:40');
/*!40000 ALTER TABLE `leetcode_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_challenges`
--

DROP TABLE IF EXISTS `team_challenges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_challenges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text,
  `difficulty` enum('EASY','MEDIUM','HARD','MIXED') NOT NULL,
  `target` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('ACTIVE','COMPLETED','EXPIRED') DEFAULT 'ACTIVE',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_team_status` (`team_id`,`status`),
  CONSTRAINT `team_challenges_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_challenges_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_challenges`
--

LOCK TABLES `team_challenges` WRITE;
/*!40000 ALTER TABLE `team_challenges` DISABLE KEYS */;
INSERT INTO `team_challenges` VALUES (1,1,'WEEK 1',NULL,'EASY',13,'2026-09-09','2026-09-16','ACTIVE',1,'2026-09-09 09:13:30');
/*!40000 ALTER TABLE `team_challenges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `team_members_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES (2,1,3,'2026-09-09 09:10:49'),(3,1,4,'2026-09-09 09:10:49'),(4,2,2,'2026-09-09 09:11:52');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `teams_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Team 1',1,'2026-09-09 09:10:49'),(2,'Team 2',1,'2026-09-09 09:11:52');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','MEMBER') NOT NULL DEFAULT 'MEMBER',
  `leetcode_username` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `leetcode_total_solved` int DEFAULT '0',
  `leetcode_easy_solved` int DEFAULT '0',
  `leetcode_medium_solved` int DEFAULT '0',
  `leetcode_hard_solved` int DEFAULT '0',
  `leetcode_total_questions` int DEFAULT NULL,
  `leetcode_ranking` int DEFAULT NULL,
  `leetcode_last_synced` timestamp NULL DEFAULT NULL,
  `leetcode_last_activity` timestamp NULL DEFAULT NULL,
  `leaderboard_opt_in` tinyint(1) NOT NULL DEFAULT '0',
  `google_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin User','admin@example.com','$2a$10$XaL9vqky0ZsSyK6mD5M7l.DEuAujJVmUkRQdd8oiN7xIuzuyzDlPe','ADMIN',NULL,'2026-09-08 15:35:10','2026-09-08 15:35:10',0,0,0,0,NULL,NULL,NULL,NULL,0,NULL),(2,'Nishan','nishanthprakash777@gmail.com','$2a$10$zgOA9Vat2oUMgcPHL/c12eNd8rTv9Smq96A97vXI8Q2zXZWZr7SHa','MEMBER','Nishanth__07','2026-09-08 15:37:53','2026-09-09 09:22:40',100,65,32,3,4047,1701332,'2026-09-09 09:22:40','2026-09-08 14:42:09',1,NULL),(3,'praneeth','praneeth@gmail.com','$2a$10$P/a41KfAdNZM8DBz0vXituyl0p0BfMi361e/wlDZqrp.OvNRnDPD.','MEMBER','Praneeth_06','2026-09-08 15:43:20','2026-09-09 09:14:51',26,22,4,0,4047,3921615,'2026-09-08 15:43:51','2026-08-22 06:33:16',1,NULL),(4,'Nagulan','nagulan@gmail.com','$2a$10$IHc07KhOhaMkXxYMuvmsEufwyP0nPPnrDvbXKJ9/DZg3njilUNDP6','MEMBER','Nagulan_03','2026-09-08 15:44:32','2026-09-08 15:46:34',35,24,11,0,4047,3349722,'2026-09-08 15:46:34',NULL,0,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-09 15:14:08
