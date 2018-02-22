#!/usr/bin/env node
const Promise = require('bluebird');
const db = require("./db");

module.exports = {
    ping: function () {
        return db.any('SELECT 1;')
            .then(function () {
                console.log("Success pinging database");
                return Promise.resolve();
            })
            .catch(function (error) {
                console.error("Error pinging database", error);
                return Promise.reject(new Error("Unable to ping database"));
            });
    },

    createMobileAppMetricsTable: function () {
        return db.none("CREATE TABLE IF NOT EXISTS mobileAppMetrics(clientId varchar(10) not null, event_time timestamp with time zone not null, data jsonb)")
            .then(function () {
                console.log("Created mobileAppMetrics table or it already exists.")
            })
            .catch(function (err) {
                console.error("Error creating mobileAppMetrics table.", err);
            })
    },

    createClientKnowledgeBaseView: function () {
        return db.none("CREATE OR REPLACE VIEW clientKnowledgeBase as select entry.clientId, entry.event_time, entry.data from mobileAppMetrics entry inner join (select clientId, max(event_time) as latestEntryTime from mobileAppMetrics group by clientId) latestEntry on entry.clientId = latestEntry.clientId and entry.event_time = latestEntryTime;")
            .then(function () {
                console.log("Created clientKnowledgeBase view or it already exists.")
            })
            .catch(function (err) {
                console.error("Error creating clientKnowledgeBase view.", err);
            })
    },

    createCustomMetricsTable: function () {
        return db.none("CREATE TABLE IF NOT EXISTS customMetrics(clientId varchar(10) not null, event_time timestamp with time zone not null, data jsonb)")
            .then(function () {
                console.log("Created customMetrics table or it already exists.")
            })
            .catch(function (err) {
                console.error("Error creating customMetrics table.", err);
            })
    },

    processSDKInitEvent: function (sdkInitEvent) {
        const statement = `insert into mobileAppMetrics(clientId, event_time, data) values($1, $2, $3)`;

        return db.none(statement, [sdkInitEvent.clientId, new Date(sdkInitEvent.timestamp), {sdkVersion: sdkInitEvent.sdkVersion}])
            .catch(function (err) {
                console.error("Error inserting data to defaultMetrics table.", sdkInitEvent, err);
            });
    },

    processButtonMetrics: function (buttonMetrics) {
        const statement = `insert into customMetrics(clientId, event_time, data) values($1, $2, $3)`;

        return db.none(statement, [buttonMetrics.clientId, new Date(buttonMetrics.timestamp), {button: buttonMetrics.button}])
            .catch(function (err) {
                console.error("Error inserting data to customMetrics table.", buttonMetrics, err);
            });
    }
};


// // some debugging code
// Promise.resolve()
//     .then(module.exports.ping)
//     .then(module.exports.createSdkVersionForClientTable)
//     .then(module.exports.createDefaultMetricsTable)
//     .then(function () {
//         return module.exports.processSDKInitEvent({
//             clientId: "aaa",
//             sdkVersion: "1.2.3",
//             timestamp: new Date().getTime(),
//         });
//     })
//     .then(function () {
//         return module.exports.processSDKInitEvent({
//             clientId: "bbb",
//             sdkVersion: "1.2.3",
//             timestamp: new Date().getTime(),
//         });
//     })
//     .then(function () {
//         return module.exports.processSDKInitEvent({
//             clientId: "aaa",
//             sdkVersion: "1.2.4",
//             timestamp: new Date().getTime(),
//         });
//     })
//     .catch(function (err) {
//         console.error("Error!", err)
//     });