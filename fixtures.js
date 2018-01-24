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

module.exports = {
	buttonMetrics,
	sdkInitEvents
};
