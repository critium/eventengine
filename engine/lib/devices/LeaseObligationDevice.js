//using strict breaks the const.
"use strict";

// external libraries
var _ = require("underscore");


// 'constants'
// TODO: move these into the Lease obl device class
var tickLength = 'annual';
var tickInvocation = 'endOfPeriod';
var leaseEvents = {
  board   : "obligation.board",
  update  : "obligation.update",
  payment : "obligation.payment",
  tick    : "obligation.tick"
};

// externalize this into a separate class
var FinMath = {
  npv:function(rate, amount, term){
    var val = 0;
    // debugger;
    for(var i = 1; i<=term; i++){
      var denom = 1 + rate;
      denom = Math.pow(denom,i);
      val = val + amount / denom;
    }
    return val;
  }
};

/*
 * Class LeaseObligationDevice
 * event handlers for lease oblibation events
 * code for how the devlice will handle itself
 */
var LeaseObligationDevice = function(){
  this.events = [];
};
// convert this to use a complex object
LeaseObligationDevice.prototype = {
  board:function(event){

    this.events.push(event);

    this.leaseStartDate               = DateUtils.stringToDate(event.eventEffDt);
    this.collateralUsefulLife         = event.descriminator.collateralUsefulLife;
    this.initialLeaseAgreement        = event.descriminator.initialLeaseAgreement;
    this.termOption                   = event.descriminator.termOption;
    this.remTermEstimate              = event.descriminator.remTermEstimate;
    this.annualLease                  = event.descriminator.annualLease;
    this.origRate                     = event.descriminator.rate;
    this.carryingAmountAtCommencement = event.descriminator.carryingAmountAtCommencement;
    this.currPeriod                   = 0;
    this.currPeriodPayment            = 0;
    this.initialLeaseCarryingAmount   = FinMath.npv(this.origRate, this.annualLease, this.remTermEstimate);

    // console.log('tilca: ' + origRate + ' ' + annualLease + ' ' + remTermEstimate);

    this.current = {};
    this.history = [];

    this.initArrays(this.current);

    // period zero payment - not sure if this is the right way to do it....
    //this.pmt[this.currPeriod] = 0;

  },
  rewind:function(event){
    // generic rewind/replay.  - extract this to the outer device defiintions
    //console.log(JSON.stringify(this.current));

    var spliceDate = event.eventEffDt;
    this.history.push(this.current)

    // splice at the splice date.
    this.currPeriod = DateUtils.diffTime( this.leaseStartDate, DateUtils.stringToDate( spliceDate ) );
    var keys = Object.keys(this.current);
    for (var i = 0; i<keys.length; i++){
      var key = keys[i];
      var val = this.current[key];
      // this isnt working!!!!
      // why cant i slice the stupid thign.
      if(_.isArray(val)){
        val = val.slice(0,this.currPeriod);
        this.current[key] = val;
      }
    }
  },
  initArrays:function(current){
    // initialize the arrays for this device
    current.pmt              = new Array();
    current.period           = new Array();
    current.estRemPds        = new Array();
    current.rate             = new Array();
    current.totalRecv        = new Array();
    current.remNPV           = new Array();
    current.pmt              = new Array();
    current.interestInc      = new Array();
    current.leaseInc         = new Array();
    current.amort            = new Array();
    current.lRecvCarrAmt     = new Array();
    current.lLiabiityCarrAmt = new Array();
    current.netRec           = new Array();
    current.lRecv            = new Array();
    current.carryingAmount   = new Array();
  },
  push:function(collection){
    var current = this.current;
    current.period.           push (collection.period);
    current.estRemPds.        push (collection.estRemPds);
    current.rate.             push (collection.rate);
    current.totalRecv.        push (collection.totalRecv);
    current.remNPV.           push (collection.remNPV);
    current.pmt.              push (collection.pmt);
    current.interestInc.      push (collection.interestInc);
    current.leaseInc.         push (collection.leaseInc);
    current.amort.            push (collection.amort);
    current.lRecvCarrAmt.     push (collection.lRecvCarrAmt);
    current.lLiabiityCarrAmt. push (collection.lLiabiityCarrAmt);
    current.netRec.           push (collection.netRec);
    current.lRecv.            push (collection.lRecv);
    current.carryingAmount.   push (collection.carryingAmount);

    var period = collection.period;

    console.log(
      '(p)'+Math.round(current.period           [ period])+'\t'+
      '(e)'+Math.round(current.estRemPds        [ period])+'\t'+
      '(r)'+Math.round(current.rate             [ period])+'\t'+
      '(t)'+Math.round(current.totalRecv        [ period])+'\t'+
      '(r)'+Math.round(current.remNPV           [ period])+'\t'+
      '(p)'+Math.round(current.pmt              [ period])+'\t'+
      '(i)'+Math.round(current.interestInc      [ period])+'\t'+
      '(l)'+Math.round(current.leaseInc         [ period])+'\t'+
      '(a)'+Math.round(current.amort            [ period])+'\t'+
      '(l)'+Math.round(current.lRecvCarrAmt     [ period])+'\t'+
      '(l)'+Math.round(current.lLiabiityCarrAmt [ period])+'\t'+
      '(n)'+Math.round(current.netRec           [ period])+'\t'+
      '(l)'+Math.round(current.lRecv            [ period])+'\t'+
      '(c)'+Math.round(current.carryingAmount   [ period]));
  },
  payment:function(event){
    var paymentAmount = event.descriminator.amount;

    // find the period it affects
    // should exactly match the current period.
    // and push it in.
    // var effDt = event.eventEffDt;

    // period zero payment - not sure if this is the right way to do it....
    //this.pmt[this.currPeriod] = paymentAmount;
    this.currPeriodPayment = paymentAmount;
  },
  update:function(event){
    // find what attributes are updated;
    var self = this;
    _.each(event.descriminator, function(val,key){
      debugger;
      console.log(self + ' ' +key + ' ' + val);
      self[key] = val;
    });

  },
  zeroElse:function(calculation){
    if(this.currPeriod === 0){
      return 0;
    } else {
      return calculation
    }
  },
  tick:function(){
    var current = this.current;
    // periodic calculation
    var period = this.currPeriod;
    var priorPDCarrAmt = 0;
    var priorPDNPV = 0;
    var priorPDRemPDS = this.remTermEstimate;

    if(period === 0){
      priorPDCarrAmt = this.initialLeaseCarryingAmount;
      priorPDNPV =this.initialLeaseCarryingAmount;
    } else {
      priorPDCarrAmt = current.carryingAmount[period-1];
      priorPDNPV = current.remNPV[period-1];
      priorPDRemPDS = current.estRemPds[period-1];
    }

    var estRemPds = this.remTermEstimate - period;
    if(estRemPds >= 0) {
        var rate             = this.origRate;
        var totalRecv        = null;
        var remNPV           = FinMath.npv(rate, this.annualLease, estRemPds);
        var pmt              = this.zeroElse ( this.currPeriodPayment );
        var interestInc      = this.zeroElse ( rate * priorPDNPV );
        var leaseInc         = this.zeroElse ( priorPDCarrAmt / priorPDRemPDS );
        var amort            = this.zeroElse ( -1 * this.carryingAmountAtCommencement / this.collateralUsefulLife );
        var lRecvCarrAmt     = priorPDNPV - pmt + interestInc;
        var lLiabiityCarrAmt = priorPDCarrAmt - leaseInc;
        var netRec           = interestInc + leaseInc + amort;
        var lRecv            = lRecvCarrAmt - remNPV;
        var carryingAmount   = lLiabiityCarrAmt - lRecv;
        debugger;

        var collection = {
          period           : period,
          estRemPds        : estRemPds,
          rate             : rate,
          totalRecv        : totalRecv,
          remNPV           : remNPV,
          pmt              : pmt,
          interestInc      : interestInc,
          leaseInc         : leaseInc,
          amort            : amort,
          lRecvCarrAmt     : lRecvCarrAmt,
          lLiabiityCarrAmt : lLiabiityCarrAmt,
          netRec           : netRec,
          lRecv            : lRecv,
          carryingAmount   : carryingAmount
        };
        this.push(collection);

        // increment the current period
        this.currPeriod = ++period;
      }
  }
};

