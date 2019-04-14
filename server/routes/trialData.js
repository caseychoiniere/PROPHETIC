const express = require('express');
const mongoose = require('mongoose');
const dbConfig = require('../db');
const error = require('../middleware/formatError');
const jwt = require('../middleware/jwtCheck');
const router = express.Router();

const conn = mongoose.createConnection(dbConfig.DB, { useNewUrlParser: true });

router.get("/", jwt.check(), (req, res, next) => {
    conn.collection("patients").find({}, (err, docs) => {
        if(err) return next(err);
        docs.each((err, doc) => {
            if(err) res.status(500).json(error(500, "The server is unavailable or having trouble completing this request"));
            if(doc) res.send(doc);
        });
    });
});

module.exports = router;