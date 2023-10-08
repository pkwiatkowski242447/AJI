"use strict"

// Array holding all the tasks to be done.
let todoList = [];

// BaseURL of the bin created in JSONbin
const BASE_URL = "https://api.jsonbin.io/v3/b/6522944b54105e766fbf65dd";

// API key to the bin: X-Master-Key
const SECRET_KEY = "$2a$10$iZS9Dz8Wa.Yg8qoEOOTY.uhxkLhtQyG8fiHZnxWKooKyyIy6I/W0m";

// Function reading initial state of the array read from JSONbin bin. Basically, sending get request
// for a resource described in the BASE_URL with SECRET_KEY (since the bin is private).
$.ajax({
    url: BASE_URL,
    type: 'GET',
    headers: {
        'X-Master-Key': SECRET_KEY,
        // Before adding this header this function didn't work. Basically it removes metadata from response.
        'X-Bin-Meta': false
    },
    success: (data) => {
        // console.log(data);
        todoList = data;
    },
    error: (err) => {
        console.log(err.response);
    }
});

// Call to the function initiating todoList with two sample to-do tasks.
// initList();

let initList = function() {
    // Getting lists of task from the local storage and putting them into savedList variable.
    let savedList = window.localStorage.getItem("todos");

    // If there are any tasks in the local storage, then parse the string with tasks to the JSON format, and
    // put them into todoList array (it creates object described by the attributes).
    if (savedList != null) {
        todoList = JSON.parse(savedList);
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

let updateTodoList = function() {
    // Putting reference to todoListView div into todoListDiv variable. Used later for editing list of shown tasks.
    let todoListDiv = document.getElementById("todoListView");

    // Since this function is called every one second - then we remove any nodes that are children of todoListView div
    // since they could have been edited (e.g. deleted) so they again will be taken from todoList and put as children nodes
    // into todoListView div.
    while (todoListDiv.firstChild) {
        todoListDiv.removeChild(todoListDiv.firstChild);
    }

    // Adding all elements from todoList into todoListView div, but of course it also includes filtering.

    // Getting string input from inputSearch (so basically text filter for all the tasks).
    let filterInput = document.getElementById("inputSearch");
    // Loop executing for every task in todoList.
    for (let todo in todoList) {
        // Task is added to todoList as long as filter is an empty string or its title or description includes text
        // input by the use to the text filter. If none of these are met - then a task is not added to the todoListView div.
        // First condition in this conditional statement must remain with == operator since if user does not input anything
        // it could result in getting null value and as a result - not add any task to the todoListView div.
        if (
            (filterInput.value === "") ||
            (todoList[todo].title.includes(filterInput.value)) ||
            (todoList[todo].description.includes(filterInput.value))
        ) {
            // Creating new element out of information read from todoList (taking title and description of the task
            // and putting them together into a paragraph which later is added to the todoListView div).
            let newElement = document.createElement("p");
            let newContent = document.createTextNode(todoList[todo].title + " " +
                todoList[todo].description);
            newElement.appendChild(newContent);
            todoListDiv.appendChild(newElement);

            // Creating button for deletion of the element read from JSONbin.io
            let newDeleteButton = document.createElement("input");
            newDeleteButton.type = "button";
            newDeleteButton.value = "x";
            newDeleteButton.addEventListener("click",
                function() {
                    deleteTodo(todo);
                });

            // Adding this delete button as a child of a "task" element.
            newElement.appendChild(newDeleteButton);
        }
    }
}

// Setting interval for updates of to-do list tasks (in milliseconds - so basically the list is updated
// every one second).
setInterval(updateTodoList, 1000);

// This function manages updates to the bin on JSONbin.io. This time request type changes to PUT (in order to update
// the resource on the server). Since todoList contains tasks in form of JSON objects - contentType is applicaton / json
// and the content is everything read from todoList - converted to JSON string.
let updateJSONbin = function() {
    $.ajax({
        url: BASE_URL,
        type: 'PUT',
        headers: {
            //Required only if you are trying to access a private bin
            'X-Master-Key': SECRET_KEY
        },
        contentType: 'application/json',
        data: JSON.stringify(todoList),
        success: (data) => {
            console.log(data);
        },
        error: (err) => {
            console.log(err.response);
        }
    });
}

// This function manages adding tasks to the list. It performs this action by reading values from the form - creating
// appropriate object representing the task and adding it to the todoList.
let addTodo = function() {
    // Get the elements in the form
    let inputTitle = document.getElementById("inputTitle");
    let inputDescription = document.getElementById("inputDescription");
    let inputPlace = document.getElementById("inputPlace");
    let inputDate = document.getElementById("inputDate");
    // Get the values from the form
    let newTitle = inputTitle.value;
    let newDescription = inputDescription.value;
    let newPlace = inputPlace.value;
    let newDate = new Date(inputDate.value);
    // Create new item - that is a object representing a task - using values read from the form.
    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        dueDate: newDate
    };
    // Add item to the list
    todoList.push(newTodo);

    // After new task is added to the todoList, updateJSON bin function must be invoked to change the state
    // of the JSONbin bin.
    updateJSONbin();
}

// This function manages deleting items from todoList (and as a result from todoListView div). It is achieved by
// splicing entire collection of tasks on index-th index and removing one element (meaning of splice arguments).
let deleteTodo = function(index) {
    todoList.splice(index,1);
    // After element is removed - updateJSONbin function must be invoked - in order to change the state of the collection
    // of tasks in JSONbin bin.
    updateJSONbin();
}