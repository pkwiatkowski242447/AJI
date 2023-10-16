"use strict"

// Array holding all the tasks to be done.
let todoList = [];

// BaseURL of the bin created in JSONbin
const BASE_URL = "https://api.jsonbin.io/v3/b/6522944b54105e766fbf65dd";

// API key to the bin: X-Master-Key
const SECRET_KEY = "$2a$10$iZS9Dz8Wa.Yg8qoEOOTY.uhxkLhtQyG8fiHZnxWKooKyyIy6I/W0m";

// Function reading initial state of the array read from JSONbin bin. Basically, sending get request
// for a resource described in the BASE_URL with SECRET_KEY (since the bin is private).
let loadDataFromJSONbin = function() {
    $.ajax({
        url: BASE_URL,
        type: 'GET',
        async: false,
        headers: {
            'X-Master-Key': SECRET_KEY,
            // Before adding this header this function didn't work. Basically it removes metadata from response.
            'X-Bin-Meta': false
        },
        success: (data) => {
            // console.log(data);
            todoList = data;
            console.log("Data loaded!")
        },
        error: (err) => {
            console.log(err.response)
        }
    });
}

// Call to the function initiating todoList with two sample to-do tasks.
// initList();

let initList = function() {
    // Getting lists of task from the local storage and putting them into savedList variable.
    let savedList = window.localStorage.getItem("todos")

    // If there are any tasks in the local storage, then parse the string with tasks to the JSON format, and
    // put them into todoList array (it creates object described by the attributes).
    if (savedList != null) {
        todoList = JSON.parse(savedList)
    } else {
        // Else (so in case if savedList is empty - two sample tasks are created below) and put into
        // todoList array.

        // Code creating a default list with 2 items
        todoList.push(
            {
                title: "Learn JS",
                description: "Create a demo application for my TODO's",
                place: "445",
                dueDate: new Date(2019,10,16)
            },
            {
                title: "Lecture test",
                description: "Quick test from the first three lectures",
                place: "F6",
                dueDate: new Date(2019,10,17)
            }
            // Of course the lecture test mentioned above will not take place
        );
    }
}

// This function manages deleting items from todoList (and as a result from todoListView div). It is achieved by
// splicing entire collection of tasks on index-th index and removing one element (meaning of splice arguments).
let deleteTodo = function(index) {
    todoList.splice(index,1)
    // After element is removed - updateJSONbin function must be invoked - in order to change the state of the collection
    // of tasks in JSONbin bin.
    updateJSONbin();
    // Updating state of the table in order for it to reflect deleted task.
    updateTodoList();
}

let updateTodoList = function() {
    // Putting reference to todoListView div into todoListDiv variable. Used later for editing list of shown tasks.
    let todoListDiv = $('#todoListView')

    // Since this function is called every one second - then we remove any nodes that are children of todoListView div
    // since they could have been edited (e.g. deleted) so they again will be taken from todoList and put as children nodes
    // into todoListView div.

    // JQuery function empty() does remove all children nodes of a given node.

    todoListDiv.empty()

    // Adding table tag with table header row with appropriate labels.

    let table = $('<table>')
    let tableHeader = $('<thead>')
        .addClass("table-dark")
    let tableBody  = $('<tbody>')
        .addClass("table-group-divider")
    let tableRow = $('<tr>')

    let tableCaption = $('<caption>').text("List of declared tasks")

    let titleLabel = $('<th>').text("Title")
    let descriptionLabel = $('<th>').text("Description")
    let placeLabel = $('<th>').text("Place")
    let dateLabel = $('<th>').text("Date")
    let deleteLabel = $('<th>').text("Delete")

    todoListDiv.html(
        table
            .append(tableCaption)
            .append(
            tableHeader.append(
                tableRow
                    .append(titleLabel)
                    .append(descriptionLabel)
                    .append(placeLabel)
                    .append(dateLabel)
                    .append(deleteLabel)
            )
        )
            .append(tableBody)
    );

    // Adding all elements from todoList into todoListView div, but of course it also includes filtering.

    // Getting string input from inputSearch (so basically text filter for all the tasks).
    let filterInput = $('#inputSearchByPhrase')[0]
    let dateStartValue = $('#dateSearchFrom')[0].value
    let dateEndValue = $('#dateSearchTo')[0].value

    // Loop executing for every task in todoList.
    for (let todo in todoList) {
        // Task is added to todoList as long as filter is an empty string or its title or description includes text
        // input by the use to the text filter. If none of these are met - then a task is not added to the todoListView div.
        // First condition in this conditional statement must remain with == operator since if user does not input anything
        // it could result in getting null value and as a result - not add any task to the todoListView div.
        let dueDateValue = todoList[todo].dueDate;
        let flag = checkDate(dateStartValue, dateEndValue, dueDateValue)
        if (
            (((filterInput.value == "") ||
            (todoList[todo].title.includes(filterInput.value)) ||
            (todoList[todo].description.includes(filterInput.value))) && flag)
        ) {
            // Creating new element out of information read from todoList (taking title and description of the task
            // and putting them together into a paragraph which later is added to the todoListView div).

            tableRow = $('<tr>')
                .css("border", "1px solid grey")

            titleLabel = $('<td>').text(todoList[todo].title)
            descriptionLabel = $('<td>').text(todoList[todo].description)
            placeLabel = $('<td>').text(todoList[todo].place)
            dateLabel = $('<td>').text(todoList[todo].dueDate)

            let newDeleteButton = $('<input type="button" value="Remove">');
            newDeleteButton
                .css("border", "none")
                .css("width", "100%")
                .css("height", "90%")
            newDeleteButton[0].addEventListener("click",
                function() {
                    deleteTodo(todo)
                }
            )
            deleteLabel.append(newDeleteButton);

            tableBody.append(
                tableRow
                    .append(titleLabel)
                    .append(descriptionLabel)
                    .append(placeLabel)
                    .append(dateLabel)
                    .append(newDeleteButton)
            )
        }
    }

    table.addClass("table")
        .addClass("table-hover")
        .addClass("align-middle");
}

