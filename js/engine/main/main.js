"use strict";
var spring = require('./utils/spring');

var MY = GLOBAL.MY;
var logger = MY.logger;
logger.trace("this is a trace");

var test= MY.require('tracer').console();
test.warn('this works!');
