/**
 * Lease Obligation Device
 */
"use strict";

// external libraries
var spring    = require('../utils/spring.js');
var MY        = GLOBAL.MY;
var US        = MY.underscore();
var Log       = MY.logger();
var FinMath   = MY.FinMath();
var DateUtils = MY.DateUtils();
var Event     = MY.Event();

debugger;





// 'constants'
// TODO: move these into the Lease obl device class
// TODO: Convert these to real constants. per ES5 spec.
var tickLength = DateUtils.tick.annual;
var tickInvocation = 'endOfPeriod';
var leaseEvents = {
  board   : "obligation.board",
  update  : "obligation.update",
  payment : "obligation.payment",
  tick    : "obligation.tick"
};


/**
 * EventRenderer for the website for showing LeaseObligationDevice
 * Events
 * TODO
 */
var LeaseObligationEventRenderer = {};


/**
 * Renderer for the website for showing LeaseObligationDevice
 * Result
 * TODO
 */
var LeaseObligationResultRenderer = {};


/*
 * Class LeaseObligationDevice
 * event handlers for lease oblibation events
 * code for how the devlice will handle itself
 *
 * This is where the event processing code lives
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
    this.currPeriod = DateUtils.diffTime(
      this.leaseStartDate,
      DateUtils.stringToDate( spliceDate ),
      this.tickLength);

    var keys = Object.keys(this.current);
    for (var i = 0; i<keys.length; i++){
      var key = keys[i];
      var val = this.current[key];

      if(US.isArray(val)){
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

    Log.trace(
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
    US.each(event.descriminator, function(val,key){
      debugger;
      //console.log(self + ' ' +key + ' ' + val);
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







/**
 * Device Processors are the glue that connects events to the event handler
 *
 * most of this can be extracted to outer classes and genericized
 */
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
    //TODO: Need to fail-fast here.
    //Add Fail fast on improperly created Devices
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
    //TODO: need fail-fast here.
    //Exit if process will fail
    if(!this.endDate && !US.isDate(this.endDate) ){
      throw ('cannot process events due to missing end date');
    }

    // sort by the date
    // UPDATE: This is probably useless since its sorted again later
    events = US.sortBy(events, function(event){
      return DateUtils.stringToDate(event.eventEffDt);
    });
    debugger;
    var firstEvent   = US.first(events);
    var firstDateStr = firstEvent.eventEffDt;
    var firstDate    = DateUtils.stringToDate(firstDateStr);
    var startDate    = this.startDate;
    var endDate      = this.endDate;

    if(!startDate){
      startDate = firstDate;
    }

    //Log.trace(firstDate + ' ' + startDate + 'ed:' + endDate);

    // add the rewind event if history is present.
    // make sure only the earliest one creates a rewind event
    if(this.history){
      // this should be extracted to a method.  Create using the lEvents[0] position array
      events.unshift(Event.createEvent('rewind', firstDateStr));
    }

    var numPeriods = DateUtils.diffTime(startDate, endDate, tickLength);

    // map periods to ticks
    // start processing
    var resultArr = [];

    // sort the events and group by periods
    for(var i = 0; i< numPeriods; i++){
      var periodStartDate = DateUtils.incInclusiveDt(startDate , i   , tickLength);
      var periodEndDate   = DateUtils.incExclusiveDt(startDate , i+1 , tickLength);
      // debugger;

      // filter out events per period
      var lEvents = US.filter(events, function(event){
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
    if(US.isArray(toEmit)){
      var events = toEmit;
      for(var i=0; i<events.length; i++){
        //Log.trace('myEvent:' + events[i].eventType);
        this.workflow.emit(events[i].eventType, events[i]);
      }
      //emit the tick
      this.workflow.emit(leaseEvents.tick);
    } else if(US.isFunction(toEmit)) {
      var callback = toEmit;
      this.workflow.emit('done', callback);
    }
  },
  setEndDate:function(endDate){
    this.endDate = endDate;
  }
};





////////////////////////////
// beingtesting code here //
////////////////////////////

function testLeaseObligatiion(){
  var Emitter = require("events").EventEmitter;
  var test    = new LeaseObligationDeviceProcessor(new Emitter());

  var events = new Array();
  events.push(Event.createEvent(
    leaseEvents.update,
    "20010101",
    "20010101",
    {
      remTermEstimate:"5",
    }
  ));
  events.push(Event.createEvent(
    leaseEvents.payment,
    "20010101",
    "20010101",
    {
      amount:"1000",
    }
  ));
  events.push(Event.createEvent(
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
  test.initWorkflow();
  test.setEndDate(new Date('2006/01/01'));
  test.process(events, function (device) {
    // this inner function creates an event that causes a rewind/repla
    //console.log("DONE DONE AND DONE");
    var test2 = new LeaseObligationDeviceProcessor(new Emitter());
    events = new Array();
    events.push(Event.createEvent(
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
      //console.log("done with rewind");
      Log.trace(JSON.stringify(device,null,2));
    });
  });
}


testLeaseObligatiion();

//Bulk, Performance test
//var start = +new Date();
//for (var i=0; i<10000; i++){
  //testLeaseObligatiion();
  //if(i%(1000)===0)
    //process.stdout.write("*");
  //if(i === 10000)
    //console.log('finished');
//}
//var end = +new Date();
//console.log("Elapsed:" + (end-start)/1000);
