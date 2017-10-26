'use strict';

var mysql = require("mysql");

module.exports = function () {

    var pool;

    function connect(config) {
        config['connectionLimit'] = config['connectionLimit'] || 100;
        pool = mysql.createPool(config);
    }

    function executeQuery(query, params, success, failure) {
        params = params || [];
        pool.query(query, params, function (err, result) {
            if (err) {
                failure && failure(err);
                return
            }
            success(result)
        })
    }

    function disconnect(callback) {
        pool.end(callback);
    }

    return {
        connect: connect,
        executeQuery: executeQuery,
        disconnect: disconnect
    }
};
