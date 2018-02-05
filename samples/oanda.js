"use strict";

const { createContext } = require('../lib/oanda');
const fs = require('fs');
const util = require('util');

const cfg = JSON.parse(fs.readFileSync('./oanda.json').toString());

let ctx = createContext(cfg.hostname, cfg.port, cfg.ssl, 'oanda samples', cfg.token);
let streamctx = createContext(cfg.streaming_hostname, cfg.port, cfg.ssl, 'oanda samples', cfg.token);

let curaccountid = '';

function priceToString(price) {
    return (
        price.instrument + " "
        + price.time + " " +
        price.bids[0].price + "/" +
        price.asks[0].price
    );
}

ctx.account.list((response) => {
    console.log(JSON.stringify(response));

    if (response.statusCode == 200) {
        curaccountid = response.body.accounts[0].id;

        ctx.account.get(curaccountid, (response1) => {
            console.log(JSON.stringify(response1));

            streamctx.pricing.stream(
                curaccountid,
                {
                    instruments: ['EUR_USD', 'USD_CAD'],
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
        });
    }
});