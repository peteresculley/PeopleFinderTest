const PeopleFinderQueries = require('./../models/peopleFinderQueries.js');
const SocketQueries = require('./../models/socketQueries.js');

// Controllers
const Query = require('./../controllers/peopleFinderQuery');
const SocketQuery = require('./../controllers/socketQuery');

const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('input.html', {domain: "", title: "", loading: false});
});

router.post('/', (req, res) => {
    Query.addQuery(req.body.domain, req.body.title, (err, query) => {
        if(err) {
            console.log(err);
        } else {
            SocketQuery.addQuery(req.body.socketId, query._id, (err) => {
                console.log("socketId: " + req.body.socketId);
                if(err) {
                    console.log(err);
                }
            });
        }
    });
    res.render('input.html', {domain: req.body.domain, title: req.body.title});
});

module.exports = router;
