const seed = require('seed-random');
const random = seed("hello");       // fixed seed to get the same data every time
const fs = require('fs');

// has duplicate values for simulating a bias
const PLATFORMS = ["android", "android", "ios"];
const APP_IDS = ["com.example.someApp", "com.example.someApp", "com.example.someOtherApp", "com.example.anotherApp"];
const SDK_VERSIONS = ["0.0.1", "1.0.0", "1.0.0", "2.0.0", "2.0.0", "2.0.0", "3.0.0", "3.0.0", "3.0.0", "3.0.0"];
const CLIENT_IDS = {android: ["a1", "a1", "a2", "a3", "a3", "a4"], ios: ["i1", "i1", "i2", "i3", "i3", "i4"]};
const APP_VERSIONS = {android: ["256", "256", "257", "290", "290", "290"], ios: ["1.2.3", "4.5.6", "7.8.9"]};
const PLATFORM_VERSIONS = {android: ["23", "27", "27", "28", "28", "28"], ios: ["10.1", "10.2", "11.3"]};
const SECURITY_CHECKS = [
    {name: "DeveloperModeCheck", id: "org.aerogear.mobile.security.checks.DeveloperModeCheck"},
    {name: "EmulatorCheck", id: "org.aerogear.mobile.security.checks.EmulatorCheck"},
    {name: "DebuggerCheck", id: "org.aerogear.mobile.security.checks.DebuggerCheck"},
    {name: "RootedCheck", id: "org.aerogear.mobile.security.checks.RootedCheck"},
    {name: "ScreenLockCheck", id: "org.aerogear.mobile.security.checks.ScreenLockCheck"},

];
const FRAMEWORKS = ["native", "native", "cordova"];

const INIT_EVENT_STREAM_FREQUENCY = 50;   // e.g. every 5 seconds means 60*60*24/5 = 17K app inits per day
const SECURITY_EVENT_STREAM_FREQUENCY = 500;   // e.g. every 5 seconds means 60*60*24/5 = 17K app inits per day


module.exports = {
    initEventFixedStream: initEventFixedStream,
    initEventStream: initEventStream,
    securityEventStream: securityEventStream,
};

function initEventFixedStream(listener) {
    const eventsSent = [];

    const EVENT_COUNT = 5;
    const MAX_CLIENT_COUNT = 3;

    for (let i = 0; i < EVENT_COUNT; i++) {
        const platform = PLATFORMS[Math.floor(random() * PLATFORMS.length)];
        const event = {
            clientId: CLIENT_IDS[platform][Math.floor(random() * Math.min(CLIENT_IDS[platform].length, MAX_CLIENT_COUNT))],
            type: "init",
            data: {
                app: {
                    appId: APP_IDS[Math.floor(random() * APP_IDS.length)],
                    sdkVersion: SDK_VERSIONS[Math.floor(random() * SDK_VERSIONS.length)],
                    appVersion: APP_VERSIONS[platform][Math.floor(random() * APP_VERSIONS[platform].length)],
                    framework: FRAMEWORKS[Math.floor(random() * FRAMEWORKS.length)],
                },
                device: {
                    platform: platform,
                    platformVersion: PLATFORM_VERSIONS[platform][Math.floor(random() * PLATFORM_VERSIONS[platform].length)]
                }
            }
        };
        eventsSent.push(event);
        listener(event);
    }

    console.log("Events pushed are written to .events.json");
    fs.writeFileSync('./.events.json', JSON.stringify(eventsSent));

    return Promise.resolve();
}

function initEventStream(listener) {
    setInterval(function () {
        if (listener) {
            const platform = PLATFORMS[Math.floor(random() * PLATFORMS.length)];
            listener({
                    clientId: CLIENT_IDS[platform][Math.floor(random() * CLIENT_IDS[platform].length)],
                    type: "init",
                    data: {
                        app: {
                            appId: APP_IDS[Math.floor(random() * APP_IDS.length)],
                            sdkVersion: SDK_VERSIONS[Math.floor(random() * SDK_VERSIONS.length)],
                            appVersion: APP_VERSIONS[platform][Math.floor(random() * APP_VERSIONS[platform].length)],
                            framework: FRAMEWORKS[Math.floor(random() * FRAMEWORKS.length)],
                        },
                        device: {
                            platform: platform,
                            platformVersion: PLATFORM_VERSIONS[platform][Math.floor(random() * PLATFORM_VERSIONS[platform].length)]
                        }
                    }
                }
            );
        }
    }, INIT_EVENT_STREAM_FREQUENCY * (Math.random() * 0.5 + 1));

    return Promise.resolve();
}

function securityEventStream(listener) {
    setInterval(function () {
        if (listener) {
            const platform = PLATFORMS[Math.floor(random() * PLATFORMS.length)];
            const security = [];
            for (let check of SECURITY_CHECKS) {
                security.push(
                    {
                        id: check.id,
                        name: check.name,
                        passed: random() < 0.8
                    }
                );
            }
            listener({
                    clientId: CLIENT_IDS[platform][Math.floor(random() * CLIENT_IDS[platform].length)],
                    type: "security",
                    data: {
                        app: {
                            appId: APP_IDS[Math.floor(random() * APP_IDS.length)],
                            sdkVersion: SDK_VERSIONS[Math.floor(random() * SDK_VERSIONS.length)],
                            appVersion: APP_VERSIONS[platform][Math.floor(random() * APP_VERSIONS[platform].length)],
                            framework: FRAMEWORKS[Math.floor(random() * FRAMEWORKS.length)],
                        },
                        device: {
                            platform: platform,
                            platformVersion: PLATFORM_VERSIONS[platform][Math.floor(random() * PLATFORM_VERSIONS[platform].length)]
                        },
                        security: security
                    }
                }
            );
        }
    }, SECURITY_EVENT_STREAM_FREQUENCY * (Math.random() * 0.5 + 1));
    return Promise.resolve();
}