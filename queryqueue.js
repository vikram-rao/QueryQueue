'use strict';

var DB = require("./db");
var db = DB();

function Runner(config, done) {
    var count = 0;

    db.connect(config);

    var results = {};

    var queries = [];

    function reset() {
        results = {}
    }

    function onQueryComplete() {
        count--;
        console.log("Pending - " + count);
        if (count == 0) {
            console.log("DONE");
            queries = [];
            done(results)
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

    function runQuery(i) {
        var queryInfo = queries[i];
        console.log("Running query for " + queryInfo.key);
        db.executeQuery(queryInfo.query, queryInfo.params, function (result) {
            var keyPath = queryInfo.key.split(".");
            var queryResult = results;
            var lastKey = keyPath.pop();
            keyPath.forEach(function (key) {
                queryResult[key] = queryResult[key] || {};
                queryResult = queryResult[key];
            });
            queryResult[lastKey] = result;
            console.log("Got results for " + queryInfo.key);
            onQueryComplete()
        }, function (error) {
            console.log(error);
            onQueryComplete()
        })
    }

    function start() {
        count = queries.length;
        if (count == 0) {
            done(results);
            return
        }
        for (var i in queries) runQuery(i);
    }

    return {
        add: add,
        start: start,
        reset: reset
    }
}

module.exports = (function QueryQueue() {

    var dbConfig = {};

    return {
        config: function (config) {
            dbConfig = config;
        },
        Runner: function (callback) {
            return Runner(dbConfig, callback);
        },
        data: function () {
            return dbConfig;
        }
    };
})();
