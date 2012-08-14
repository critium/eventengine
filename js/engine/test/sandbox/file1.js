"use strict";
GLOBAL.MY = {
    underscore : require('underscore'),
    logger     : require('tracer').colorConsole(),
};

GLOBAL.MY.require = function(library){
  return require(library);
}
