-- phpMyAdmin SQL Dump
-- version 3.4.10.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 29, 2016 at 11:22 AM
-- Server version: 5.5.22
-- PHP Version: 5.3.10-1ubuntu3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `forge`
--
CREATE DATABASE  IF NOT EXISTS `forge-db` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `forge-db`;

-- --------------------------------------------------------

--
-- Table structure for table `repos`
--

CREATE TABLE IF NOT EXISTS `repos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner` varchar(250) NOT NULL,
  `name` varchar(250) NOT NULL,
  `token` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;
