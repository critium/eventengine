'use strict'
var objectUtils = require('./ObjectUtils')


var separator = ',';

/*
 * line is the csv line you want read
 * template is the template object you want hydrated.  Function objects only please
 * <name> name of fucntion object variable to hydrate
 * <index> zero-based position of the value you want to use to hydrate the name variable
 */
var hydrate = function (line, template) {
  // check to make sure we have the right amount of arguments
  if(arguments.length < 4){
    throw('unable to parse line with less than 4 arguments, should have even number of arguments with format <name>, <index>');
  }

  if(arguments.length % 2 !== 0){
    throw('cannot parse line with uneven arguments. Must be in format <name>, <index>');
  }

  //convert the input paramters into a mapper array
  var mapper = [];
  var position = [];
  for (var i = 2; i < arguments.length; i=i+2){
    var oName = arguments[i];
    var index = arguments[i+1];
    //console.log('oName: ' + oName + ' index: ' + index);
    mapper.push(oName);
    position.push(index);
  }

  return mapperHydrate(line, template, mapper, position);
};


/*
  mapper hydrate hydrates based on a template object.
  line - line of csv you want read.
  template - template object.  Function objects only.  Throws exception otherwise.
  mapper - array mapping csv to template object
  */
var mapperHydrate = function (line, template, mapper, position){
  //todo
  //if mapper and position dont match
  //is mapper and position are zero length
  //add exception to object, note error, but do not fail

  var object = {};
  try {
    object = new template();
  } catch (err) {
    throw('function objects only please');
  }

  debugger;

  if(! mapper instanceof Array){
    throw('mapper must be of type array' + typeof mapper );
  }
  if(! position instanceof Array){
    throw('position must be of type array' + typeof position );
  }

  var parsed = line.split(separator);
  for(var i=0; i<mapper.length; i++){
    // console.log(mapper[i] + ' ' + position[i] + ' ' + parsed[position[i]] + ' obj: ');
    var sObject = objectUtils.setObject(object, mapper[i], parsed[position[i]]);
    sObject = parsed[position[i]];
  }

  return object;
}


////////////////////////////////
// export for use as a module //
////////////////////////////////
var csvParser = {};
csvParser.hydrate = hydrate;
csvParser.mapperHydrate = mapperHydrate;
exports.CSVParser = csvParser;


////////////////
// unit tests //
////////////////
var test = function () {
  //var testcsv = '2008,0000001741,1,1,1,1,1,00073,3,6,11260,02,020,0015.00,2,5,5, , , , ,8, , , , ,2,5,0041,0, , , ,na   ,2,4, ,0182052,00005275,021.80,00077700,120.54,00001500,00001858,2';
  var testcsv = '1,36,1000.00,20001231,20001231,board';
  try {
    hydrate(testcsv, testobj);
  } catch (err) {
    //expected to fail due to not enough variables
    console.log('caughtexception: ' + err)
  }

  try {
    hydrate(testcsv, testobj, 'id', 1, 'periods');
  } catch (err) {
    //expected to fail due to not having even number of vardiables
    console.log('caughtexception: ' + err)
  }

  try {
    var testobj = {
      id             : null,
      correspondence : null,
      periods        : null,
      payment        : null
    }
    var hydrated = hydrate(testcsv, testobj, 'correspondence', 1, 'periods', 2);
  } catch (err) {
    //expected to fail due to testobj not being a function object
    console.log('caughtexception: ' + err)
  }

  try {
    var testobj = function (){
      return {
        id      : null ,
        cid     : null ,
        periods : null ,
        blah    : {
          payment: null,
          blah2: {
            deep: {
              val: null
            }
          }
        }
      };
    };
    var hydrated = hydrate(testcsv, testobj, 'cid', 0, 'blah/payment', 2, 'blah/blah2/deep/val', 2);
    debugger
    console.log(hydrated);
  } catch (err) {
    //expected to fail due to testobj not being a function object
    console.log('caughtexception: ' + err)
  }
}
// test();
