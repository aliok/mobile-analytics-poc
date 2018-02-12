#!/usr/bin/env node
const Promise = require('bluebird');

const fixtures = require('../fixtures');
const elasticSearchCommons = require('./elasticSearchCommons');
const {sdkInitEventStream, buttonMetricsStream} = fixtures;

const LOG_EVERY_Nth_EVENT = 10;

let sdkInitEventCount = 0;
let buttonMetricsCount = 0;

Promise.resolve()
    .then(function () {
        return elasticSearchCommons.connect()
    })
    .catch(function (error) {
        console.trace('elasticsearch cluster is down! exiting');
        console.trace(error.message);
        // this will kill everything, including the promise chain
        process.exit(-1);
    })
    .then(elasticSearchCommons.deleteIndices)
    .then(elasticSearchCommons.createIndices)
    .then(startListeningSDKInitEventStream)
    .then(startListeningButtonMetricsStream)
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
        elasticSearchCommons.processSDKInitEvent(sdkInitEvent);
    });
    return Promise.resolve();
}

function startListeningButtonMetricsStream() {
    console.log("Starting listening button metrics stream");
    buttonMetricsStream(function (buttonMetrics) {
        buttonMetricsCount++;
        if (buttonMetricsCount % LOG_EVERY_Nth_EVENT === 1) {
            console.log(`Processing buttonMetrics #${buttonMetricsCount}`);
        }
        elasticSearchCommons.processButtonMetrics(buttonMetrics);
    });
    return Promise.resolve();
}