#!/usr/bin/env node
const Promise = require('bluebird');
const promClient = require('prom-client');

let gateway = new promClient.Pushgateway('http://127.0.0.1:9091');

const gauge = new promClient.Gauge({ name: 'foo_gauge', help: 'foo_gauge_help', labelNames: ['clientId', 'version'] });
gauge.set({ clientId: 'bbbb', version: '1.2.3' }, Math.random()*1000);

// const counter = new promClient.Counter({ name: 'foo_counter', help: 'foo_gauge_help', labelNames: ['clientId', 'version'] });
// gauge.set({ clientId: 'bbbb', version: '1.2.3' }, Math.random()*1000);


// gauge.set({ clientId: 'aaaa', version: '1.2.3' }, Math.random()*1000);
//gauge.set(Math.random()*1000);


gateway.pushAdd({ jobName: 'gateway' }, function(err, resp, body) {}); //Add metric and overwrite old ones
// gateway.push({ jobName: 'gateway' }, function(err, resp, body) {}); //Overwrite all metrics (use PUT)
// gateway.delete({ jobName: 'gateway' }, function(err, resp, body) {}); //Delete all metrics for jobName

//All gateway requests can have groupings on it
// gateway.pushAdd({ jobName: 'test', groupings: { key: 'value' } }, function(
//     err,
//     resp,
//     body
// ) {});

// It's possible to extend the Pushgateway with request options from nodes core http/https library
// gateway = new client.Pushgateway('http://127.0.0.1:9091', { timeout: 5000 }); //Set the request timeout to 5000ms