// processor code
var LeaseObligationDeviceProcessor = function (
  workflow, leaseDevice, events, history, startDate, endDate){
  this.workflow    = workflow;
  this.context     = {};
  this.leaseDevice = leaseDevice;
  this.events      = events;
  this.history     = history;
  this.startDate   = startDate;
  this.endDate     = endDate;
};
LeaseObligationDeviceProcessor.prototype = {
  attachToWorkflow:function(workflow){
    this.workflow = workflow;
  },
  attachHistory:function(history){
    this.history = history;
  },
  initWorkflow:function(){
    var self = this;
    self.workflow
    .on(leaseEvents.board, function(event) {
      var device = new LeaseObligationDevice();
      device.board(event);
      self.history = device;
    })
    .on(leaseEvents.update, function(event) {
      var device = self.history;
      device.update(event);
    })
    .on(leaseEvents.payment, function(event) {
      var device = self.history;
      device.payment(event);
    })
    .on(leaseEvents.tick, function(event) {
      var device = self.history;
      device.tick();
    })
    // standard rewind event
    .on('rewind', function(event) {
      var device = self.history;
      device.rewind(event);
    })
    //standard done event
    .on('done', function(callback) {
      callback(self.history);
    });
  },
  process:function(events, callback){

    // sort by the date
    // UPDATE: This is probably useless since its sorted again later
    events = _.sortBy(events, function(event){
      // console.log(myDate, "rimw: " + myDate.getTime());
      return DateUtils.stringToDate(event.eventEffDt);

    });
    var firstEvent   = _.first(events);
    var firstDateStr = firstEvent.eventEffDt;
    var firstDate    = DateUtils.stringToDate(firstDateStr);
    var startDate    = this.startDate;
    var endDate      = this.endDate;

    if(!startDate){
      startDate = firstDate;
    }

    // add the rewind event if history is present.
    // make sure only the earliest one creates a rewind event
    if(this.history){
      // this should be extracted to a method.  Create using the lEvents[0] position array
      events.unshift(new Event('rewind', firstDateStr));
    }

    var numPeriods = DateUtils.diffTime(startDate, endDate);

    // map periods to ticks
    // start processing
    var resultArr = [];

    // sort the events and group by periods
    for(var i = 0; i< numPeriods; i++){
      var periodStartDate = DateUtils.incInclusiveDt(startDate, i);
      var periodEndDate   = DateUtils.incExclusiveDt(startDate, i+1);
      // debugger;

      // filter out events per period
      var lEvents = _.filter(events, function(event){
        var eventEffDt = DateUtils.stringToDate(event.eventEffDt);
        if(DateUtils.dateBetween(periodStartDate, periodEndDate, eventEffDt)){
          return true;
        }
        return false;
      });

      // i realize i need to resort by event priority here, but just leaving it out for now
      this.emitEvents(lEvents);
      resultArr.push({
        'periodStartDate':periodStartDate,
        'periodEndDate':periodEndDate,
        'events':lEvents
      });
    }
    this.emitEvents(callback);

    // cycle through the resultArr periods
    // for each period, trigger events if found
    // console.log(events);
    // console.log("NP:" + numPeriods);
    // console.log(resultArr);
  },
  emitEvents:function(toEmit){
    if(_.isArray(toEmit)){
      var events = toEmit;
      for(var i=0; i<events.length; i++){
        console.log('myEvent:' + events[i].eventType);
        this.workflow.emit(events[i].eventType, events[i]);
      }
      //emit the tick
      this.workflow.emit(leaseEvents.tick);
    } else if(_.isFunction(toEmit)) {
      var callback = toEmit;
      this.workflow.emit('done', callback);
    }
  },
  setEndDate:function(endDate){
    this.endDate = endDate;
  }
};

