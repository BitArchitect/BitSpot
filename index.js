const express = require('express');
const app = express();
const mysql = require('mysql');
const Exchanges = require('crypto-exchange');
const cron = require('node-cron');
const db = require('./database.js');
const statsD = require('node-statsd');

const client = new statsD({
  host: `statsd.hostedgraphite.com`,
  port: 8125,
  prefix: `b9483767-cbb7-4699-8548-54f0245df2d5`
})

const _port = 3000;

// MySql Database
// const connection = mysql.createConnection({
//   host: "rds-mysql-10mintutorial.c4b0uxv6yk5n.us-west-1.rds.amazonaws.com",
//   user: "masterUsername",
//   password: config.pw,
//   database: "realestate"
// });

// connection.connect(function(err) {
//   if (err) {
//     console.log("Cannot Connect!", err);
//   } else {
//     console.log("Connected!");
//   }
// })

// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//     connection.query("DROP TABLE IF EXISTS bitcoin_prices", function(err, result) {
//       connection.query(`CREATE TABLE bitcoin_prices (
//                         nowtime  BIGINT  NOT NULL PRIMARY KEY,
//                         high INTEGER,
//                         low    INTEGER,
//                         volume INTEGER,
//                         last INTEGER,
//                         ask INTEGER,
//                         bid INTEGER
//                         )`, function(err, result) {
//                           if (err) throw err;
//                           console.log('TABLE CREATED!');

//       });
//     });
//   });


// const insertMySql = function(data) {
//   var query = data;
//   con.query("INSERT INTO bitcoin_prices (nowtime, high, low, volume, last, ask, bid) VALUES (?, ?, ?, ?, ?, ?, ?)", [data.timestamp, data.high, data.low, data.volume, data.last, data.ask, data.bid], function(err, result) {
//     if (err) {
//       throw err;
//     } else {
//       console.log('Values Successfully Inserted!')
//     }
//   }) 
// }

// CREATE DATABASE IF NOT EXISTS real_estate_data;
// USE real_estate_data;
// DROP TABLE IF EXISTS bitcoin_prices;
// CREATE TABLE bitcoin_prices(
//    nowtime  BIGINT  NOT NULL PRIMARY KEY,
//    high INTEGER,
//    low    INTEGER,
//    volume INTEGER,
//    last INTEGER,
//    ask INTEGER,
//    bid INTEGER
// );


// end MySql Database

cron.schedule('*/1 * * * * *', function() {
  Exchanges.kraken.ticker('BTC_USD')
  .then(data => {
    db.insert(data.BTC_USD);
    client.increment('worker.bitcoin.insert');
    console.log('Values inserted: ', data.BTC_USD);
  })
});

// console.log(db.retrieve(null, console.log));

// make a cron schedule 1x/day to send all data from past 24 hrs to offline AI (new instance)
// 



app.get('/', (req, res) => {
  res.send('JohnJohn Sucks')
})
app.listen(_port, () => console.log('Server running on port ' + _port))