// This function manages updates to the bin on JSONbin.io. This time request type changes to PUT (in order to update
// the resource on the server). Since todoList contains tasks in form of JSON objects - contentType is applicaton / json
// and the content is everything read from todoList - converted to JSON string.
let updateJSONbin = function(asyncValue = true) {
    $.ajax({
        url: BASE_URL,
        type: 'PUT',
        async: asyncValue,
        headers: {
            //Required only if you are trying to access a private bin
            'X-Master-Key': SECRET_KEY
        },
        contentType: 'application/json',
        data: JSON.stringify(todoList),
        success: (data) => {
            console.log(data)
        },
        error: (err) => {
            console.log(err.response)
        }
    });
}

let checkDate = function(startDate, endDate, dueDate) {
    let returnValue;
    if (startDate == "" && endDate == "") {
        returnValue = true
    } else if (startDate == "" && endDate != "" && dueDate <= endDate) {
        returnValue = true
    } else if (startDate != "" && endDate == "" && dueDate >= startDate) {
        returnValue = true
    } else returnValue = dueDate <= endDate && dueDate >= startDate
    return returnValue;
}

let initializeForm = function() {
    let dateSearch = $('#dateSearch')

    let dateSearchFromDiv = $('<div>').addClass("input-group").addClass("mb-3")
    let dateSearchToDiv = $('<div>').addClass("input-group").addClass("mb-3")

    let dateSearchFrom = $('<label>')
        .attr("id", "dateSearchFromId")
        .attr("for", "dateSearchFrom")
        .append("From")
        .addClass("date-range-element")
        .addClass("input-group-text")
    let dateSearchTo = $('<label>')
        .attr("id", "dateSearchToId")
        .attr("for", "dateSearchTo")
        .append("To")
        .addClass("date-range-element")
        .addClass("input-group-text");

    let inputDateSearchFrom = $('<input type="date" id="dateSearchFrom">')
        .attr("class", "form-control")
        .addClass("form-control");

    inputDateSearchFrom[0].addEventListener("input", updateTodoList)

    let inputDateSearchTo = $('<input type="date" id="dateSearchTo">')
        .attr("class", "form-control")
        .addClass("form-control")

    inputDateSearchTo[0].addEventListener("input", updateTodoList)

    dateSearchFromDiv.append(dateSearchFrom)
    dateSearchFromDiv.append(inputDateSearchFrom)

    dateSearchToDiv.append(dateSearchTo)
    dateSearchToDiv.append(inputDateSearchTo)

    dateSearch.append(dateSearchFromDiv)
    dateSearch.append(dateSearchToDiv)

    let phraseSearch = $('#inputSearchByPhrase')
    phraseSearch[0].addEventListener("input", updateTodoList)
}

initializeForm();

// This function manages adding tasks to the list. It performs this action by reading values from the form - creating
// appropriate object representing the task and adding it to the todoList.
let addTodo = function() {
    let newTitleElem = $('#inputTitle')[0]
    let newDescriptionElem = $('#inputDescription')[0]
    let newPlaceElem = $('#inputPlace')[0]
    let newDateElem = $('#inputDate')[0]
    // Get the values from the form
    let newTitle = newTitleElem.value
    let newDescription = newDescriptionElem.value
    let newPlace = newPlaceElem.value
    let newDate = new Date(newDateElem.value)
    newDate = newDate.toISOString().split('T')[0]
    // Create new item - that is an object representing a task - using values read from the form.
    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        dueDate: newDate
    };
    newTitleElem.value = String()
    newDescriptionElem.value = String()
    newPlaceElem.value = String()
    newDateElem.value = String()

    // Add item to the list
    todoList.push(newTodo)

    // After new task is added to the todoList, updateJSON bin function must be invoked to change the state
    // of the JSONbin bin.
    updateJSONbin(false)
    // Updating state of the list of tasks in order for it to reflect added task.
    updateTodoList()
}

// Downloading data from JSONbin.
loadDataFromJSONbin();
// Updating todoList of tasks in order to refresh it after loading data.
updateTodoList();

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('#input-form')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            } else {
                addTodo()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()