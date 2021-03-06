
exports.datasource = {
  leases:[
    {
      id:"example1",
      events:[
        {
          eventType:"obligation.board",
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
          eventType:"obligation.update",
          eventEffDt:"12012000",
          eventPostDt:"12012000",
          descriminator:{
            termEstimate:"3",
          }
        },
      ]
    },
    {
      id:"example2",
      events:[
        {
          eventType:"obligation.board",
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
          eventType:"obligation.update",
          eventEffDt:"12012000",
          eventPostDt:"12012000",
          descriminator:{
            termEstimate:"3",
          }
        },
      ]
    },
  ]
}
