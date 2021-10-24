const config = require('../config.json')
const mysql = require('mysql2');

const pool = mysql.createPool(config.dbconfig).promise();

module.exports= {
    query: function(query,params = []){
        return pool.query(query,params);               
    }
}