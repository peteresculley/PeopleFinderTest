// Models
const PeopleFinderResults = require('./../models/peopleFinderResults.js');

const PeopleFinderResult = {
	getResultsForQuery: (queryId, cb) => {
	    PeopleFinderResults.find({'queryId': queryId})
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
	addResults: (queryId, data, success) => {
	    if(success) {
            data.forEach(person => {
                PeopleFinderResults.create({'queryId': queryId,
                                              'photo': person.photo,
                                              'domain': person.domain,
                                              'name': person.name,
                                              'title': person.title,
                                              'linkedIn': person.linkedIn,
                                              'location': person.location}, (error) => {
                                                if(error){
                                                    console.log("Error for queryId: " + queryId +
                                                            " and person: " + JSON.stringify(person))
                                                }
                                              });
            });
	    }
	}
};

module.exports = PeopleFinderResult;
