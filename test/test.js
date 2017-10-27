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
    for (var i = 0; i < 10; i++) {
        runner.add("test", "select name from blah");
    }
    runner.start();
}

function setup(conError, sqlError) {
    QueryQueue.config(config);
    mysql.sqlError = sqlError;
    mysql.conError = conError;
    mysql.expects('createPool').returns({
        getConnection: function (callback) {
            callback(mysql.conError, {
                query: function (query, params, callback) {
                    var err = (mysql.sqlError ? {} : false);
                    callback(err, {});
                }
            });
        },
        releaseConnection: function (connection) {
        },
        end: function (callback) {
            callback && callback();
        }
    }).atLeast(1);
}

function tearDown() {
    QueryQueue.reset();
}

describe('QueryQueue', function () {

    this.timeout(3000);

    before(function () {
        setup(false, false);
    });

    after(function () {
        tearDown();
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

    it('with pathed keys', function () {
        var runner = QueryQueue.Runner(function (result, success) {
            expect(success).to.equal(true);
        });
        runner.add("test.hello", "select name from blah");
        runner.start();
    });

    it('with no queries ends gracefully', function () {
        var runner = QueryQueue.Runner(function (result, success) {
            expect(success).to.equal(true);
        });
        runner.start();
    });

    it('works with a large set of queries on a single runner', function () {
        singleRunner(true);
    });

    it('works with a large set of runners with a large number of queries each', function () {
        manyRunners(true);
    });
});
describe('QueryQueue when sql errors out', function () {

    this.timeout(10000);

    before(function () {
        setup(false, true);
    });

    after(function () {
        tearDown();
    });

    it('works with a large set of queries on a single runner', function () {
        singleRunner(false);
    });

    it('works with a large set of runners with a large number of queries each', function () {
        manyRunners(false);
    });

    it('functioning of a simple runner with errors', function () {
        var runner = QueryQueue.Runner(function (result, success) {
            expect(success).to.equal(false);
        });
        runner.add("test", "select name from blah");
        runner.start();
    });
});

describe('QueryQueue when connection fails', function () {

    this.timeout(10000);

    before(function () {
        setup(true);
    });

    after(function () {
        tearDown();
    });

    it('result fails', function () {
        singleRunner(false);
    });
});