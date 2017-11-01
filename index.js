const express = require('express');
const app = express();
const mysql = require('mysql');
const Exchanges = require('crypto-exchange');
const cron = require('node-cron');
const db = require('./database.js');
const statsD = require('node-statsd');
// const config = require('./config.js')

const client = new statsD({
  host: `statsd.hostedgraphite.com`,
  port: 8125,
  prefix: `b9483767-cbb7-4699-8548-54f0245df2d5`
});

const _port = 1337;

// MySql Database
// const connection = mysql.createConnection({
//   host: "house-prices.c4b0uxv6yk5n.us-west-1.rds.amazonaws.com",
//   user: "sevam",
//   database: "closingHousePrices",
//   password: config.pw
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
//     connection.query("select * from sf_home_sale_prices where ZipCode=94102;", function(err, result) {
//       console.log('result:',result);
//       console.log(err)
//       });
//     });


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


// BitCoin Worker:
// cron.schedule('*/1 * * * * *', function() {
//   Exchanges.kraken.ticker('BTC_USD')
//   .then(data => {
//     db.insert(data.BTC_USD);
//     client.increment('worker.bitcoin.insert');
//     console.log('Values inserted: ', data.BTC_USD);
//   })
// });

// db.retrieveHomePrices("SELECT * FROM sf_home_sale_prices WHERE ZipCode=" + "94158", function(data) {
//   var count = 0;
//   var responseObj = {};
//   let startDate = "200410";
//   let endDate = "200510";
//   let sum = 0;
//   for (var key in data[0]) {
//     if (count > 0 || startDate === key) {
//       if (key === endDate) {
//         break;
//       } else {
//         count++;
//         sum += data[0][key];
//       }
//     }
//   }
//   let average = sum/count;
//   if (average) {
//     res.json({average: average})
//   } else {
//     res.json({average: 1200000})
//   }
// });

// make a cron schedule 1x/day to send all data from past 24 hrs to offline AI (new instance)



app.get('/*', (req, res) => {
  console.log('Request coming in!', req.query)

  let zipcode = req.query.zipcode || "94118";
  let startDate = req.query.startDate.slice(0,4) + req.query.startDate.slice(5,7) || "200410";
  let endDate = req.query.endDate.slice(0,4) + req.query.endDate.slice(5,7) || "200510";
  db.retrieveHomePrices("SELECT * FROM sf_home_sale_prices WHERE ZipCode=" + zipcode, function(data) {
    if (data) {
      var count = 0;
      var responseObj = {};
      let sum = 0;
      for (var key in data[0]) {
        if (count > 0 || startDate === key) {
          if (key === endDate) {
            break;
          } else {
            count++;
            sum += data[0][key];
          }
        }
      }
      let average = sum/count;
      if (average) {
        res.json({average: average})
      } else {
        res.json({average: 1200000})
      }
    } else {
      res.json({error: 'Please specify the ZipCode'})
    }
  })
});


app.listen(_port, () => console.log('Server running on port ' + _port))


















