/**
 * Event Class
 */
"use strict";


var Event = function(eventType, eventEffDt, eventPostDt, descriminator) {
  this.eventType     = eventType;
  this.eventEffDt    = eventEffDt;
  this.eventPostDt   = eventPostDt;
  this.descriminator = descriminator;
  this.toString      = function(){
    return 'type:' + this.eventType + ' effDt:' + this.eventEffDt;
  }
};

/*
 * base Event
 */
exports.createEvent = function(eventType, eventEffDt, eventPostDt, descriminator) {
  var event = new Event(eventType, eventEffDt, eventPostDt, descriminator);
  return event;
};

