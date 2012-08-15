var Step     = require('step');
var mongo    = require('mongodb');
var mongolia = require('mongolia');
var DS       = require('ee_DS').DS;

var testEvent =
    {
      id:"example1",
      events:[
        {
          eventType:"board.lease",
          eventEffDt:"01012000",
          eventPostDt:"01012000",
          descriminator:{
            tick:"annual",
            type:"performanceObligation",
            collateralUsefulLife:"15",
            term:"5",
            termOption:"3",
            termEstimate:"5",
            annualLease:"1000",
            rate:".08",
            carryingAmountAtCommencement:"15000"
          }
        },
        {
          eventType:"updateEvent",
          eventEffDt:"12012000",
          eventPostDt:"12012000",
          descriminator:{
            termEstimate:"3",
          }
        },
      ]
    };

/**
 * initialize the connections
 */
var db = DS.getDS('engine');

/**
 */
var User = mongolia.model(db, 'events');
Step (
  function open (){
    db.open(this);
  },
  function afterOpen(err){
    User.mongo('findOne', {name: 'foo'}, this.parallel());
    User.mongo({method: 'insert', hooks: false}, testEvent , this.parallel());
  },
  function close(err, meth1, meth2){
    console.log('meth1' + meth1 + ' meth2' + JSON.stringify(meth2, null, 2));
    db.close();
  }
);
