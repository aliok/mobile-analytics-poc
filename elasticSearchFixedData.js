#!/usr/bin/env node
const Promise = require('bluebird');

const fixtures = require('./fixtures');
const elasticSearchCommons = require('./elasticSearchCommons');
const {fixedButtonMetrics, fixedSdkInitEvents} = fixtures;

const LOG_EVERY_Nth_EVENT = 10;

const CONCURRENCY = 20;

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
    .then(processSdkInitEvents)
    .then(processButtonMetrics)
    .catch(function (err) {
        console.trace("WTF?");
        console.trace(err);
    });


function processSdkInitEvents() {
    console.log("Starting listening processing sdk init events");

    Promise
        .map(fixedSdkInitEvents, function (sdkInitEvent, index) {
            if (index % LOG_EVERY_Nth_EVENT === 1) {
                console.log(`Processing sdkInitEvent #${index}`);
            }

            return elasticSearchCommons.processSDKInitEvent(sdkInitEvent);
        }, {concurrency: CONCURRENCY})
        .then(function () {
            console.log("All sdk init events are processed");
        });
}

function processButtonMetrics() {
    console.log("Starting listening processing button metrics");

    Promise
        .map(fixedButtonMetrics, function (buttonMetric, index) {
            if (index % LOG_EVERY_Nth_EVENT === 1) {
                console.log(`Processing buttonMetrics #${index}`);
            }

            return elasticSearchCommons.processButtonMetrics(buttonMetric);
        }, {concurrency: CONCURRENCY})
        .then(function () {
            console.log("All button metrics are processed");
        });
}