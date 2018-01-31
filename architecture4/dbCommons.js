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

    createSdkVersionForClientTable: function () {
        return db.none("CREATE TABLE IF NOT EXISTS sdkVersionForClient(clientId varchar(10) not null primary key, version varchar(40) not null, event_time timestamp with time zone)")
            .then(function () {
                console.log("Created sdkVersionForClient table or it already exists.")
            })
            .catch(function (err) {
                console.error("Error created sdkVersionForClient table.", err);
            })
    },

    processSDKInitEvent: function (sdkInitEvent) {
        const statement = `insert into sdkVersionForClient(clientId, version, event_time) values($1, $2, $3)
        on conflict(clientId)
        do update set version = $2, event_time = $3;`;

        return db.none(statement, [sdkInitEvent.clientId, sdkInitEvent.sdkVersion, new Date(sdkInitEvent.timestamp)])
            .catch(function (err) {
                console.error("Error inserting data to sdkVersionForClient table.", sdkInitEvent, err);
            });
    }
};


// // some debugging code
// Promise.resolve()
//     .then(module.exports.ping)
//     .then(module.exports.createSdkVersionForClientTable)
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