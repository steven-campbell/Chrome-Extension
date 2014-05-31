if(location.href.indexOf('.lrhsd.org/genesis/parents?module=gradebook&studentid=') !== -1) {
    //get the new grades as HTML elements
    var newGrades = getGrades();
  
    //if the old grades have been stored, compare them against the new grades
    if(localStorage.grades) {
      var oldGrades = JSON.parse(localStorage.grades);
      
      //iterate through each grade
      oldGrades.forEach(function(grade, index) {
          var newGrade = getGrade(newGrades[index])
          //if the grade has changed
          if(grade !== newGrade) {
              if(grade > newGrade) {
                  newGrades[index].style.color = 'red';
                  newGrades[index].title = 'Previous grade: ' + grade + ' (down by ' + round(Math.abs(newGrade - grade)) + ' points)';
              } else {
                  newGrades[index].style.color = 'green';  
                  newGrades[index].title = 'Previous grade: ' + grade + ' (up by ' + round(Math.abs(grade - newGrade)) + ' points)';
              }
          }
      });
    }
  
    //finally, store the grades in local storage
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
    localStorage.grades = JSON.stringify(grades);
}

 //gets the grade from the element, or returns an 'x' if there is no grade
 function getGrade(element) {
    return parseFloat(element.innerText, 10) || 'x';
 }

function round(num) {
  return Math.round(num * 10) / 10;
}