#!/usr/bin/env node
const elasticsearch = require('elasticsearch');
const Promise = require('bluebird');

const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'error',
    defer: function () {
        return Promise.defer();
    }
});

module.exports = {
    connect,
    deleteIndices,
    createIndices,
    processSDKInitEvent,
    processButtonMetrics
};

function connect() {
    return Promise.resolve()
        .then(function () {
            return client.ping({
                requestTimeout: 3000
            });
        })
        .then(function () {
            console.log("All good, ElasticSearch is up!");
            return Promise.resolve();
        });
}

function deleteIndices() {
    console.log("Deleting indices");
    return Promise.resolve()
        .then(function () {
            return deleteIndex("default-metrics")
        })
        .then(function () {
            return deleteIndex("default-event-metrics")
        })
        .then(function () {
            return deleteIndex("custom-button-metrics")
        });
}

function createIndices() {
    console.log("Creating indices");
    return Promise.resolve()
        .then(function () {
            return createIndex("default-metrics", {
                "mappings": {
                    "sdkVersionForClient": {
                        "properties": {
                            "timestamp": {"type": "date"}
                        }
                    }
                }
            })
        })
        .then(function () {
            return createIndex("default-event-metrics", {
                "mappings": {
                    "initSDK": {
                        "properties": {
                            "timestamp": {"type": "date"}
                        }
                    }
                }
            })
        })
        .then(function () {
            return createIndex("custom-button-metrics", {
                "mappings": {
                    "buttonClick": {
                        "properties": {
                            "timestamp": {"type": "date"}
                        }
                    }
                }
            })
        });
}

function processSDKInitEvent(sdkInitEvent) {
    // in every init event, we do 2 things:
    // 1. store the sdkVersion that client uses in a non-time-series index. this is an update operation
    // 2. simply add event to and index

    return Promise.resolve()
        .then(function () {
            // operation 1
            // when we define an id, indexing will either create the document if not exists or completely replace it
            return client.index({
                index: 'default-metrics',
                type: 'sdkVersionForClient',
                id: sdkInitEvent.clientId,
                body: sdkInitEvent
            });
        })
        .then(function () {
            // operation 2
            // when we don't define an id, indexing create a new document with an auto-generated id.
            return client.index({
                index: 'default-event-metrics',
                type: 'initSDK',
                body: sdkInitEvent
            });
        })
        .catch(function (error) {
            console.error("Error while processing SDK init event", JSON.stringify(sdkInitEvent));
            console.trace(error);
            return Promise.reject(error);
        });

}

function processButtonMetrics(buttonMetrics) {
    return Promise.resolve()
        .then(function () {
            return client.index({
                index: 'custom-button-metrics',
                type: 'buttonClick',
                body: buttonMetrics
            });
        })
        .catch(function (error) {
            console.error("Error while processing button metrics", JSON.stringify(buttonMetrics));
            console.trace(error);
            return Promise.reject(error);
        });
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

function deleteIndex(indexName) {
    return client.indices.delete({
        index: indexName,
        ignore: [404]
    }).then(function (body) {
        // since we told the client to ignore 404 errors, the
        // promise is resolved even if the index does not exist
        console.log(`Deleted index '${indexName}' (or never existed)`);
    }, function (error) {
        console.error(`Unable to delete index '${indexName}'`);
        return Promise.reject(`Unable to delete index '${indexName}'`);
    });
}


function createIndex(indexName, body) {
    return client.indices.create({
        index: indexName,
        body: body
    }).then(function (body) {
        // since we told the client to ignore 404 errors, the
        // promise is resolved even if the index does not exist
        console.log(`Created index '${indexName}'`);
    }, function (error) {
        console.error(`Unable to create index '${indexName}'`);
        return Promise.reject(`Unable to create index '${indexName}'`);
    });
}