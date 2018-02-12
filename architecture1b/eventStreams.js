#!/usr/bin/env node
const Promise = require('bluebird');

const fixtures = require('../fixtures');
const dbCommons = require('./dbCommons');
const {sdkInitEventStream} = fixtures;

const LOG_EVERY_Nth_EVENT = 10;

let sdkInitEventCount = 0;      // for logging purposes only

Promise.resolve()
    .then(dbCommons.ping)
    .then(dbCommons.createSdkVersionForClientTable)
    .then(dbCommons.createDefaultMetricsTable)
    .then(startListeningSDKInitEventStream)
    .catch(function (err) {
        console.trace("WTF?");
        console.trace(err);
    });


function startListeningSDKInitEventStream() {
    console.log("Starting listening sdk event stream");
    sdkInitEventStream(function (sdkInitEvent) {
        sdkInitEventCount++;
        if (sdkInitEventCount % LOG_EVERY_Nth_EVENT === 1) {
            console.log(`Processing sdkInitEvent #${sdkInitEventCount}`);
        }

        return dbCommons.processSDKInitEvent(sdkInitEvent);
    });
    return Promise.resolve();
}