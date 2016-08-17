var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var itemsLeft = document.getElementById("count-label");
var error = document.getElementById("error");
var tabs = document.getElementById("tabs");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

tabs.onclick = function () {
    reloadTodoList();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        isComplete: "false"
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

    var totalItems = 0;
    var leftItems = 0;


    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";

        var activeTab = document.getElementsByClassName("active")[0].innerText;
        console.log(activeTab);

        
        

        var deleteAllButton = document.createElement("button");
        deleteAllButton.setAttribute("type", "button");
        deleteAllButton.setAttribute("class", "btn btn-default");
        deleteAllButton.setAttribute("id", "deleteAllButton");
        //deleteAllButton.setAttribute("style", "right: 1%; position: absolute");
        var delAllText = document.createTextNode("Delete Completed");
        deleteAllButton.appendChild(delAllText);



        deleteAllButton.onclick = function () {

            todos.forEach(function(todo) {
                if (todo.isComplete === "true") {
                    var createRequest = new XMLHttpRequest();
                    createRequest.open("DELETE", "/api/todo/" + todo.id);
                    createRequest.onload = function() {
                        if (this.status === 200) {
                        } else {
                            error.textContent = "Failed to delete item. Server returned ";
                            error.textContent += this.status + " - " + this.responseText;
                        }
                    };
                    createRequest.send();
                }
            });
            reloadTodoList();
        };

        todoList.appendChild(deleteAllButton);

        todos.forEach(function(todo) {

            totalItems += 1 ;
            if (todo.isComplete === "false") {
                leftItems += 1 ;
            }

            var first = (todo.isComplete === "true" && !activeTab.includes("Active"));
            var second = (todo.isComplete === "false" && !activeTab.includes("Completed"));
            if (first || second) {

                var row = document.createElement("li");
                row.setAttribute("class", "list-group-item");
                row.setAttribute("style", "margin: 10px");

                var listItem = document.createElement("div");
                
                
                var item = document.createElement("div");
                item.textContent = todo.title;
                item.setAttribute("id", "item");
                if (todo.isComplete==="true") {
                    item.setAttribute("style", "display: inline-block;  text-decoration: line-through; font-style: italic; padding-left: 10px");
                } else {
                    item.setAttribute("style", "display: inline-block;  text-decoration: none; font-style: normal; padding-left: 10px");
                }

                
                var deleteButton = document.createElement("button");
                deleteButton.setAttribute("type", "button");
                deleteButton.setAttribute("class", "btn btn-default");
                deleteButton.setAttribute("id", "deleteButton");
                deleteButton.setAttribute("style", "right: 1%; position: absolute");
                var del = document.createElement("span");
                del.setAttribute("class", "glyphicon glyphicon-remove");
                del.setAttribute("aria-hidden", "true");
                deleteButton.appendChild(del);


                
                var updateButton = document.createElement("button");
                updateButton.setAttribute("type", "button");
                updateButton.setAttribute("class", "btn btn-default");
                updateButton.setAttribute("id", "updateButton");
                updateButton.setAttribute("style", "right: 5%; position: absolute");
                var update = document.createElement("span");
                update.setAttribute("class", "glyphicon glyphicon-pencil");
                update.setAttribute("aria-hidden", "true");
                updateButton.appendChild(update);


                
                var complete = document.createElement("button");
                complete.setAttribute("class", "btn btn-default");
                var tick = document.createElement("input");
                tick.setAttribute("type", "checkbox");
                tick.setAttribute("id", "tick");
                if (todo.isComplete === "true") {
                    tick.setAttribute("checked", "true");
                } else {
                    tick.removeAttribute("checked");
                }
                complete.appendChild(tick);


                listItem.appendChild(complete);
                listItem.appendChild(item);
                listItem.appendChild(deleteButton);
                listItem.appendChild(updateButton);
                
                row.appendChild(listItem);

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
                    item.setAttribute("contenteditable", "true");

                    var updButton = document.createElement("button");
                    updButton.setAttribute("type", "button");
                    updButton.setAttribute("class", "btn btn-default");
                    updButton.setAttribute("id", "doneButton");
                    updButton.setAttribute("style", "right: 5%; position: absolute");

                    var upd = document.createElement("span");
                    upd.setAttribute("class", "glyphicon glyphicon-ok");
                    upd.setAttribute("aria-hidden", "true");
                    updButton.appendChild(upd);

                    listItem.removeChild(updateButton);
                    listItem.appendChild(updButton);

                    updButton.onclick = function() {

                        listItem.removeChild(updButton);
                        listItem.appendChild(updateButton);

                        var title = item.textContent;
                        item.removeAttribute("contenteditable");

                        var createRequest = new XMLHttpRequest();
                        createRequest.open("PUT", "/api/todo/" + todo.id);
                        createRequest.setRequestHeader("Content-type", "application/json");
                        createRequest.send(JSON.stringify({
                            title: title,
                            isComplete: todo.isComplete,
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

                tick.onclick = function () {
                    var title = item.textContent;
                    var complete;
                    if (todo.isComplete === "true") {
                        complete = "false";
                    }
                    else {
                        complete = "true";
                    }

                    var createRequest = new XMLHttpRequest();
                    createRequest.open("PUT", "/api/todo/" + todo.id);
                    createRequest.setRequestHeader("Content-type", "application/json");
                    createRequest.send(JSON.stringify({
                        title: title,
                        id : todo.id,
                        isComplete: complete
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

                todoList.appendChild(row);
              }
            });

    //itemsLeft.appendChild(deleteAllButton);
    //todoList.appendChild(deleteAllButton);

    itemsLeft.textContent = "You have " + leftItems.toString();
    itemsLeft.textContent += " items left to complete out of " + totalItems.toString();

    });

}

reloadTodoList();


