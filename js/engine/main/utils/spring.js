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
    underscore : function() {return require('underscore')},
    logger     : function() {return require('tracer').colorConsole()},
    FinMath    : function() {return require('./FinMath.js')},
    DateUtils  : function() {return require('./DateUtils.js')},
    Event      : function() {return require('../event/Event.js')}
  };

  GLOBAL.MY.require = function(library){
    return require(library);
  };

  GLOBAL.MY.defineConst = function(src, propName, val){
    Object.defineProperty(src, propName, {
      value : val,
      writable : true,
      enumerable : true,
      configurable : true
    });
  };
}
