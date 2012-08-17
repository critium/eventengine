/**
 * Fin Math class.
 */
"use strict";



/*
 * NPV function.
 * @rate
 * @amount
 * @term
 */
exports.npv = function(rate, amount, term){
  var val = 0;
  // debugger;
  for(var i = 1; i<=term; i++){
    var denom = 1 + rate;
    denom = Math.pow(denom,i);
    val = val + amount / denom;
  }
  return val;
};
