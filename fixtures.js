// CANCELLED IDEA
// const seed = require('seed-random');
// const random = seed("hello");       // fixed seed to get the same data every time

const random = Math.random;

const CLIENT_IDS = ["aaaaa", "bbbbb", "ccccc", "ddddd", "eeeee"];
const SDK_VERSIONS = ["0.0.1", "1.0.0", "2.0.0", "3.0.0"];
const BUTTON_COUNT = 3;
const SDK_INIT_EVENT_STREAM_FREQUENCY = 50;   // e.g. every 5 seconds means 60*60*24/5 = 17K app inits per day
const BUTTON_METRICS_STREAM_FREQUENCY = 10;   // e.g. every 2 seconds means 60*60*24/2 = 43K events per day
const DAY = 60 * 60 * 24 * 1000;


module.exports = {
    fixedSdkInitEvents: createFixedSdkInitEvents(),
    fixedButtonMetrics: createFixedButtonMetrics(),
    sdkInitEventStream: sdkInitEventStream,
    buttonMetricsStream: buttonMetricsStream
};

function createFixedSdkInitEvents() {
    const sdkInitEvents = [];

    const now = new Date().getTime();
    const twoMonthsAgo = now - 2 * 30 * DAY;
    const sixMonthsAgo = now - 6 * 30 * DAY;

    // first client was using and old version a long time ago
    for (let i = 0; i < 10; i++) {
        sdkInitEvents.push({
            clientId: CLIENT_IDS[0],
            sdkVersion: SDK_VERSIONS[0],
            // 2 times a day
            timestamp: sixMonthsAgo + i * DAY / 2
        });
    }

    // second client used versions 0 and 1
    for (let i = 0; i < 10; i++) {
        sdkInitEvents.push({
            clientId: CLIENT_IDS[1],
            sdkVersion: SDK_VERSIONS[1],
            // 2 times a day
            timestamp: sixMonthsAgo + i * DAY / 2
        });

        sdkInitEvents.push({
            clientId: CLIENT_IDS[1],
            sdkVersion: SDK_VERSIONS[1],
            // 2 times a day
            timestamp: twoMonthsAgo + i * DAY / 2
        });
    }

    // third client only used version 1
    for (let i = 0; i < 10; i++) {
        sdkInitEvents.push({
            clientId: CLIENT_IDS[2],
            sdkVersion: SDK_VERSIONS[1],
            // 2 times a day
            timestamp: now - i * DAY / 2
        });
    }

    return sdkInitEvents;
}

function createFixedButtonMetrics() {
    const buttonMetrics = [];

    const now = new Date().getTime();

    // totally random button metrics
    for (let i = 0; i < 1000; i++) {
        const clientId = CLIENT_IDS[Math.floor(random() * CLIENT_IDS.length)];
        const button = "button_" + Math.floor(random() * BUTTON_COUNT);
        buttonMetrics.push({
            clientId: clientId,
            button: button,
            timestamp: now - (DAY / 24) * i
        });
    }
    return buttonMetrics;
}

function sdkInitEventStream(listener) {
    setInterval(function () {
        if (listener) {
            listener({
                clientId: CLIENT_IDS[Math.floor(random() * CLIENT_IDS.length)],
                sdkVersion: SDK_VERSIONS[Math.floor(random() * SDK_VERSIONS.length)],
                timestamp: new Date().getTime()
            });
        }
    }, SDK_INIT_EVENT_STREAM_FREQUENCY);
}

function buttonMetricsStream(listener) {
    setInterval(function () {
        if (listener) {
            listener({
                clientId: CLIENT_IDS[Math.floor(random() * CLIENT_IDS.length)],
                button: "button_" + Math.floor(random() * BUTTON_COUNT),
                timestamp: new Date().getTime()
            });
        }
    }, BUTTON_METRICS_STREAM_FREQUENCY);
}