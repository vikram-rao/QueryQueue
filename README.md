# QueryQueue
A simple database query queing module

[![Build Status](https://travis-ci.org/vikram-rao/QueryQueue.svg?branch=master)](https://travis-ci.org/vikram-rao/QueryQueue)
[![Coverage Status](https://coveralls.io/repos/github/vikram-rao/QueryQueue/badge.svg?branch=master&v=0.0.4)](https://coveralls.io/github/vikram-rao/QueryQueue?branch=master&v=0.0.4)

## Installation

  `npm install queryqueue`

## Usage

#### Configure

In `app.js` or something once

    var QueryQueue = require('queryqueue');
    QueryQueue.config({
        host: "localhost",
        user: "user",
        password: "password",
        database: "database"
    });

`Config` takes same parameter options as that of [mysql.createPool](https://github.com/mysqljs/mysql#pool-options)

#### Use

    var QueryQueue = require('queryqueue');
    var runner = QueryQueue.Runner(function (result) {
        console.log("countries", result.countries);
        console.log("admins", result.users.admins);
        console.log("managers", result.users.managers);
    });
    runner.add("countries","select name from countries");
    runner.add("users.admins","select name from users where admin = 1");
    runner.add("users.managers","select name from users where manager = 1");
    runner.start();

## Tests

  `npm test`

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed
functionality. Lint and test your code.
