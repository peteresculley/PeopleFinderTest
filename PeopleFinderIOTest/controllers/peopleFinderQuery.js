// Models
const PeopleFinderQueries = require('./../models/peopleFinderQueries.js');

const PeopleFinderQuery = {
	/* Get next query to be processed by scrapers */
	getNext: (cb) => {
		PeopleFinderQueries
		.findOneAndUpdate({ status: 0 }, { status: 1 })
		.sort({ createdAt: 1})
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
		}); // end PeopleFinderQueries.findOneAndUpdate
	},
	markAsReady: (_id, success, cb) => {
		let status;
		if (success) {
			status = 2;
		} else {
			status = 3;
		}
		PeopleFinderQueries
		.update({ _id }, { status })
		.exec((error, result) => {
			if (error) {
				console.log(error);
				if (typeof cb === 'function') {
					cb(error, false);
				}
			} else {
				if (typeof cb === 'function') {
					cb(null, true);
				}
			}
		});
	},
	addQuery: (domain, title, cb) => {
        PeopleFinderQueries.create({'domain': domain,
                                    'title': title,
                                    'company' : '',
                                    'status': 0}, cb);
	}
};

module.exports = PeopleFinderQuery;
