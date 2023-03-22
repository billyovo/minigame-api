DELIMITER //
DROP PROCEDURE IF EXISTS record_event;
CREATE PROCEDURE `record_event`(ser VARCHAR(10), event_name VARCHAR(20), lim INT,  pg INT)
BEGIN
  SET @event = event_name;
  IF (@event = 'all') THEN
    SET @event = '';
  END IF;
  SET @event = CONCAT('%', @event, '%');
  IF (ser = 'survival') THEN
	SELECT SQL_CALC_FOUND_ROWS name,uuid,event,date, '生存' AS server FROM survival INNER JOIN player ON player.uuid = survival.player WHERE event LIKE @event ORDER BY date DESC LIMIT lim OFFSET pg;
  END IF;
  IF (ser = 'skyblock') THEN
	SELECT SQL_CALC_FOUND_ROWS name,uuid,event,date, '空島' AS server FROM skyblock INNER JOIN player ON player.uuid = skyblock.player WHERE event LIKE @event ORDER BY date DESC LIMIT lim OFFSET pg;
  END IF;
  IF (ser = 'all') THEN
	SELECT SQL_CALC_FOUND_ROWS name,uuid, event, date, server FROM (SELECT *, "生存" AS server FROM survival UNION ALL SELECT *, "空島" AS server FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid WHERE event LIKE @event ORDER BY date DESC LIMIT lim OFFSET pg;
  END IF;
  SELECT FOUND_ROWS() AS total;
END //