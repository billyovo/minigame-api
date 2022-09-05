DELIMITER //
DROP PROCEDURE IF EXISTS get_news_list;
CREATE PROCEDURE `get_news_list`(lim INT,  pg INT)
BEGIN
  SELECT SQL_CALC_FOUND_ROWS ID, title, publish_date FROM news ORDER BY publish_date DESC, ID DESC LIMIT lim OFFSET pg;
  SELECT FOUND_ROWS() AS total;
END //

/*
--CALL get_news_list(1, 1);
*/