#!/usr/bin/env node
const Promise = require('bluebird');

const fixtures = require('../fixtures');
const promClient = require('prom-client');
const dbCommons = require('./dbCommons');
const {sdkInitEventStream, buttonMetricsStream} = fixtures;

const LOG_EVERY_Nth_EVENT = 1000;

let sdkInitEventCount = 0;      // for logging purposes only
let buttonMetricsCount = 0;     // for logging purposes only

let gateway = new promClient.Pushgateway('http://127.0.0.1:9091');

const sdkInitCounter = new promClient.Counter({name: 'sdkInitStream01', help: 'help', labelNames: ['clientId', 'version']});
const buttonMetricsCounter = new promClient.Counter({name: 'buttonMetricsStream01', help: 'help', labelNames: ['clientId', 'button']});

Promise.resolve()
    .then(dbCommons.ping)
    .then(dbCommons.createSdkVersionForClientTable)
    .then(startListeningSDKInitEventStream)
    .then(startListeningButtonMetricsStream)
    .then(startPushingToGateway)
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

        return Promise.resolve()
            .then(function () {
                return dbCommons.processSDKInitEvent(sdkInitEvent);
            })
            .then(function () {
                return sdkInitCounter.inc({clientId: sdkInitEvent.clientId, version: sdkInitEvent.sdkVersion});
            });
    });
    return Promise.resolve();
}

function startListeningButtonMetricsStream() {
    console.log("Starting listening button metrics stream");
    buttonMetricsStream(function (buttonMetric) {
        buttonMetricsCount++;
        if (buttonMetricsCount % LOG_EVERY_Nth_EVENT === 1) {
            console.log(`Processing buttonMetrics #${buttonMetricsCount}`);
        }
        return buttonMetricsCounter.inc({clientId: buttonMetric.clientId, version: buttonMetric.button});
    });
    return Promise.resolve();
}

function startPushingToGateway() {
    console.log("Starting pushing to gateway");
    setInterval(function () {
        console.log("Pushing to gateway");
        gateway.pushAdd({jobName: 'gateway'}, function (err, resp, body) {
            if (err) {
                console.error("Unable to push data to gateway!");
                console.error(err, resp, body);
            }
        });
    }, 3000);
}