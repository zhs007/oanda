"use strict";

const { createContext, countTradingDay } = require('../lib/oanda');
const fs = require('fs');
const moment = require('moment');
const util = require('util');

const cfg = JSON.parse(fs.readFileSync('./oanda.json').toString());

let ctx = createContext(cfg.hostname, cfg.port, cfg.ssl, 'oanda samples', cfg.token);
let streamctx = createContext(cfg.streaming_hostname, cfg.port, cfg.ssl, 'oanda samples', cfg.token);

let curaccountid = '';

function getPriceStream(sctx, accountid, instruments) {
    sctx.pricing.stream(
        accountid,
        {
            instruments: instruments,
            snapshot: true
        },

        (message) => {
            if (message.type == "HEARTBEAT") {
                console.log(message.summary());

                return;
            }

            console.log(JSON.stringify(message));
        },

        (response2) => {
            console.log(response2);
        }
    );
}

function getHistory(ctx, instrument, ymd) {
    let td = countTradingDay(ymd);
    if (td == undefined) {
        return ;
    }

    ctx.instrument.candles(instrument, {
        price: 'BA',
        from: td.begintime,
        to: td.endtime,
        granularity: 'M1'
    }, (response1) => {
        console.log(JSON.stringify(response1));
    });
}

// function priceToString(price) {
//     return (
//         price.instrument + " "
//         + price.time + " " +
//         price.bids[0].price + "/" +
//         price.asks[0].price
//     );
// }

ctx.account.list((response) => {
    console.log(JSON.stringify(response));

    if (response.statusCode == 200) {
        curaccountid = response.body.accounts[0].id;

        ctx.account.get(curaccountid, (response1) => {
            console.log(JSON.stringify(response1));

            // getPriceStream(streamctx, curaccountid, ['EUR_USD', 'USD_CAD']);

            getHistory(ctx, 'EUR_USD', '2017-02-05');
        });
    }
});