var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}



function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            listItem.textContent = todo.title;
            listItem.setAttribute("id", "item");

            var deleteButton = document.createElement("button");
            deleteButton.setAttribute("type", "button");
            deleteButton.setAttribute("class", "btn btn-default");
            deleteButton.setAttribute("id", "deleteButton");

            var del = document.createElement("span");
            del.setAttribute("class", "glyphicon glyphicon-remove");
            del.setAttribute("aria-hidden", "true");
            deleteButton.appendChild(del);


            var updateButton = document.createElement("button");
            updateButton.setAttribute("type", "button");
            updateButton.setAttribute("class", "btn btn-default");
            updateButton.setAttribute("id", "updateButton");

            var update = document.createElement("span");
            update.setAttribute("class", "glyphicon glyphicon-pencil");
            update.setAttribute("aria-hidden", "true");
            updateButton.appendChild(update);


            deleteButton.onclick = function() {
                var createRequest = new XMLHttpRequest();
                createRequest.open("DELETE", "/api/todo/"+todo.id);
                createRequest.send();
                createRequest.onload = function() {
                    if (this.status === 200) {
                        reloadTodoList();
                    } else {
                        error.textContent = "Failed to delete item. Server returned " + this.status + " - " + this.responseText;
                    }
                };
            };

            updateButton.onclick = function() {
                listItem.setAttribute("contenteditable", "true");

                var updButton = document.createElement("button");
                updButton.setAttribute("type", "button");
                updButton.setAttribute("class", "btn btn-default");
                updButton.setAttribute("id", "doneButton");

                var upd = document.createElement("span");
                upd.setAttribute("class", "glyphicon glyphicon-ok");
                upd.setAttribute("aria-hidden", "true");
                updButton.appendChild(upd);

                listItem.removeChild(updateButton);
                listItem.appendChild(updButton);

                updButton.onclick = function() {

                    listItem.removeChild(updButton);
                    listItem.appendChild(updateButton);

                    var title = listItem.textContent;
                    listItem.removeAttribute("contenteditable");

                    var createRequest = new XMLHttpRequest();
                    createRequest.open("PUT", "/api/todo/" + todo.id);
                    createRequest.setRequestHeader("Content-type", "application/json");
                    createRequest.send(JSON.stringify({
                        title: title,
                        id : todo.id
                    }));

                    createRequest.onload = function() {
                        if (this.status === 200) {
                            reloadTodoList();
                        } else {
                            error.textContent = "Failed to update item. Server returned ";
                            error.textContent += this.status + " - " + this.responseText;
                        }
                    };
                };
            };

            listItem.appendChild(deleteButton);
            listItem.appendChild(updateButton);
            todoList.appendChild(listItem);
        });
    });
}

reloadTodoList();
