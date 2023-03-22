DELIMITER //
DROP PROCEDURE IF EXISTS update_news;
CREATE PROCEDURE `update_news`(_title VARCHAR(80), _content VARCHAR(5000), _publish_date DATE, _image VARCHAR(100), _id INTEGER)
BEGIN
  UPDATE news SET title = _title, content = _content, publish_date = _publish_date, image = _image WHERE ID = _id;
END //
