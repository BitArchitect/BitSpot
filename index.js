const express = require('express');
const app = express();
const mysql = require('mysql');
const Exchanges = require('crypto-exchange');
const cron = require('node-cron');
const db = require('./database.js');
const statsD = require('node-statsd');
const redis = require('redis');

// telnet thesis-house-price-001.nbxzan.0001.usw1.cache.amazonaws.com 11211
// src/redis-cli -c -h thesis-house-price.nbxzan.ng.0001.usw1.cache.amazonaws.com -p 6379
const _port = 1337;

const statsDClient = new statsD({
  host: `statsd.hostedgraphite.com`,
  port: 8125,
  prefix: `00436c17-5dfb-4df2-bd21-634d9a0ab64f`
});

const redisClient = redis.createClient({
  host: 'thesis-house-price.nbxzan.ng.0001.usw1.cache.amazonaws.com',
  port: 6379
});

redisClient.on("error", function (err) {
    console.log("Error " + err);
});
 
// redisClient.set("string key", "string val", redis.print);
// redisClient.hset("hash key", 123, "some value", redis.print);
// redisClient.hset(["hash key", 444, "some other value"], redis.print);
// redisClient.hkeys("hash key", function (err, replies) {
//     console.log(replies.length + " replies:");
//     replies.forEach(function (reply, i) {
//         console.log("    " + i + ": " + reply);
//     });
//     redisClient.quit();
// });

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
  // console.log('Request coming in!', req.query)
  const startTime = Date.now();
  statsDClient.increment('.service.house.query.all')
  let zipcode = req.query.zipcode || "94118";
  let startDate = req.query.startDate.slice(0,4) + req.query.startDate.slice(5,7) || "200410";
  let endDate = req.query.endDate.slice(0,4) + req.query.endDate.slice(5,7) || "200510";

  redisClient.get(JSON.stringify(req.query), function(err, reply) {
    if (reply) {
      res.json({average: reply});
    } else {
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
            statsDClient.timing('.service.house.query.latency_ms', Date.now() - startTime)
            redisClient.set(JSON.stringify(req.query), 1200000, 'EX', 6);
          } else {
            res.json({average: '1200000'})
            statsDClient.timing('.service.house.query.latency_ms', Date.now() - startTime)
            redisClient.set(JSON.stringify(req.query), 1200000, 'EX', 6);
          }
        } else {
          res.json({error: 'Please specify the ZipCode'})
          statsDClient.timing('.service.house.query.latency_ms', Date.now() - startTime)
          statsDClient.increment('.service.house.query.fail')
        }
      })
    }
  })
});


app.listen(_port, () => console.log('Server running on port ' + _port))


















