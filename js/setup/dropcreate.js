var DS = require('ee_DS').DS;
var Step = require('step');
var db = DS.getDS('engine');

Step (
  function dropDb (){
    db.dropDatabase (this);
  },
  function dropRet (err, docs){
    console.log(err + " " + JSON.stringify(docs,null,2));
    return docs;
  },
  // function createNew (err){
  //   //TODO: crate new schema
  //   return;
  // },
  // function popNew (err) {
  //   //TODO: Populate the schema
  //   return;
  // },
  function cleanup (err){
    db.close();
  }
);
