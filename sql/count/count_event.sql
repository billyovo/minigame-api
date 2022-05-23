DELIMITER //
DROP PROCEDURE IF EXISTS count_event;
CREATE PROCEDURE `count_event`(ser VARCHAR(10), event_name VARCHAR(20), lim INT,  pg INT)
BEGIN
  SET @event = event_name;
  IF (@event = 'all') THEN
    SET @event = '';
  END IF;
  SET @event = CONCAT('%', @event, '%');
  IF (ser = 'survival') THEN
	SELECT SQL_CALC_FOUND_ROWS name, uuid, COUNT(*) AS total FROM survival INNER JOIN player ON player.uuid = survival.player WHERE event LIKE @event GROUP BY name ORDER BY total DESC LIMIT lim OFFSET pg;  
  END IF;
  IF (ser = 'skyblock') THEN
	SELECT SQL_CALC_FOUND_ROWS name, uuid, COUNT(*) AS total FROM skyblock INNER JOIN player ON player.uuid = skyblock.player WHERE event LIKE @event GROUP BY name ORDER BY total DESC LIMIT lim OFFSET pg;
  END IF;
  IF (ser = 'all') THEN
	SELECT SQL_CALC_FOUND_ROWS name,uuid, COUNT(uuid) AS total FROM (SELECT * FROM survival UNION ALL SELECT * FROM skyblock) temp INNER JOIN player ON temp.player = player.uuid WHERE event LIKE @event GROUP BY player.name ORDER BY total DESC LIMIT lim OFFSET pg;
  END IF;
  SELECT FOUND_ROWS() AS total;
END //

/*
--CALL count_event('all', 'all', 2, 0);
*/