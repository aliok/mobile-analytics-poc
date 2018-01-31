#!/usr/bin/env node
const Promise = require('bluebird');

const pgp = require('pg-promise')({
    promiseLib: Promise
});

const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: ''
});

module.exports = db;