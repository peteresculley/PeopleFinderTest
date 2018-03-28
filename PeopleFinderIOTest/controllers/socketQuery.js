// Models
const SocketQueries = require('./../models/socketQueries.js');

const SocketQuery = {
	getSocketsForQuery: (queryId, cb) => {
	    SocketQueries.find({'queryId': queryId})
	    .exec((error, query) => {
	        if (error) {
				console.log(error);
				if (typeof cb === 'function') {
					cb(error, null);
				}
			} else {
				if (typeof cb === 'function') {
					if (query) {
						cb(null, query);
					} else {
						cb('No queries', null);
					}
				}
			}
	    })
	},
	addQuery: (socketId, queryId, cb) => {
	    SocketQueries.create({'socketId': socketId,
                              'queryId': queryId},
                              cb);
	}
};

module.exports = SocketQuery;