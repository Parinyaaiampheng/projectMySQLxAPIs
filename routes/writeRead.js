'use strict';

const express = require('express');
const crypto = require('crypto');
const wrRoute = express.Router();
const connection = require('../db');

// POST request to insert new user into users_tbl
wrRoute.post('/users', function (req, res, next) {
    let mypass = crypto.createHash('md5').update(req.body.password).digest("hex");
    connection.execute(`
        INSERT INTO users_tbl (FirstName, LastName, school_name, province, class, Email, password, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [req.body.FirstName, req.body.LastName, req.body.school_name, req.body.province, req.body.class, req.body.Email, mypass, Date.now(), Date.now()])
        .then(() => {
            console.log('Insert Successfully');
            res.status(201).send("Insert Successfully");
        }).catch((err) => {
            console.error('Error inserting into database:', err);
            res.sendStatus(500); // Internal Server Error
        });
});

// GET request to fetch all users from users_tbl
wrRoute.get('/users', function (req, res, next) {
    connection.execute('SELECT * FROM users_tbl;')
        .then((result) => {
            var rawData = result[0];
            res.send(JSON.stringify(rawData));
        }).catch((err) => {
            console.error('Error fetching users:', err);
            res.sendStatus(500); // Internal Server Error
        });
});

// POST request to check login credentials
wrRoute.post('/check', function (req, res, next) {
    let mypass = crypto.createHash('md5').update(req.body.password).digest("hex");
    connection.execute('SELECT * FROM users_tbl WHERE Email=? AND password=?;',
        [req.body.Email, mypass]).then((result) => {
            var data = result[0];
            if (data.length === 0) {
                res.sendStatus(400); // Bad Request
            }
            else {
                res.sendStatus(200); // OK
            }
        }).catch((err) => {
            console.error('Error checking login:', err);
            res.sendStatus(500); // Internal Server Error
        });
});

// Handle all other routes with a 404 response
wrRoute.use('/', function (req, res, next) {
    res.sendStatus(404); // Not Found
});

module.exports = wrRoute;
