#!/usr/bin/env node
const fixtures = require('./fixtures');
const {fixedButtonMetrics, fixedSdkInitEvents} = fixtures;

// clear all indices, delete all documents
console.log(`curl -s -XDELETE 'http://localhost:9200/default-metrics'`);
console.log(`curl -s -XDELETE 'http://localhost:9200/default-event-metrics'`);
console.log(`curl -s -XDELETE 'http://localhost:9200/custom-button-metrics'`);

// create indices
console.log(`
curl -s -XPUT 'localhost:9200/default-metrics?pretty' -H 'Content-Type: application/json' -d'
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
curl -s -XPUT 'localhost:9200/default-event-metrics?pretty' -H 'Content-Type: application/json' -d'
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
curl -s -XPUT 'localhost:9200/custom-button-metrics?pretty' -H 'Content-Type: application/json' -d'
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
for (let sdkInitEvent of fixedSdkInitEvents) {
    // in every init event, we do 2 things:
    // 1. store the sdkVersion that client uses in a non-time-series index. this is an update operation
    // 2. simply add event to and index

    // operation 1
    const usageClone = JSON.parse(JSON.stringify(sdkInitEvent));
    const upsert = {
        doc: usageClone,
        "doc_as_upsert": true
    };
    console.log(`curl -s -XPOST 'http://localhost:9200/default-metrics/sdkVersionForClient/${sdkInitEvent.clientId}/_update' -d '${JSON.stringify(upsert)}' -H 'Content-Type: application/json'`);

    // operation 2
    console.log(`curl -s -XPOST 'http://localhost:9200/default-event-metrics/initSDK/' -d '${JSON.stringify(sdkInitEvent)}' -H 'Content-Type: application/json'`);
}

// process custom metrics. simply add them to an index
for (let buttonMetric of fixedButtonMetrics) {
    console.log(`curl -s -XPOST 'http://localhost:9200/custom-button-metrics/buttonClick/' -d '${JSON.stringify(buttonMetric)}' -H 'Content-Type: application/json'`);
}
