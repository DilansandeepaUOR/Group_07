-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Table structure for table `sent_notifications`
--

CREATE TABLE IF NOT EXISTS sent_notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT NOT NULL,
    pet_id INT NOT NULL,
    owner_id INT NOT NULL,
    vaccination_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    sent_date DATETIME NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES notification_templates(template_id),
    FOREIGN KEY (pet_id) REFERENCES pet(Pet_id),
    FOREIGN KEY (owner_id) REFERENCES pet_owner(Owner_id),
    FOREIGN KEY (vaccination_id) REFERENCES vaccination(vaccination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `sent_notifications`
--
CREATE INDEX idx_sent_notifications_status ON sent_notifications(status);
CREATE INDEX idx_sent_notifications_sent_date ON sent_notifications(sent_date);
CREATE INDEX idx_sent_notifications_pet_id ON sent_notifications(pet_id);
CREATE INDEX idx_sent_notifications_owner_id ON sent_notifications(owner_id);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `sent_notifications`
--
ALTER TABLE `sent_notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sent_notifications`
--
ALTER TABLE `sent_notifications`
  ADD CONSTRAINT `sent_notifications_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `notification_templates` (`template_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sent_notifications_ibfk_2` FOREIGN KEY (`pet_id`) REFERENCES `pet` (`Pet_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sent_notifications_ibfk_3` FOREIGN KEY (`owner_id`) REFERENCES `pet_owner` (`Owner_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sent_notifications_ibfk_4` FOREIGN KEY (`vaccination_id`) REFERENCES `vaccination` (`vaccination_id`) ON DELETE CASCADE;

COMMIT; 