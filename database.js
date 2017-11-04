const mysql = require('mysql');
const config = require('./config.js');

// BitCoin DB
// const connection = mysql.createConnection({
//   host: "rds-mysql-10mintutorial.c4b0uxv6yk5n.us-west-1.rds.amazonaws.com",
//   user: "masterUsername",
//   password: config.pw,
//   database: "realestate"
// });

// House Prices DB
const connection = mysql.createConnection({
  host: "house-prices.c4b0uxv6yk5n.us-west-1.rds.amazonaws.com",
  user: "sevam",
  password: config.pw,
  database: "closingHousePrices"
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

const retrieveHomePrices = function(query, callback) {
  var query = query || "SELECT * FROM sf_home_sale_prices";
  connection.query(query, function(err, result) {
    if (err) {
      throw err;
    } else {
      // console.log('Vales successfuly retrieved: ', result);
      callback(result);
    }
  });
};

module.exports = {
  insert: insert,
  retrieve: retrieve,
  retrieveHomePrices: retrieveHomePrices
};