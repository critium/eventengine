var Step = require('step');
var DS   = require('ee_DS').DS;
var db   = DS.getDS('engine');

Step (
  function dropDb (){
    console.log('executing drop database');
    db.dropDatabase (this);
  },
  function dropRet (err, docs){
    console.log("\tdrop: err: " + err + " docs: " +  JSON.stringify(docs,null,2));
    return docs;
  },
  function createNew (err){
    console.log('inserting new test set');
    var mongolia = require('mongolia');
    var events = require('./example1and2.js').datasource;
    var event = mongolia.model(db, 'events');

    event.mongo({method: 'insert', hooks: false}, events , this);
  },
  function cleanup (err){
    console.log('complete!');
    db.close();
  }
);
