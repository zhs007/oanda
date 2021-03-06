"use strict";

const Context = require('@oanda/v20/context').Context;
const moment = require('moment-timezone');

const DEFAULT_TIMEZONE = 'America/New_York';

function createContext(hostname, port, ssl, appname, token) {
    let ctx = new Context(hostname, port, ssl, appname);

    ctx.setToken(token);

    return ctx;
}

// ymd is like 2018-01-01
// timezone is America/New_York
// return { begintime, endtime }
function countTradingDay(ymd) {
    let ct = moment.tz(ymd, DEFAULT_TIMEZONE);
    return {
        begintime: ct.utc().format(),
        endtime: ct.add(1, 'days').utc().format()
    };

    let cwd = ct.weekday();
    if (cwd == 6) {
        return {
            begintime: ct.hour(17),
            endtime: ct.add(1, 'day')
        };
    }
    else if (cwd == 4) {
        return {
            begintime: ct,
            endtime: ct.hour(17)
        };
    }
    else if (cwd != 5) {
        return {
            begintime: ct,
            endtime: ct.add(1, 'day')
        };
    }

    return undefined;
}

exports.createContext = createContext;
exports.countTradingDay = countTradingDay;
