DROP DATABASE IF EXISTS db;
CREATE DATABASE db DEFAULT CHARACTER SET utf8mb4;
CREATE USER 'system'@'localhost' IDENTIFIED BY 'systempass';
CREATE USER 'system'@'%' IDENTIFIED BY 'systempass';
GRANT ALL PRIVILEGES ON db.* TO 'system'@'%';
GRANT ALL PRIVILEGES ON db.* TO 'system'@'localhost';