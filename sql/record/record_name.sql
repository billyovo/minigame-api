DELIMITER //
DROP PROCEDURE IF EXISTS record_name;
CREATE PROCEDURE `record_name`(ser VARCHAR(10), event_name VARCHAR(20), player_name VARCHAR(25), lim INT,  pg INT)
BEGIN
  SET @event = event_name;
  IF (@event = 'all') THEN
    SET @event = '';
  END IF;
  SET @event = CONCAT('%', @event, '%');
  SET @player_name = CONCAT('%', player_name, '%');
  IF (ser = 'survival') THEN
	SELECT SQL_CALC_FOUND_ROWS name, uuid,event,date, server FROM (SELECT *, '生存' AS server FROM survival INNER JOIN player ON player.uuid = survival.player) temp WHERE event LIKE @event AND name LIKE @player_name ORDER BY date DESC LIMIT lim OFFSET pg;
  END IF;
  IF (ser = 'skyblock') THEN
	SELECT SQL_CALC_FOUND_ROWS name, uuid,event,date, server FROM (SELECT *, '空島' AS server FROM skyblock INNER JOIN player ON player.uuid = skyblock.player) temp WHERE event LIKE @event AND name LIKE @player_name ORDER BY date DESC LIMIT lim OFFSET pg;
  END IF;
  IF (ser = 'all') THEN
	SELECT SQL_CALC_FOUND_ROWS name,uuid,event,date, server FROM (SELECT *, '生存' AS server FROM survival UNION ALL SELECT *, '空島' AS server FROM skyblock) temp INNER JOIN player ON player.uuid = temp.player WHERE event LIKE @event AND name LIKE @player_name ORDER BY date DESC LIMIT lim OFFSET pg;
  END IF;
  SELECT FOUND_ROWS() AS total;
END //

/*
--CALL record_name('all', 'all', 'ros', 10, 0);
*/