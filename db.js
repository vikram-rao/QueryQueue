var mysql = require("mysql");

module.exports = function () {

    var con;

    function connect(config) {
        con = mysql.createConnection(config);
    }

    function executeQuery(query, params, success, failure) {
        params = params || [];
        con.query(query, params, function (err, result) {
            if (err) {
                failure && failure(err);
                return
            }
            success(result)
        })
    }

    return {
        connect: connect,
        executeQuery: executeQuery
    }
};
