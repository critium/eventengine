exports.result = {
  events: [
    {
      eventType: 'obligation.board',
      eventEffDt: 20000101,
      eventPostDt: 20000101,
      descriminator: {
        tick: 'annual',
        type: 'performanceObligation',
        collateralUsefulLife: 15,
        term: 5,
        termOption: 3,
        remTermEstimate: 3,
        annualLease: 1000,
        rate: .08,
        carryingAmountAtCommencement: 15000
      }
    }
  ],
  leaseStartDate: '2000-01-01T05:00:00.000Z',
  collateralUsefulLife: 15,
  termOption: 3,
  remTermEstimate: 2,
  annualLease: 1000,
  origRate: .08,
  carryingAmountAtCommencement: 15000,
  currPeriod: 3,
  currPeriodPayment: 1000,
  initialLeaseCarryingAmount: 2577.0969872478786,
  current: {
    pmt: [
      0,
      1000,
      1000
    ],
    period: [
      0,
      1,
      2
    ],
    estRemPds: [
      3,
      4,
      0
    ],
    rate: [
      .08,
      .08,
      .08
    ],
    totalRecv: [
      null,
      null,
      null
    ],
    remNPV: [
      2577.0969872478786,
      3312.126840044332,
      0
    ],
    interestInc: [
      0,
      206.1677589798303,
      264.97014720354656
    ],
    leaseInc: [
      0,
      859.0323290826262,
      811.7316879954687
    ],
    amort: [
      0,
      -1000,
      -1000
    ],
    lRecvCarrAmt: [
      2577.0969872478786,
      1783.2647462277089,
      2577.0969872478786
    ],
    lLiabiityCarrAmt: [
      2577.0969872478786,
      1718.0646581652522,
      2435.1950639864062
    ],
    netRec: [
      0,
      65.20008806245642,
      76.70183519901525
    ],
    lRecv: [
      0,
      -1528.862093816623,
      2577.0969872478786
    ],
    carryingAmount: [
      2577.0969872478786,
      3246.926751981875,
      -141.90192326147235
    ]
  },
  history: [
    {
      pmt: [
        0,
        1000,
        1000
      ],
      period: [
        0,
        1,
        2
      ],
      estRemPds: [
        3,
        4,
        0
      ],
      rate: [
        .08,
        .08,
        .08
      ],
      totalRecv: [
        null,
        null,
        null
      ],
      remNPV: [
        2577.0969872478786,
        3312.126840044332,
        0
      ],
      interestInc: [
        0,
        206.1677589798303,
        264.97014720354656
      ],
      leaseInc: [
        0,
        859.0323290826262,
        811.7316879954687
      ],
      amort: [
        0,
        -1000,
        -1000
      ],
      lRecvCarrAmt: [
        2577.0969872478786,
        1783.2647462277089,
        2577.0969872478786
      ],
      lLiabiityCarrAmt: [
        2577.0969872478786,
        1718.0646581652522,
        2435.1950639864062
      ],
      netRec: [
        0,
        65.20008806245642,
        76.70183519901525
      ],
      lRecv: [
        0,
        -1528.862093816623,
        2577.0969872478786
      ],
      carryingAmount: [
        2577.0969872478786,
        3246.926751981875,
        -141.90192326147235
      ]
    }
  ]
}
