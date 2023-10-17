"use strict"
let todoList = []; //declares a new array for Your todo list

const BASE_URL = "https://api.jsonbin.io/v3/b/652e8ecb0574da7622ba10c1"
const SECRET_KEY = "$2a$10$E7ao7pfdn3.YTiwMwSxxcOtVC330kr9O5R521CrqIpgVvNlEdQExa"

    $.ajax({
        // copy Your bin identifier here. It can be obtained in the dashboard
        url: BASE_URL,
        type: 'GET',
        headers: { //Required only if you are trying to access a private bin
            'X-Master-Key': SECRET_KEY,
            'X-Bin-Meta': false
        },
        success: (data) => {
            todoList = data;
        },
        error: (err) => {
            console.log(err.response);
        }
    });

let initList = function() {
    let savedList = window.localStorage.getItem("todos");
    if (savedList != null){
        todoList = JSON.parse(savedList);
    }
    else{
    //code creating a default list with 2 items
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
        // of course the lecture test mentioned above will not take place
    );
    }
}

let updateTodoList = function() {
    let todoListDiv =
        document.getElementById("todoListView");

    //remove all elements
    while (todoListDiv.firstChild) {
        todoListDiv.removeChild(todoListDiv.firstChild);
    }

    //add all elements
    let filterInput = document.getElementById("inputSearch");
    for (let todo in todoList) {
        if (
            (filterInput.value === "") ||
            (todoList[todo].title.includes(filterInput.value)) ||
            (todoList[todo].description.includes(filterInput.value))
        ) {
            let newElement = document.createElement("p");
            let newContent = document.createTextNode(todoList[todo].title + " " +
                todoList[todo].description);
            newElement.appendChild(newContent);
            todoListDiv.appendChild(newElement);

            let newDeleteButton = document.createElement("input");
            newDeleteButton.type = "button";
            newDeleteButton.value = "x";
            newDeleteButton.addEventListener("click",
                function() {
                    deleteTodo(todo);
                });

            newElement.appendChild(newDeleteButton);
        }
    }
}

setInterval(updateTodoList, 1000);

let deleteTodo = function(index) {
    todoList.splice(index,1);
    updateJSONbin();
}

let addTodo = function() {
    //get the elements in the form
    let inputTitle = document.getElementById("inputTitle");
    let inputDescription = document.getElementById("inputDescription");
    let inputPlace = document.getElementById("inputPlace");
    let inputDate = document.getElementById("inputDate");
    //get the values from the form
    let newTitle = inputTitle.value;
    let newDescription = inputDescription.value;
    let newPlace = inputPlace.value;
    let newDate = new Date(inputDate.value);
    //create new item
    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        dueDate: newDate
    };
    //add item to the list
    todoList.push(newTodo);
    updateJSONbin();
    }
let updateJSONbin = function() {
        $.ajax({
            url: BASE_URL,
            type: 'PUT',
            headers: { //Required only if you are trying to access a private bin
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
