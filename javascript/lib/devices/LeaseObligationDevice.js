var _ = require("underscore");



var tickLength = 'annual';
var tickInvocation = 'endOfPeriod';
var leaseEvents = {
  board   : "obligation.board",
  update  : "obligation.update",
  payment : "obligation.payment",
  tick    : "obligation.tick"
};

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


// code for how the devlice will handle itself
var LeaseObligationDevice = function(){
  this.events = [];
};
// convert this to use a complex object
LeaseObligationDevice.prototype = {
  board:function(event){

    this.events.push(event);

    this.leaseStartDate               = event.eventEffDt;
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

    this.initArrays();

    // period zero payment - not sure if this is the right way to do it....
    //this.pmt[this.currPeriod] = 0;

  },
  initArrays:function(){
    // initialize the arrays for this device
    this.pmt              = new Array();
    this.period           = new Array();
    this.estRemPds        = new Array();
    this.rate             = new Array();
    this.totalRecv        = new Array();
    this.remNPV           = new Array();
    this.pmt              = new Array();
    this.interestInc      = new Array();
    this.leaseInc         = new Array();
    this.amort            = new Array();
    this.lRecvCarrAmt     = new Array();
    this.lLiabiityCarrAmt = new Array();
    this.netRec           = new Array();
    this.lRecv            = new Array();
    this.carryingAmount   = new Array();
  },
  push:function(collection){
    this.period.           push (collection.period);
    this.estRemPds.        push (collection.estRemPds);
    this.rate.             push (collection.rate);
    this.totalRecv.        push (collection.totalRecv);
    this.remNPV.           push (collection.remNPV);
    this.pmt.              push (collection.pmt);
    this.interestInc.      push (collection.interestInc);
    this.leaseInc.         push (collection.leaseInc);
    this.amort.            push (collection.amort);
    this.lRecvCarrAmt.     push (collection.lRecvCarrAmt);
    this.lLiabiityCarrAmt. push (collection.lLiabiityCarrAmt);
    this.netRec.           push (collection.netRec);
    this.lRecv.            push (collection.lRecv);
    this.carryingAmount.   push (collection.carryingAmount);

    var period = collection.period;

    console.log(
      '(p)'+Math.round(this.period[period])+'\t'+
      '(e)'+Math.round(this.estRemPds[period])+'\t'+
      '(r)'+Math.round(this.rate[period])+'\t'+
      '(t)'+Math.round(this.totalRecv[period])+'\t'+
      '(r)'+Math.round(this.remNPV[period])+'\t'+
      '(p)'+Math.round(this.pmt[period])+'\t'+
      '(i)'+Math.round(this.interestInc[period])+'\t'+
      '(l)'+Math.round(this.leaseInc[period])+'\t'+
      '(a)'+Math.round(this.amort[period])+'\t'+
      '(l)'+Math.round(this.lRecvCarrAmt[period])+'\t'+
      '(l)'+Math.round(this.lLiabiityCarrAmt[period])+'\t'+
      '(n)'+Math.round(this.netRec[period])+'\t'+
      '(l)'+Math.round(this.lRecv[period])+'\t'+
      '(c)'+Math.round(this.carryingAmount[period]));
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
    // periodic calculation
    var period = this.currPeriod;
    var priorPDCarrAmt = 0;
    var priorPDNPV = 0;
    var priorPDRemPDS = this.remTermEstimate;

    if(period === 0){
      priorPDCarrAmt = this.initialLeaseCarryingAmount;
      priorPDNPV = this.initialLeaseCarryingAmount;
    } else {
      priorPDCarrAmt = this.carryingAmount[period-1];
      priorPDNPV = this.remNPV[period-1];
      priorPDRemPDS = this.estRemPds[period-1];
    }


    var estRemPds        = this.remTermEstimate - period;
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
  initWorkflow:function(){
    this.workflow
    .on(leaseEvents.board, function(event) {
      var device = new LeaseObligationDevice();
      device.board(event);
      this.history = device;
    })
    .on(leaseEvents.update, function(event) {
      var device = this.history;
      device.update(event);
    })
    .on(leaseEvents.payment, function(event) {
      var device = this.history;
      device.payment(event);
    })
    .on(leaseEvents.tick, function(event) {
      this.history.tick();
    });
  },
  process:function(events){
    // sort by the date
    // UPDATE: This is probably useless
    events = _.sortBy(events, function(event){
      // console.log(myDate, "rimw: " + myDate.getTime());
      return stringToDate(event.eventEffDt);

    });
    var firstEvent   = _.first(events);
    var firstDateStr = firstEvent.eventEffDt;
    var firstDate    = stringToDate(firstDateStr);
    var startDate    = this.startDate;
    var endDate      = this.endDate;

    if(!startDate){
      startDate = firstDate;
    }
    var numPeriods = diffTime(startDate, endDate);

    // map periods to ticks
    // start processing
    var resultArr = [];
    for(var i = 0; i< numPeriods; i++){
      var periodStartDate = incInclusiveDt(startDate, i);
      var periodEndDate   = incExclusiveDt(startDate, i+1);
      // debugger;

      // filter out events per period
      var lEvents = _.filter(events, function(event){
        var eventEffDt = stringToDate(event.eventEffDt);
        //console.log('event:' + event + " " + eventEffDt);
        if(dateBetween(periodStartDate, periodEndDate, eventEffDt)){
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

    // cycle through the resultArr periods
    // for each period, trigger events if found
    // console.log(events);
    // console.log("NP:" + numPeriods);
    // console.log(resultArr);
  },
  emitEvents:function(events){
    if(_.isArray(events)){
      for(var i=0; i<events.length; i++){
        console.log('myEvent:' + events[i].eventType);
        this.workflow.emit(events[i].eventType, events[i]);
      }
      //emit the tick
      this.workflow.emit(leaseEvents.tick);
    }
  },
  setEndDate:function(endDate){
    this.endDate = endDate;
  }
};
//temporardy helper function
// YYYYMMDD
var stringToDate = function (dateString){
  var year   = parseInt( dateString.substring(0,4) );
  var month  = parseInt( dateString.substring(4,6) );
  var day    = parseInt( dateString.substring(6,8) );
  return new Date(year, month-1, day);
}

var diffTime = function (startDate, endDate){
  var timeDiff = endDate.getFullYear() - startDate.getFullYear()

  if(tickLength === 'monthly'){
    timeDiff = timeDiff*12 + endDate.getMonth() - startDate.getMonth()
  }
  return timeDiff;
}

var incInclusiveDt = function(date, incVal){
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
}

var incExclusiveDt = function(date, incVal){
  var nDate = incInclusiveDt(date, incVal);
  var cSec = nDate.getSeconds();
  var nSec = cSec - 1 ;
  nDate.setSeconds(nSec);

  return nDate;
}

var dateBetween = function(from, to, testDt){
  var startTime = from.getTime();
  var endTime   = to.getTime();
  var checkTime = testDt.getTime();
  if(startTime <= checkTime && endTime >= checkTime){
    return true;
  }
  return false;
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
test.setEndDate(new Date('2003/01/01'));
test.process(events);





