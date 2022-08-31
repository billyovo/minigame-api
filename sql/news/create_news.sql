DELIMITER //
DROP PROCEDURE IF EXISTS create_news;
CREATE PROCEDURE `create_news`(title VARCHAR(80), content VARCHAR(5000), publish_date DATE)
BEGIN
  INSERT into news (title, content, publish_date) VALUES (title,content,publish_date);
END //
