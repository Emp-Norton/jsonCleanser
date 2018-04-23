'use strict';

let fs = require('fs');

fs.readFile('./leads.json', 'utf8', function(err, data) {
	if (err) {
		console.log(`Error occured reading from filter: ${err}`);
	}

	data = JSON.parse(data);
	processData(data.leads);
})

const writeChangelog = (changes) => {
	changes.forEach(change => {
		fs.appendFile('./changelog.txt', `${change}\r\n`, (err) => {
			if (err) {
				console.log(`Error appending to file: ${err}`);
			}

			console.log(`Wrote ${change} to changelog.`);
		})	
	})
}

const findDuplicatesByEmail = (records) => {
	let duplicates = {};
	records.forEach((record, recordIndex) => {
		let currentDupes = records.filter((recordToCheck, filterIndex) => {
			return recordToCheck['email'] === record['email']
		})

		duplicates[record['email']] = sortByTimestamp(currentDupes);
	})

	return duplicates
}

const sortByTimestamp = (records) => {
	
	return records.sort((first, second) => {
		let firstDate = new Date(first.entryDate).getTime();
		let secondDate = new Date(second.entryDate).getTime();
		
		return firstDate > secondDate ? -1 : 1
	})
}

const getUniqueAddresses = (emailRecords) => {
	let uniqueRecords = [];

	for (let record in emailRecords) {
		if (emailRecords[record].length === 1) {
			uniqueRecords.push(emailRecords[record][0]);
		}
	}

	return uniqueRecords
}

const processData = (records) => {
	let cleanData = {
		'leads': []
	};

	let recordsByEmail = findDuplicatesByEmail(records);
	let uniqueRecords = getUniqueAddresses(recordsByEmail);
	
	
	console.log(recordsByEmail)
}


