if(location.href.indexOf('.lrhsd.org/genesis/parents?module=gradebook&studentid=') !== -1) {
    //get the new grades as HTML elements
    var newGrades = getGrades();
    var oldGrades, olderGrades;

    var storageName1 = getStorageName(1),
        storageName2 = getStorageName(2);

    //used for debugging
    //chrome.storage.sync.clear();

    //get the previous grades and the grades before those
    chrome.storage.sync.get([storageName1, storageName2], function(grades) {
        oldGrades = grades[storageName1];
        olderGrades = grades[storageName2];

        if(!oldGrades || !olderGrades) {
            oldGrades = olderGrades = initializeGrades(newGrades);
        } else {
            //check if the grades have changed
            if(gradesChanged(oldGrades, newGrades)) {
                //Have the older grades match the newer ones
                olderGrades = oldGrades;

                //Have the newer ones match the current ones
                oldGrades = oldGrades.map(function(grade, index) {
                    return getGrade(newGrades[index]);
                });
            }

            compareGrades(olderGrades, newGrades);
        }

        //finally, save the grades
        storeGrades(olderGrades, newGrades);
    });
}

//set up both arrays - usually called on the first time running the extension
function initializeGrades(newGrades) {
    var grades = [];
    for(var x = 0; x < newGrades.length; x++) {
        grades.push(newGrades[x]);
    }
    return grades;
}

//compare the old grades against the new, and update the DOM accordingly
function compareGrades(old, current) {
    //iterate through each grade
    old.forEach(function(grade, index) {
        //the element representing the grade
        var element = current[index];
        //the value of the grade represented by element
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
}

//returns whether or not the grades have changed since last page visit
function gradesChanged(old, current) {
    old.forEach(function(grade, index) {
        if(grade !== getGrade(current[index])) {
            return true;
        }
    });
    return false;
}

//returns the elements containing the grades
function getGrades() {
    return document.querySelectorAll('td+td > table');
}

//store the grades from the elements into local storage
function storeGrades(old, elems) {
    var grades = [];
    for(var x = 0; x < elems.length; x++) {
        grades[x] = getGrade(elems[x]);
    }

    //stores the current grades
    var sendingData = {};

    //update the newer grades
    sendingData[getStorageName(1)] = grades;
    sendingData[getStorageName(2)] = old;

    chrome.storage.sync.set(sendingData);
}

//gets the grade from the element, or returns an 'x' if there is no grade
function getGrade(element) {
    return parseFloat(element.innerText, 10) || 'x';
}

//rounds num to the nearest tenth
function round(num) {
    return Math.round(num * 10) / 10;
}

//gets the current student ID
function getID() {
    var id = 'studentid=';
    return location.href.substr(location.href.indexOf(id) + id.length, 6);
}

//gets the current marking period
function getMP() {
    return document.querySelector('select.fieldvalue > option[selected]').innerText.substr(2, 1);
}

//gets the key in the key/value pair
//if num is 1, the old grades will be returned
//if num is 2, the older grades will be returned
function getStorageName(num) {
    return 'grades' + num + getID() + getMP();
}
