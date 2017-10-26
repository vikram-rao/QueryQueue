'use strict';

const sinon = require('sinon');
var expect = require('chai').expect;
var QueryQueue = require('../queryqueue');
var before = require("mocha").before;
var after = require("mocha").after;
var mysql = sinon.mock(require('mysql'));

var config = {
    host: "localhost",
    user: "user",
    password: "password",
    database: "database"
};

function manyRunners(expected) {
    for (var i = 0; i < 10; i++) {
        singleRunner(expected);
    }
}

function singleRunner(expected) {
    var runner = QueryQueue.Runner(function (result, success) {
        expect(success).to.equal(expected);
    });
    for (var i = 0; i < 50; i++) {
        runner.add("test", "select name from blah");
    }
    runner.start();
}

function setup(error) {
    QueryQueue.config(config);
    mysql.expects('createPool').returns({
        getConnection: function (callback) {

        },
        query: function (query, params, callback) {
            callback(error ? {} : false, {});
        },
        end: function (callback) {
            callback();
        }
    }).atLeast(1);
}

describe('QueryQueue', function () {

    this.timeout(3000);

    before(function () {
        setup(false);
    });

    after(function () {
        mysql.restore();
    });

    it('should be able to take mysql database connection info', function () {
        expect(QueryQueue.data().host).to.equal(config.host);
    });

    it('functioning of a simple runner', function () {
        var runner = QueryQueue.Runner(function (result, success) {
            expect(success).to.equal(true);
        });
        runner.add("test", "select name from blah");
        runner.start();
    });

    it('works with a large set of queries on a single runner', function () {
        singleRunner(true);
    });

    it('works with a large set of runners with a large number of queries each', function () {
        manyRunners(true);
    });
});
describe('QueryQueue when errors out, ', function () {

    this.timeout(10000);

    before(function () {
        setup(true);
    });

    after(function () {
        mysql.restore();
    });

    it('works with a large set of queries on a single runner', function () {
        singleRunner(false);
    });

    it('works with a large set of runners with a large number of queries each', function () {
        manyRunners(false);
    });
});