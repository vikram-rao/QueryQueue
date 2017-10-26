'use strict';

var DB = require("./db");
var db = DB();

function Runner(config, done) {
    var count = 0;

    db.connect(config);

    var results = {};

    var queries = [];

    var success = true;

    function onComplete() {
        db.disconnect(function () {
            done(results, success);
        });
    }

    function onQueryComplete(pSuccess) {
        success = success && pSuccess;
        count--;
        // console.log("Pending - " + count);
        if (count == 0) {
            // console.log("DONE");
            queries = [];
            onComplete();
        }
    }

    function add(key, query, params) {
        params = params || {};
        queries.push({
            key: key,
            query: query,
            params: params
        })
    }

    function runQuery(queryInfo) {
        // console.log("Running query for " + queryInfo.key);
        db.executeQuery(queryInfo.query, queryInfo.params, function (result) {
            var keyPath = queryInfo.key.split(".");
            var queryResult = results;
            var lastKey = keyPath.pop();
            keyPath.forEach(function (key) {
                queryResult[key] = queryResult[key] || {};
                queryResult = queryResult[key];
            });
            queryResult[lastKey] = result;
            // console.log("Got results for " + queryInfo.key);
            onQueryComplete(true)
        }, function (error) {
            // console.log(queryInfo.query);
            // console.log(queryInfo.params);
            // console.log(error);
            onQueryComplete(false)
        })
    }

    function start() {
        count = queries.length;
        // console.log("Query Count - " + count);
        if (count == 0) {
            onComplete();
            return;
        }
        queries.forEach(function (query) {
            runQuery(query);
        });
    }

    return {
        add: add,
        start: start
    }
}

module.exports = (function QueryQueue() {

    var dbConfig = {};
    var runnerCount = 0;

    return {
        config: function (config) {
            dbConfig = config;
        },
        Runner: function (callback) {
            runnerCount++;
            // console.log("Runner - " + runnerCount);
            return Runner(dbConfig, function (results, success) {
                runnerCount--;
                callback(results, success);
            });
        },
        data: function () {
            return dbConfig;
        }
    };
})();
