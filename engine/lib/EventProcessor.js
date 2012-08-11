var _ = require("underscore");


// TODO : not sure I want to do constructors this way.  Might want to look up Object.create
//      : because its an unclean use of a function.
function EventProcessor (events, history, startDate, endDate){
  this.events = events;
  this.history = history;
  this.startDate = startDate;
  this.endDate = endDate;
}
EventProcessor.prototype = {
  events:[],
  process: function(){
    var events = this.events;
    if(!_.isArray(events)){
      throw("events must be an array object: " + typeof events)
    }
    debugger;
    events.map( function ( event ) {
      console.log(event);
    });
  }
};

var ds = require('.././test/example1and2.js').datasource;
debugger;
var example1 = ds.leases[0].events;

var eventProcessor = new EventProcessor(example1, null, null, null);
eventProcessor.process();


