const mysql = require('mysql');
const config = require('./config.js');

const connection = mysql.createConnection({
  host: "rds-mysql-10mintutorial.c4b0uxv6yk5n.us-west-1.rds.amazonaws.com",
  user: "masterUsername",
  password: config.pw,
  database: "realestate"
});

const insert = function(data) {
  var query = data;
  connection.query("INSERT INTO bitcoin_prices (nowtime, high, low, volume, last, ask, bid) VALUES (?, ?, ?, ?, ?, ?, ?)", [data.timestamp, data.high, data.low, data.volume, data.last, data.ask, data.bid], function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log('Values Successfully Inserted!')
    }
  }) 
};

const retrieve = function(query, callback) {
  var query = query || "SELECT * FROM bitcoin_prices";
  connection.query(query, function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log('Vales successfuly retrieved: ', result);
      callback(result);
    }
  });
};

module.exports = {
  insert: insert,
  retrieve: retrieve
};