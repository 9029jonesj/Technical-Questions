var express = require('express');
var router = express.Router();
var async = require('async');
var axios = require('axios');

var sensors = [];

/* Get sensors. */
router.get('/', function(req, res, next) {
  var count = Object.keys(sensors).length;
  if (count === 0) {
    res.json([{
      id: 0,
      name: "No Sensors",
      temp: "N/A",
      temps: null,
      index: -1
    }]);
  }
  else res.json(sensors);
});

/* Add sensor. */
router.post('/sensor-management/add-sensor', function(req, res, next) {
  var sensor = {
    id: null,
    name: null,
    temp: null,
    temps: [],
    index: -1
  };
  async.series([
    function(callback) {
      axios.get('https://api.darksky.net/forecast/68f936fde0456d5727a541a01ea965eb/' + req.body.latLon)
      .then(function(res) {
        sensor.id = ++Object.keys(sensors).length;
        sensor.name = '"'+ req.body.latLon + '"';
        sensor.index = ++sensor.index;
        sensor.temp = res.data.hourly.data[sensor.index].temperature;
        sensor.temps.push(res.data.hourly);
        callback();
      })
      .catch(function(error) {
        sensor.id = -1;
        sensor.name = "Unable to add sensor";
        callback();
      });
    },
    function(callback) {
      sensors.push(sensor);
      callback();
    },
    function(callback) {
      res.redirect('/');
    }
  ]);
});

/* Delete sensor. */
router.delete('/sensor-management/delete-sensor/:sensor_id', function(req, res, next) {
  async.series([
    function(callback) {
      sensors.splice(--req.params.sensor_id, 1);
      callback();
    },
    // Reassign Sensor ID numbers
    function(callback) {
      sensors.forEach((sensor, index) => {
        sensor.id = ++index;
      });
      callback();
    },
    function(callback) {
      res.sendStatus(200);
    }
  ]);
});

module.exports = router;
