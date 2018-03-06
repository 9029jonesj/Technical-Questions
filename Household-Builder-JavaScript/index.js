var ageInput = document.getElementsByName("age")[0];
var relationshipInput = document.getElementsByName("rel")[0];
var smokerInput = document.getElementsByName("smoker")[0];
var addButton = document.getElementsByClassName("add")[0];
var debug = document.getElementsByClassName("debug")[0];
var deleteButton = document.createElement("button");
var deleteInput = document.createElement("input");
var list = document.createElement("ol");
var form = document.forms[0];
var householdList = [];

deleteInput.placeholder = "# person you wish to delete";
deleteButton.innerHTML = "delete";
list.id = "list";

addButton.onclick = function(event) {
  event.preventDefault();
  if (checkInputs("add")) {
    var person = {
      age: ageInput.value,
      relationship: relationshipInput.value,
      smoker: smokerInput.checked === true ? "Yes" : "No"
    };
    var listNode = document.createElement("li");
    var personNode = document.createTextNode("Age: " + person.age + " | Relationship: " + person.relationship + " | Smoker: " + person.smoker);

    listNode.name = "li";

    listNode.appendChild(personNode);
    list.appendChild(listNode);
    householdList.push(person);

    resetDefaults();
  } else {
    alert('Please insert data.');
  }
};
ageInput.onkeyup = function() {
  validation(this);
};
deleteButton.onclick = function(event) {
  event.preventDefault();
  var value = deleteInput.value;
  if (checkInputs("delete") && value <= householdList.length) {
    householdList.splice(value - 1, 1);
    list.removeChild(list.childNodes[value - 1]);
  }
  resetDefaults();
};
deleteInput.onkeyup = function() {
  validation(this);
};
form.onsubmit = function(event) {
  event.preventDefault();
  var serialize = JSON.stringify(householdList);
  debug.style.display = "block";
  debug.style.wordWrap = "break-word";
  debug.style.whiteSpace = "initial";
  debug.innerHTML = serialize;
};

form.appendChild(deleteInput);
form.appendChild(deleteButton);
form.appendChild(list);

function validation(e) {
  var value = e.value;
  if (!(value.match(/^\d+$/)) || value <= 0) {
    e.value = "";
  }
}

function resetDefaults() {
  ageInput.value = "";
  relationshipInput.value = "";
  smokerInput.checked = false;
  deleteInput.value = "";
}

function checkInputs(type) {
  switch (type) {
    case "add":
      if (ageInput.value.length === 0 || relationshipInput.value.length === 0) return false;
      else return true;
      break;
    case "delete":
      if (deleteInput.value.length === 0 || householdList.length <= 0) return false;
      else return true;
      break;
    default:
  }
}
