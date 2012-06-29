var vows         = require('vows');
var assert       = require('assert');
var DS           = require('../DataSource').DataSource;
var eventFactory = require('../Event').eventFactory;

var testComplexObj = function (){
  var complexObj = new eventFactory.leaseEvent;
  complexObj.cid = 1;
  complexObj.descriminator.term = 360;
  return complexObj;
};

var testStore = function (complexObj, callback){
  var objToStore = complexObj.toStore();
  myDS.storeEvent(objToStore, callback);
};

var testRestore = function(eventId, callback){
  var event = myDS.restoreEvent(eventId, callback);
}

var tearDown = function () {
  myDS.quit();
};


var myDS = DS.newDataSource();
var complexObj = new testComplexObj();
testStore(complexObj, function(err, replies) {
  console.log('errors: ' + err);
  console.log('replies: ' + replies);
});
var eHash = 'event:1';
testRestore(eHash, function(err, event){
  debugger;
  assert.deepEqual(complexObj, event);
});


// Mocha test suite
// describe('The Data Source', function(){
//   describe('object', function(){
//     assert.ok(myDS);
//   });
//
//   describe('store event', function(){
//     testStore(complexObj, function(err, replies) {
//       assert.ok(err==undefined);
//       done();
//     });
//   });
//
//   describe('restore event', function(){
//     var eHash = 'event:1';
//     testRestore(eHash, function(err, event){
//       assert.deepEqual(complexObj, event);
//     });
//   });
// });


// vows test suite
// vows.describe('The Data Source').addBatch({
//   'object':{
//     topic: myDS,
//     'is not undefined':function(myDS){
//       assert.ok(myDS);
//     }
//   }
//   ,'store event':{
//     topic: function () {
//       testStore(complexObj,this.callback)
//     },
//     'does not have any errors':function(err,replies){
//       assert.ok(err==undefined);
//       console.log('vr: ' + replies);
//     },
//   }
//   ,'restore event':{
//     topic: function(){
//       var eHash = 'event:1';
//       testRestore(eHash,this.callback)
//     }
//     ,'returns the same object':function(err,event){
//       assert.deepEqual(complexObj, event)
//     }
//   }
// }).export(module);
