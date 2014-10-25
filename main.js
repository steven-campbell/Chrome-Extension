if(location.href.indexOf('.lrhsd.org/genesis/parents?module=gradebook&studentid=') !== -1) {
    var DEBUG = false;

    //get the new grades as HTML elements
    var newGrades = getGrades();
    var oldGrades;

    var storageName = getStorageName();

    //used for debugging
    //chrome.storage.sync.clear();

    if(DEBUG) {
        oldGrades = JSON.parse(localStorage.grades) || [];
        compareGrades(oldGrades, newGrades);
        storeGrades(oldGrades, newGrades);
    } else {
        //get the previous grades and the grades before those
        chrome.storage.sync.get(storageName, function(grades) {
            oldGrades = grades[storageName] || [];

            //compare the old against the new, and change the DOM if necessary
            compareGrades(oldGrades, newGrades);

            //finally, save the grades
            storeGrades(oldGrades, newGrades);
        });
    }
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
                element = setColor(element, 'red');
                element.title = 'Previous grade: ' + grade + ' (down by ' + round(grade - newGrade) + ' points)';
            } else {
                element = setColor(element, 'green');
                element.title = 'Previous grade: ' + grade + ' (up by ' + round(newGrade - grade) + ' points)';
            }

            element.style.fontWeight = 'bold';
        }
    });
}

//since simply setting the color doesn't work anymore, this workaround sets the color for each td in the table
function setColor(element, color) {
    var children = element.children[0].children[0].children;
    for(var x = 0; x < children.length; x++) {
        children[x].style.color = color;
    }
    return element;
}

//returns the elements containing the grades
function getGrades() {
    return document.querySelectorAll('td+td > table');
}

//store the grades from the elements into local storage
function storeGrades(old, elems) {
    var grades = [];

    [].slice.call(elems).forEach(function(elem, index) {
        grades[index] = getGrade(elem);
    });

    //stores the current grades
    var sendingData = {};

    //update the newer grades
    sendingData[getStorageName()] = old;

    if(DEBUG) {
        localStorage.grades = JSON.stringify(grades);
    } else {
        chrome.storage.sync.set(sendingData);
    }
}

//gets the grade from the element, or returns an 'x' if there is no grade
function getGrade(element) {
    return parseFloat(element.innerText, 10) || 'x';
}

//rounds num to the nearest tenth
function round(num) {
    return ~~(num * 10) / 10;
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
function getStorageName() {
    return 'grades' + getID() + getMP();
}