var DateUtils = {
  //temporardy helper function
  // YYYYMMDD
  stringToDate : function (dateString){
    var year   = parseInt( dateString.substring(0,4) );
    var month  = parseInt( dateString.substring(4,6) );
    var day    = parseInt( dateString.substring(6,8) );
    return new Date(year, month-1, day);
  },

  diffTime : function (startDate, endDate){
    var timeDiff = endDate.getFullYear() - startDate.getFullYear()

    if(tickLength === 'monthly'){
      timeDiff = timeDiff*12 + endDate.getMonth() - startDate.getMonth()
    }
    return timeDiff;
  },

  incInclusiveDt : function(date, incVal){
    var nDate = new Date(date.getTime());
    if(tickLength==='monthly'){
      var cMonth = date.getMonth();
      var nMonth = cMonth + incVal;
      nDate.setMonth(nMonth);
    }
    if(tickLength==='annual'){
      var cYear = date.getFullYear();
      var nYear = cYear + incVal
      nDate.setFullYear(nYear)
    }
    return nDate;
  },

  incExclusiveDt : function(date, incVal){
    var nDate = this.incInclusiveDt(date, incVal);
    var cSec = nDate.getSeconds();
    var nSec = cSec - 1 ;
    nDate.setSeconds(nSec);

    return nDate;
  },

  dateBetween : function(from, to, testDt){
    var startTime = from.getTime();
    var endTime   = to.getTime();
    var checkTime = testDt.getTime();
    if(startTime <= checkTime && endTime >= checkTime){
      return true;
    }
    return false;
  }
};

