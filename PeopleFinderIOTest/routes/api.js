// Node packages
const express = require('express');
const router = express.Router();

// Controllers
const Query = require('./../controllers/peopleFinderQuery');
const Result = require('./../controllers/peopleFinderResult');
const SocketQuery = require('./../controllers/socketQuery');
let numberOfRequests = 0;

/* Endpoint for person scraper to get the next query to execute */
router.get('/get', (req, res) => {

    console.log(`getting next query to execute`);

    Query.getNext((error, query) => {
        if (error) {
            res.json({ error, success: false, requestNo: numberOfRequests});
        } else {
            res.json({ query, success: true, requestNo: numberOfRequests++});
        }
    }); // end Query.getNext
    if(numberOfRequests >= Number.MAX_SAFE_INTEGER) {
        numberOfRequests = 0;
    }
});

/* Endpoint for scrapers to post confirmation of finishing a query to. */
router.post('/set', (req, res) => {
    let peopleFinderQueryId = req.body._id;
    let data = req.body.data;
    let success = req.body.success;

    Result.addResults(peopleFinderQueryId, data, success);

    console.log('marking query ' + peopleFinderQueryId + ' as ready: success:' + success + ' (success):' + (success));
    Query.markAsReady(peopleFinderQueryId, success, (error, success) => {
        res.json({ error, success});
    });
    SocketQuery.getSocketsForQuery(peopleFinderQueryId, (error, query) => {
        for(let i = 0; i < query.length; i++) {
            console.log("emit to " + query[i].socketId);
            res.io.sockets.connected[query[i].socketId].emit('results ready',data);
        }
    });
});

module.exports = router;
