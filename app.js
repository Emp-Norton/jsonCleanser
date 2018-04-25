'use strict';

const fs = require('fs');

const writeChangelog = (operation, records) => {
	if (operation === 'removed') {
		records.forEach(change => {
			let currentChange = `Replaced ${JSON.stringify(change)} with updated data.\r\n`;
			fs.appendFile('./changelog.txt', currentChange, (err) => {
				if (err) console.log(`Error appending to file: ${err}`);
				console.log(`Wrote ${JSON.stringify(currentChange)} to changelog.`);
			});
		});
	} else {
		records.forEach(change => {
			let [record, oldID] = change;
			let newID = record._id;
			let currentChange = `Changed ID from ${oldID} to ${newID} due to conflict in ${JSON.stringify(record)}. \r\n`;
			fs.appendFile('./changelog.txt', currentChange, (err) => {
				if (err) console.log(`Error appending to file: ${err}`);
				console.log(`Wrote ${JSON.stringify(currentChange)} to changelog.`);
			});
		})
	}
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

const createNewId = () => {
	let chars = [1,2,3,4,5,6,7,8,9,0];
	for (let i = 97; i < 123; i++) {
		chars.push(String.fromCharCode(i));
	}
	let suffix = '238jdsnfsj23';
	let prefix = '';
	for (let i = 0; i < 5; i++) {
		prefix += chars[Math.floor(Math.random() * chars.length)];
	}
	return prefix + suffix;
}

const correctDuplicateIds = (recordList) => {
	let registeredIDs = [];
	let conflicts = [];
	let recordsWithChangedIDs = [];
	recordList.forEach(currentRecord => {
		registeredIDs.includes(currentRecord._id) ? conflicts.push(currentRecord._id) : registeredIDs.push(currentRecord._id);
	});
	recordList.forEach(record => {
		if (conflicts.includes(record._id)) {
			let newID;
			while (!newID || registeredIDs.includes(newID)) {
				newID = createNewId();
			}
			let oldID = record._id;
			record._id = newID;
			recordsWithChangedIDs.push([record, oldID])
			writeChangelog('changed', recordsWithChangedIDs);
		}
	})
};

const writeUpdatedJson = (cleanData) => {
	fs.appendFileSync('./test.json', '{"leads":[\r\n', (err) => {
		if (err) console.log(err);
	});

	for (let recordIndex = 0; recordIndex < cleanData.leads.length; recordIndex++) {
		let line = JSON.stringify(cleanData.leads[recordIndex]) + '\r\n';
		fs.appendFileSync('./test.json', line, (err) => {
			if (err) console.log(err);
		});
	}

	fs.appendFileSync('./test.json', ']\r\n}', (err) => {
		if (err) console.log(err);
	});
	return;
}


const processData = (records) => {
	let cleanData = {
		'leads': []
	};

	let recordsByEmail = findDuplicatesByEmail(records); 
	console.log(recordsByEmail)
	let currentInfo = getUpdatedInformation(recordsByEmail);
	correctDuplicateIds(currentInfo);
	
	writeUpdatedJson({"leads": currentInfo});


	return cleanData;
};


fs.readFile('./leads.json', 'utf8', (err, data) => {
	if (err) {
		console.log(`Error occured reading from file: ${err}`);
		return;
	}

	data = JSON.parse(data);
	processData(data.leads);
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