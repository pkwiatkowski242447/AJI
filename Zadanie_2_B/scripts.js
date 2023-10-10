"use strict"
let todoList = []; //declares a new array for Your todo list

let initList = function() {
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
initList();

let updateTodoList = function() {
    let todoListDiv =
        document.getElementById("todoListView");

    //remove all elements
    while (todoListDiv.firstChild) {
        todoListDiv.removeChild(todoListDiv.firstChild);
    }

    //add all elements
    for (let todo in todoList) {
        let newElement = document.createElement("div");
        let newContent = document.createTextNode(
            todoList[todo].title + " " + todoList[todo].description);
        newElement.appendChild(newContent);
        todoListDiv.appendChild(newElement);
    }
    let newDeleteButton = document.createElement("input");
    newDeleteButton.type = "button";
    newDeleteButton.value = "x";
    newDeleteButton.addEventListener("click",
        function() {
            deleteTodo(todo);
        });
}
setInterval(updateTodoList, 1000);

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
}

