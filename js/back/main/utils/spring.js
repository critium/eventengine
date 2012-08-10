"use strict";
let test = {
  "event", "./test/events/main"
};

let prod = {
  "event", ".main/events/main"
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
