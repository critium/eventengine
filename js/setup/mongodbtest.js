var Step     = require('step');
var mongo    = require('mongodb');
var mongolia = require('mongolia');
var DS       = require('ee_DS').DS;


var events = require('./example1and2.js').datasource;

/**
 * initialize the connections
 */
var db = DS.getDS('engine');

/**
 */
var event = mongolia.model(db, 'events');
Step (
  function open (){
    db.open(this);
  },
  function afterOpen(err){
    event.mongo({method: 'insert', hooks: false}, events , this);
  },
  function close(err, meth1){
    console.log('meth1' + JSON.stringify(meth1, null, 2));
    db.close();
  }
);
