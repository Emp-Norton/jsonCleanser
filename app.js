let fs = require('fs');

fs.readFile('./leads.json', 'utf8', function(err, data) {
	if (err) {
		console.log(`Error occured: ${err}`);
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
			console.log(`Wrote ${change} to changelog.`)
		})	
	})
}

const findDuplicates = (records) => {
	let duplicates = {};
	records.forEach((record, recordIndex) => {
		let currentDupes = records.filter((recordToCheck, filterIndex) => {
			if (recordIndex !== filterIndex) {
				return (recordToCheck['_id'] === record['_id'] || recordToCheck['email'] === record['email'])
			}
		})
		duplicates[recordIndex] = currentDupes;
	})
	console.log(duplicates); // remove this little guy
	return duplicates
}

const sortByTimestamp = (records) => {
	return records.sort((first, second) => {
		let firstDate = new Date(first.entryDate).getTime();
		let secondDate = new Date(second.entryDate).getTime();
		return firstDate > secondDate ? -1 : 1
	})
}

const processData = (records) => {
	let cleanedData = {
		'leads': []
	};
	findDuplicates(records);
}


// iterate through each record grabbing duplicates by ID and email
// order duplicates by timestamp (oldest to newest)
// check name + address for each duplicate
	// if matches
		// use most recent version of data
	// if doesn't match
		// change ID field (email can't be reasonably changed) --> how to handle email conflicts? John Smith + Micah Valmer same email + address

		
