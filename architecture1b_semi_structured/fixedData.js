#!/usr/bin/env node
const Promise = require('bluebird');

const fixtures = require('../fixtures');
const dbCommons = require('./dbCommons');
const {fixedButtonMetrics, fixedSdkInitEvents} = fixtures;

const LOG_EVERY_Nth_EVENT = 10;

const CONCURRENCY = 20;

Promise.resolve()
    .then(dbCommons.ping)
    .then(dbCommons.createSdkVersionForClientTable)
    .then(dbCommons.createMobileAppMetricsTable)
    .then(processSdkInitEvents)
    .then(processButtonMetrics);

function processSdkInitEvents() {
    console.log("Starting listening processing sdk init events");

    return Promise
        .map(fixedSdkInitEvents, function (sdkInitEvent, index) {
            if (index % LOG_EVERY_Nth_EVENT === 1) {
                console.log(`Processing sdkInitEvent #${index}`);
            }

            return dbCommons.processSDKInitEvent(sdkInitEvent);

        }, {concurrency: CONCURRENCY})
        .then(function () {
            console.log("All sdk init events are processed");
        });
}

function processButtonMetrics() {
    console.log("Starting listening processing button metrics");

    return Promise
        .map(fixedButtonMetrics, function (buttonMetric, index) {
            if (index % LOG_EVERY_Nth_EVENT === 1) {
                console.log(`Processing buttonMetrics #${index}`);
            }

            return dbCommons.processButtonMetrics(buttonMetric);
        }, {concurrency: CONCURRENCY})
        .then(function () {
            console.log("All button metrics are processed");
        });
}