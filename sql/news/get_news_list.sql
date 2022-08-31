DELIMITER //
DROP PROCEDURE IF EXISTS get_news_list;
CREATE PROCEDURE `get_news_list`(lim INT,  pg INT)
BEGIN
  SELECT ID, title, publish_date FROM news LIMIT lim OFFSET pg;
  SELECT FOUND_ROWS() AS total;
END //

/*
--CALL get_news_list(0, 0);
*/