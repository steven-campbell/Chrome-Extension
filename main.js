if(location.href.indexOf('.lrhsd.org/genesis/parents?module=gradebook&studentid=') !== -1) {
    //get the new grades as HTML elements
    var newGrades = getGrades();

	chrome.storage.sync.get('grades' + getID(), function(data){
		var oldGrades = data['grades' + getID()];

		//iterate through each grade
		oldGrades.forEach(function(grade, index) {
			var element = newGrades[index];
			var newGrade = getGrade(element);
			//if the grade has changed
			if(grade !== newGrade) {
				if(grade > newGrade) {
					element.style.color = 'red';
					element.title = 'Previous grade: ' + grade + ' (down by ' + round(grade - newGrade) + ' points)';
				} else {
					element.style.color = 'green';
					element.title = 'Previous grade: ' + grade + ' (up by ' + round(newGrade - grade) + ' points)';
				}
				element.style.fontWeight = 'bold';
			}
		});
	});

    //finally, save the grades
    storeGrades(newGrades);
}

//Returns the elements containing the grades
function getGrades() { 
	return document.querySelectorAll('td+td > table');
}

//store the grades from the elements into local storage
function storeGrades(elems) {
	var grades = [];
	for(var x = 0; x < elems.length; x++) {
		grades[x] = getGrade(elems[x]);
	}
	
	//stores the current grades
    	var sendingData = {};
	sendingData['grades' + getID()] = grades;
	chrome.storage.sync.set(sendingData);
}

//gets the grade from the element, or returns an 'x' if there is no grade
function getGrade(element) {
	return parseFloat(element.innerText, 10) || 'x';
}

function round(num) {
	return Math.round(num * 10) / 10;
}

//gets the current student ID
function getID() {
	var id = location.href.indexOf('studentid=');
	return location.href.substring(id + 10, id + 16);
}
