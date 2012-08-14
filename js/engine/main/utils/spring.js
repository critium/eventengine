"use strict";
// this is for IOC between test and prod and any other environments
var test = {
  "event": "./test/events/main"
};

var prod = {
  "event": ".main/events/main"
};


if (! GLOBAL.MY) {
  GLOBAL.MY = {
      underscore : require('underscore'),
      logger     : require('tracer').colorConsole(),
  };

  GLOBAL.MY.require = function(library){
    return require(library);
  }
}
