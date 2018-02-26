const express = require('express');
const app = express();
var path = require('path');
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var sensors = require('./routes/sensors.js');

app.use('/', sensors);
app.use('/sensors', sensors);

app.listen(3001, () => console.log('Server is running.'));
module.exports = app;
