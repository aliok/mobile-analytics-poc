"use strict";

const seed = require('seed-random');

const random = seed("hello");       // fixed seed to get the same data every time

const clientIds = ["aaaaa", "bbbbb", "ccccc"];
const sdkVersions = ["0.0.1", "1.0.0"];

const sdkInitEvents = [];
const buttonMetrics = [];


const DAY = 60 * 60 * 24 * 1000;

const now = new Date().getTime();
const twoMonthsAgo = now - 2 * 30 * DAY;
const sixMonthsAgo = now - 6 * 30 * DAY;

// first client was using and old version a long time ago
for (let i = 0; i < 10; i++) {
    sdkInitEvents.push({
        clientId: clientIds[0],
        sdkVersion: sdkVersions[0],
        // 2 times a day
        timestamp: sixMonthsAgo + i * DAY / 2
    });
}

// second client used versions 0 and 1
for (let i = 0; i < 10; i++) {
    sdkInitEvents.push({
        clientId: clientIds[1],
        sdkVersion: sdkVersions[1],
        // 2 times a day
        timestamp: sixMonthsAgo + i * DAY / 2
    });

    sdkInitEvents.push({
        clientId: clientIds[1],
        sdkVersion: sdkVersions[1],
        // 2 times a day
        timestamp: twoMonthsAgo + i * DAY / 2
    });
}

// third client only used version 1
for (let i = 0; i < 10; i++) {
    sdkInitEvents.push({
        clientId: clientIds[2],
        sdkVersion: sdkVersions[1],
        // 2 times a day
        timestamp: now - i * DAY / 2
    });
}


// totally random button metrics
for (let i = 0; i < 1000; i++) {
    const clientId = clientIds[Math.floor(random() * clientIds.length)];
    const button = "button_" + Math.floor(random() * 3);
    buttonMetrics.push({
        clientId: clientId,
        button: button,
        timestamp: now - (DAY / 24) * i
    });
}

// clear all indices, delete all documents
console.log(`curl -XDELETE 'http://localhost:9200/default-metrics'`);
console.log(`curl -XDELETE 'http://localhost:9200/default-event-metrics'`);
console.log(`curl -XDELETE 'http://localhost:9200/custom-button-metrics'`);

// create indices
console.log(`
curl -XPUT 'localhost:9200/default-metrics?pretty' -H 'Content-Type: application/json' -d'
{
        "mappings" : {
            "sdkVersionForClient" : {
                "properties" : {
                    "timestamp" : { "type" : "date" }
                }
        }
    }
}
'
`);
console.log(`
curl -XPUT 'localhost:9200/default-event-metrics?pretty' -H 'Content-Type: application/json' -d'
{
        "mappings" : {
            "initSDK" : {
                "properties" : {
                    "timestamp" : { "type" : "date" }
                }
        }
    }
}
'
`);
console.log(`
curl -XPUT 'localhost:9200/custom-button-metrics?pretty' -H 'Content-Type: application/json' -d'
{
        "mappings" : {
            "buttonClick" : {
                "properties" : {
                    "timestamp" : { "type" : "date" }
                }
        }
    }
}
'
`);


// process sdkInitEvents
for (let sdkInitEvent of sdkInitEvents) {
    // in every init event, we do 2 things:
    // 1. store the sdkVersion that client uses in a non-time-series index. this is an update operation
    // 2. simply add event to and index

    // operation 1
    const usageClone = JSON.parse(JSON.stringify(sdkInitEvent));
    const upsert = {
        doc: usageClone,
        "doc_as_upsert": true
    };
    console.log(`curl -XPOST 'http://localhost:9200/default-metrics/sdkVersionForClient/${sdkInitEvent.clientId}/_update' -d '${JSON.stringify(upsert)}' -H 'Content-Type: application/json'`);

    // operation 2
    console.log(`curl -XPOST 'http://localhost:9200/default-event-metrics/initSDK/' -d '${JSON.stringify(sdkInitEvent)}' -H 'Content-Type: application/json'`);
}

// process custom metrics. simply add them to an index
for (let buttonMetric of buttonMetrics) {
    console.log(`curl -XPOST 'http://localhost:9200/custom-button-metrics/buttonClick/' -d '${JSON.stringify(buttonMetric)}' -H 'Content-Type: application/json'`);
}