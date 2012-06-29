//var fs = require('fs');
//
//var filename = "test.js";
//
//var s = fs.ReadStream(filename);
//s.on('data', function(d) {
//	console.log("LINE" + d.toString());
//});
//
// Putting in the requires
var lazy      = require('lazy');
var fs        = require('fs');
var csvParser = require('./CSVParser').CSVParser;
var eventFactory = require('./Event').eventFactory;

console.log(eventFactory);
var test = eventFactory.leaseEvent();

var ctr = 0;
var incCtr = function(){
  ctr = ctr + 1;
  //if(ctr % 1000000 == 0){
  //	console.log("CTR: " + ctr);
  //}
}


//temporary hack...should be reading definition.csv
var definition = ['identifier' , 'term'               , 'payment'               , 'effectivedate' , 'postingdate' , 'event'];
var mapper     = ['cid'        , 'descriminator/term' , 'descriminator/payment' , 'effectiveDate' , 'postingDate' , 'type'];
var position   = [0            , 1                    , 2                       , 3               , 4             , 5];
new lazy(fs.createReadStream('./sampledata.csv', {start: 0, }))
.lines
.forEach(function(line){
  var strLine = line.toString();
  console.log("Parsing line: " + strLine);
  var hd = csvParser.mapperHydrate(strLine,eventFactory.leaseEvent,mapper,position);
  console.log(hd);
  //redis.store(hd);

}
);
