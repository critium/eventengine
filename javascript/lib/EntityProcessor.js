

var EntityProcessor  = new function(entityId, startDate, currentDate){
  //load events
  var events = findEvents(entityId);
  //load history
  var history = findHistory(entityId, currentDate);
  //process the event

  //generate the report
};


export.EntityProcessor = EntityProcessor;
