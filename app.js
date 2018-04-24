'use strict';

const fs = require('fs');

fs.readFile('./leads.json', 'utf8', (err, data) => {
	if (err) {
		console.log(`Error occured reading from filter: ${err}`);
	}

	data = JSON.parse(data);
	processData(data.leads);
})

const writeChangelog = (operation, records) => {
	records.forEach(change => {
		let currentChange = `${operation} ${JSON.stringify(change)}\r\n`;
		fs.appendFile('./changelog.txt', currentChange, (err) => {
			if (err) {
				console.log(`Error appending to file: ${err}`);
			}

			console.log(`Wrote ${JSON.stringify(currentChange)} to changelog.`);
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

const getUpdatedInformation = (emailAddresses) => {
	let updatedInformation = [];
	for (let record in emailAddresses) {
		if (emailAddresses[record].length > 1) {
			updatedInformation.push(emailAddresses[record][0]);
			let oldInformation = emailAddresses[record].slice(1);
			//writeChangelog('removed', oldInformation);
		} else {
			updatedInformation.push(emailAddresses[record][0]);
		}
	}
	return updatedInformation
}

const correctDuplicateIds = (recordList) => {
	recordList.forEach(record => {
		let id = record['_id'];
		console.log(id);
	})
}

const processData = (records) => {
	let cleanData = {
		'leads': []
	};

	let recordsByEmail = findDuplicatesByEmail(records); // all email addresses with arrays of conflicts
	let currentInfo = getUpdatedInformation(recordsByEmail);

	let uniqueRecords = getUniqueAddresses(recordsByEmail); // all email addresses with no conflicts
	// iterate through conflicts and reconcile by selecting the most recent info (prior later on page in tie condition) as offical doc, add to leads array
	// run a diff on each selection for fields changed (names, address, entryDate)
	correctDuplicateIds(currentInfo);
	console.log(recordsByEmail);
	console.log(currentInfo);
}


/* Questions and assumptions: 
		- the addresses without conflicts can exist as is (though IDs may need to be changed) (email approach);
		- Emails cannot be reasonably changed because they're info the user provided, not just for internal record keeping (like ID firlds)
		- ID fields can be changed without catastrophic failure to system.

		** Approaches ** 
			- fix by email: 
			- fix by ID: 

*/