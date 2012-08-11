var _ = require('underscore')._;
var objectUtils = require('./ObjectUtils').objectUtils;

var Event = function (){
  this.id=null;
  this.cid=null;
  this.type=null;
  this.org=null;
  this.group=null;
  this.effectiveDate=null;
  this.postingDate=null;
  this.descriminator=null
}

var leaseDescriminator = function (){
  return {
    type:'leaseDescriminator',
    term:null,
    payment:null
  };
};


var leaseEvent = function (){
  var baseEvent = new Event();
  var descriminator = new leaseDescriminator();
  baseEvent.descriminator = descriminator;

  // this should be extracted to a common class,
  // or maybe even as a prototype.
  baseEvent.toStore = function (){
    var toStore = {};
    debugger;
    for(property in baseEvent){
      if(property === 'toStore'){
        console.log('skipping');
      } else if(property === 'descriminator'){
        for(dProp in baseEvent.descriminator){
          if(baseEvent.descriminator.hasOwnProperty(dProp)){
            var newKey = 'descriminator/'+dProp;
            toStore[newKey] = baseEvent.descriminator[dProp];
          }
        }
      }
      else if(baseEvent.hasOwnProperty(property) ){
        toStore[property] = baseEvent[property];
      }
    };
    return toStore;
  }

  return baseEvent;
}

var createFromStorage = function (source){
  var baseEvent = new Event();
  var descriminator = new leaseDescriminator();
  baseEvent.descriminator = descriminator;

  for(dbProp in source){
    if(source.hasOwnProperty(dbProp)){
      objectUtils.setObject(baseEvent, dbProp, source[dbProp])
    }
  }
};


var eventFactory               = {};
eventFactory.leaseEvent        = leaseEvent;
eventFactory.createFromStorage = createFromStorage;
exports.eventFactory           = eventFactory;
