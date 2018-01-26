#!/usr/bin/env node
const Promise = require('bluebird');

const fixtures = require('./fixtures');
const promClient = require('prom-client');
const {fixedButtonMetrics, fixedSdkInitEvents} = fixtures;

const LOG_EVERY_Nth_EVENT = 10;

const CONCURRENCY = 20;

let gateway = new promClient.Pushgateway('http://127.0.0.1:9091');

const sdkInitCounter = new promClient.Counter({ name: 'sdkInit01', help: 'help', labelNames: ['version'] });
const buttonMetricsCounter = new promClient.Counter({ name: 'buttonMetrics01', help: 'help', labelNames: ['button'] });

Promise.resolve()
    .then(processSdkInitEvents)
    .then(processButtonMetrics)
    .then(function(){
        gateway.pushAdd({ jobName: 'gateway' }, function(err, resp, body) {});
    });

function processSdkInitEvents() {
    console.log("Starting listening processing sdk init events");

    return Promise
        .map(fixedSdkInitEvents, function (sdkInitEvent, index) {
            if (index % LOG_EVERY_Nth_EVENT === 1) {
                console.log(`Processing sdkInitEvent #${index}`);
            }

            return sdkInitCounter.inc({"version": sdkInitEvent.sdkVersion});
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

            return buttonMetricsCounter.inc({"version": buttonMetric.button});
        }, {concurrency: CONCURRENCY})
        .then(function () {
            console.log("All button metrics are processed");
        });
}