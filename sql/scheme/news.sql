CREATE TABLE news (
	ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(80) NOT NULL,
    content VARCHAR(5000) NOT NULL,
    publish_date DATE NOT NULL,
    image TEXT
)