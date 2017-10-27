'use strict';

var mysql = require("mysql");

module.exports = function () {

    var pool;

    function connect(config) {
        pool = mysql.createPool(config);
    }

    function executeQuery(query, params, success, failure) {
        params = params || [];
        pool.getConnection(function (err, connection) {
            if (err) {
                failure && failure(err);
                return;
            }
            connection.query(query, params, function (err, result) {
                pool.releaseConnection(connection);
                if (err) {
                    failure && failure(err);
                    return;
                }
                success(result);
            })
        });
    }

    function disconnect(callback) {
        pool.end(callback);
        pool = 0;
    }

    return {
        connect: connect,
        executeQuery: executeQuery,
        disconnect: disconnect
    }
};