// beingtesting code here
var Emitter = require("events").EventEmitter;
var test    = new LeaseObligationDeviceProcessor(new Emitter());
test.initWorkflow();

var Event = function(eventType, eventEffDt, eventPostDt, descriminator) {
  this.eventType     = eventType;
  this.eventEffDt    = eventEffDt;
  this.eventPostDt   = eventPostDt;
  this.descriminator = descriminator;
  this.toString      = function(){
    return 'type:' + this.eventType + ' effDt:' + this.eventEffDt;
  }
};
var events = new Array();
events.push(new Event(
  leaseEvents.update,
  "20010101",
  "20010101",
  {
    remTermEstimate:"5",
  }
));
events.push(new Event(
  leaseEvents.payment,
  "20010101",
  "20010101",
  {
    amount:"1000",
  }
));
events.push(new Event(
  leaseEvents.board,
  "20000101",
  "20000101",
  {
    tick:"annual",
    type:"performanceObligation",
    collateralUsefulLife:"15",
    term:"5",
    termOption:"3",
    remTermEstimate:"3",
    annualLease:"1000",
    rate:".08",
    carryingAmountAtCommencement:"15000"
  }
));
test.setEndDate(new Date('2006/01/01'));
test.process(events, function (device) {
  console.log("DONE DONE AND DONE");
  var test2 = new LeaseObligationDeviceProcessor(new Emitter());
  events = new Array();
  events.push(new Event(
    leaseEvents.update,
    "20020101",
    "20010101",
    {
      remTermEstimate:"2"
    }
  ));
  test2.attachHistory(device);
  test2.initWorkflow();
  test2.setEndDate(new Date('2006/01/01'));
  test2.process(events, function(device){
    console.log("done, really");
  });
});


//var testRewindreplay = function (device){
  //var test2 = new LeaseObligationDeviceProcessor(new Emitter());
  //test2.initWorkflow();
  //events = new Array();
  //events.push(new Event(
    //leaseEvents.update,
    //"20020101",
    //"20010101",
    //{
      //remTermEstimate:"4"
    //}
  //));
  //test2.attachToWorkflow(device);
  //test2.initWorkflow();
  //test2.process(events, function(device){
    //console.log("done, really");
  //});
//};


