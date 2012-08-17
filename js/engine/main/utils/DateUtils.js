"use strict";
/*
 * helper function
 * YYYYMMDD
 */


var tick = {};
GLOBAL.MY.defineConst(tick , 'monthly' , 'monthly');
GLOBAL.MY.defineConst(tick , 'annual'  , 'annual');

exports.tick = tick;
exports.stringToDate = function (dateString){
  var year   = parseInt( dateString.substring(0,4) );
  var month  = parseInt( dateString.substring(4,6) );
  var day    = parseInt( dateString.substring(6,8) );
  return new Date(year, month-1, day);
};

exports.diffTime = function (startDate, endDate, tickLength){
  var timeDiff = endDate.getFullYear() - startDate.getFullYear()

  if(tickLength === tick.monthly){
    timeDiff = timeDiff*12 + endDate.getMonth() - startDate.getMonth()
  }
  return timeDiff;
};

exports.incInclusiveDt = function(date, incVal, tickLength){
  var nDate = new Date(date.getTime());
  if(tickLength===tick.monthly){
    var cMonth = date.getMonth();
    var nMonth = cMonth + incVal;
    nDate.setMonth(nMonth);
  }
  if(tickLength===tick.annual){
    var cYear = date.getFullYear();
    var nYear = cYear + incVal
    nDate.setFullYear(nYear)
  }
  return nDate;
};

exports.incExclusiveDt = function(date, incVal, tickLength){
  var nDate = this.incInclusiveDt(date, incVal, tickLength);
  var cSec = nDate.getSeconds();
  var nSec = cSec - 1 ;
  nDate.setSeconds(nSec);

  return nDate;
};

exports.dateBetween = function(from, to, testDt){
  var startTime = from.getTime();
  var endTime   = to.getTime();
  var checkTime = testDt.getTime();
  if(startTime <= checkTime && endTime >= checkTime){
    return true;
  }
  return false;
};
