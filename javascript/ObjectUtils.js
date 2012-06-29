

var nsSeparator = '/';
var setObject = function(baseobject, namespace, value){
  //console.log(baseobject);
  var nsIndex = namespace.indexOf(nsSeparator);

  if(nsIndex > 0){
    var ns0     = namespace.substring(0, nsIndex);
    var ns$     = namespace.substring(nsIndex + 1, namespace.length);
    var tObject = baseobject[ns0];
    console.log(tObject + ' ' + ns0 + ' to ' + ns$);
    return setObject(tObject,ns$,value);
  } else {
    return baseobject[namespace] = value;
  }
};


var objectUtils = {};
objectUtils.setObject = setObject;

exports.objectUtils = objectUtils;
