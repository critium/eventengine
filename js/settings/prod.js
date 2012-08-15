"use strict";

GLOBAL.persist = {
  dev:dev;
};

var dev = {
  engine:{
    host:"localhost",
    port:27017,
    schema:"engine"
  },
  web:{
    host:"localhost",
    port:27017,
    schema:"web"
  },
};
