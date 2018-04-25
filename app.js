'use strict';

const fs = require('fs');

const writeChangelog = (operation, records) => {
	
	records.forEach(change => {
		let currentChange = `${operation} ${JSON.stringify(change)}\r\n`;
		fs.appendFile('./changelog.txt', currentChange, (err) => {
			if (err) {
				console.log(`Error appending to file: ${err}`);
			}

			console.log(`Wrote ${JSON.stringify(currentChange)} to changelog.`);
		});
	});
};

const findDuplicatesByEmail = (records) => {
	let duplicates = {};
	
	records.forEach(recordIterator => {
		let currentDupes = records.filter(recordToCheck => {
			return recordToCheck.email === recordIterator.email;
		});

		duplicates[recordIterator.email] = sortByTimestamp(currentDupes);
	});

	return duplicates;
};

const sortByTimestamp = (records) => {
	
	  return records.sort((first, second) => {
		let firstDate = new Date(first.entryDate).getTime();
		let secondDate = new Date(second.entryDate).getTime();
		
		return firstDate > secondDate ? -1 : 1;
	});
};


const getUpdatedInformation = (emailAddresses) => {
	let updatedInformation = [];
	
	for (let record in emailAddresses) {
		updatedInformation.push(emailAddresses[record][0]);
		let oldInformation = emailAddresses[record].slice(1);
		console.log(oldInformation)
		if (oldInformation.length > 0) {
			writeChangelog('removed', oldInformation);
		}
	}
	
	return updatedInformation;
};

const correctDuplicateIds = (recordList) => {
	let usedIds = [];
	let needToModify = [];
	recordList.forEach(record => {
		let id = record._id;
		!usedIds.includes(id) ? usedIds.push(id) : needToModify.push(id);
	});



	console.log(usedIds);
	console.log(needToModify);
};

const processData = (records) => {
	let cleanData = {
		'leads': []
	};

	let recordsByEmail = findDuplicatesByEmail(records); // all email addresses with arrays of conflicts
	console.log(recordsByEmail)
	let currentInfo = getUpdatedInformation(recordsByEmail);

	//let uniqueRecords = getUniqueAddresses(recordsByEmail); // all email addresses with no conflicts
	// iterate through conflicts and reconcile by selecting the most recent info (prior later on page in tie condition) as offical doc, add to leads array
	// run a diff on each selection for fields changed (names, address, entryDate)
	correctDuplicateIds(currentInfo);

	//console.log(recordsByEmail);
	//console.log(currentInfo);
	return cleanData;
};

const updateJson = (cleanData) => {
	for (let recordIndex = 0; recordIndex < cleanData.leads.length; recordIndex++) {
		let line = cleanData.leads[recordIndex]
		fs.appendFile('./test.json', cleanData.leads[recordIndex], (err) => {
			if (err) {
				console.log(err);
			}
		})
	}
	return;
}

fs.readFile('./leads.json', 'utf8', (err, data) => {
	if (err) {
		console.log(`Error occured reading from file: ${err}`);
		return;
	}

	data = JSON.parse(data);
	processData(data.leads);
	let testWrite = {"leads": [{a: 1}, {b:2}]};
	updateJson(testWrite)
});



/* Assumptions: 
		- Records which are no longer up to date (conflicting email addresses) should be logged and removed.
		- Records with non-conflicting email addresses can exist as is (though IDs may need to be changed).
		- Emails cannot be reasonably changed because they're info the user provided, not just for internal record keeping (like ID fields).
		- ID fields can be changed without breaking the system as long as they're formatted consistently and don't collide with other IDs.
			- IDs from records which were dropped as duplicates can be recycled and assigned to updated records with conflicting IDs. 
				- This would be difficult to manage without global state or gratuitous passing around of arrays of IDs. 
		- Records with conflicting IDs but accurate and up-to-date email addresses should receive new IDs
			- This new ID assignment should be logged.  
*/