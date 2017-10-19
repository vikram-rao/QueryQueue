'use strict';

var expect = require('chai').expect;
var QueryQueue = require('../queryqueue');

describe('QueryQueue', function () {
    it('should be able to take mysql database connection info', function () {
        var config = {
            host: "localhost",
            user: "user",
            password: "password",
            database: "database"
        };
        QueryQueue.config(config);
        expect(QueryQueue.data().host).to.equal(config.host);
    });
});