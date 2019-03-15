#!/usr/bin/env node

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const Promise = require('bluebird');

const fixtures = require('./fixtures');
const promClient = require('prom-client');

const {initEventFixedStream, initEventStream, securityEventStream} = fixtures;

let gateway = new promClient.Pushgateway('http://127.0.0.1:9091');

const sdkInitCounter = new promClient.Counter({
    name: 'sdkInitEvent', help: 'sdkInitEvent help', labelNames: [
        'clientId', 'appId', 'sdkVersion', 'appVersion', 'framework', 'platform', 'platformVersion'
    ]
});

const securityEventCounter = new promClient.Counter({
    name: 'securityEvent', help: 'securityEvent help', labelNames: [
        'clientId', 'appId', 'sdkVersion', 'appVersion', 'framework', 'platform', 'platformVersion', 'checkId', 'checkName', 'checkResult'
    ]
});

const LOG_EVERY_Nth_EVENT = 10;

let sdkInitEventCount = 0;      // for logging purposes only
let securityEventCount = 0;      // for logging purposes only

Promise.resolve()
    .then(startListeningInitEventStream)
    // .then(startListeningSecurityEventStream)
    .then(startPushingToGateway)
    .catch(function (err) {
        console.trace("WTF?");
        console.trace(err);
    });


function startListeningInitEventStream() {
    console.log("Starting listening init event stream");
    initEventFixedStream(function (metrics) {
    // initEventStream(function (metrics) {
        sdkInitEventCount++;
        if (sdkInitEventCount % LOG_EVERY_Nth_EVENT === 1) {
            console.log(`Processing sdkInit metrics #${sdkInitEventCount}`);
        }

        // sample event:
        /*
          {
            "clientId": "a2",
            "type": "init",
            "data": {
              "app": {
                "appId": "com.example.someOtherApp",
                "sdkVersion": "3.0.0",
                "appVersion": "290",
                "framework": "cordova"
              },
              "device": {
                "platform": "android",
                "platformVersion": "27"
              }
            }
          }
        */

        return Promise.resolve()
            .then(function () {
                return sdkInitCounter.inc({
                    clientId: metrics.clientId,
                    appId: metrics.data.app.appId,
                    sdkVersion: metrics.data.app.sdkVersion,
                    appVersion: metrics.data.app.appVersion,
                    framework: metrics.data.app.framework,
                    platform: metrics.data.device.platform,
                    platformVersion: metrics.data.device.platformVersion
                });
            });
    });
    return Promise.resolve();
}

function startListeningSecurityEventStream() {
    console.log("Starting listening security event stream");
    securityEventStream(function (metrics) {
        securityEventCount++;
        if (securityEventCount % LOG_EVERY_Nth_EVENT === 1) {
            console.log(`Processing security metrics #${securityEventCount}`);
        }

        /*
         * Sample event
           {
            "clientId": "a2",
            "type": "security",
            "data": {
              "app": {
                "appId": "com.example.someApp",
                "sdkVersion": "3.0.0",
                "appVersion": "290",
                "framework": "native"
              },
              "device": {
                "platform": "android",
                "platformVersion": "28"
              },
              "security": [
                {
                  "id": "org.aerogear.mobile.security.checks.DeveloperModeCheck",
                  "name": "DeveloperModeCheck",
                  "passed": false
                },
                {
                  "id": "org.aerogear.mobile.security.checks.EmulatorCheck",
                  "name": "EmulatorCheck",
                  "passed": true
                },
                {
                  "id": "org.aerogear.mobile.security.checks.DebuggerCheck",
                  "name": "DebuggerCheck",
                  "passed": false
                },
                {
                  "id": "org.aerogear.mobile.security.checks.RootedCheck",
                  "name": "RootedCheck",
                  "passed": false
                },
                {
                  "id": "org.aerogear.mobile.security.checks.ScreenLockCheck",
                  "name": "ScreenLockCheck",
                  "passed": false
                }
              ]
            }
          }
         *
         */

        return Promise.each(metrics.data.security, function(securityData){
            return Promise.resolve()
                .then(function () {
                    return securityEventCounter.inc({
                        clientId: metrics.clientId,
                        appId: metrics.data.app.appId,
                        sdkVersion: metrics.data.app.sdkVersion,
                        appVersion: metrics.data.app.appVersion,
                        framework: metrics.data.app.framework,
                        platform: metrics.data.device.platform,
                        platformVersion: metrics.data.device.platformVersion,
                        checkId: securityData.id,
                        checkName: securityData.name,
                        checkResult: securityData.passed
                    });
                });
        });
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