var redis = require("redis");
var eventFactory = require('./Event').eventFactory;

var storeSet = function (complexobject) {
}

var newDataSource = function () {
  var client = redis.createClient();

  client.on("error", function (err) {
    console.log("Error " + err);
  });

  var quit = function (){
    client.quit();
  }

  var storeEvent = function (evt, callback){
    debugger;
    var collectionId = evt.cid;
    // var eventId      = client.incr('eventincr');
    var eventId      = 1;
    var cHash        = 'collection:' + collectionId;
    var eHash        = 'event:' + eventId;

    client.multi()
    .sadd('collections', collectionId, redis.print)
    .sadd(cHash, eHash, redis.print)
    .hmset(eHash,evt, redis.print)
    .exec(function (err, replies) {
      // console.log("MULTI got " + replies.length + " replies");
      // replies.forEach(function (reply, index) {
      //   console.log("Reply " + index + ": " + reply.toString());
      // });
      callback(err,replies);
    });
  };

  var restoreEvent = function (eventId, callback) {
    debugger;
    client.hgetall(eventId, function(err, obj){
      debugger;
      console.log('hg' + err);
      console.log('hg' + obj);
      console.log('ef' + eventFactory.createFromStorage);
      var event = eventFactory.createFromStorage(obj);
      callback(err, event);
    });
  };

  return {
    client       : client,
    quit         : quit,
    storeEvent   : storeEvent,
    restoreEvent : restoreEvent
  }
}

var DataSource = {};
DataSource.newDataSource = newDataSource;
DataSource.storeSet = storeSet;
exports.DataSource = DataSource;
