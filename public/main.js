var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var itemsLeft = document.getElementById("count-label");
var error = document.getElementById("error");
var tabs = document.getElementById("tabs");
var deleteButton, updateButton, updButton, complete, item, tick, listItem;

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
    // fetch( "/api/todo", {
    //     method: "POST",
    //     headers: {
    //         "Content-type", "application/json"
    //     },
    //     body: JSON.stringify({
    //         title: title,
    //         isComplete: "false"
    //     })
    // })
    // . then();
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

function createButton(id, icon) {
    var Button = document.createElement("button");
    Button.setAttribute("type", "button");
    Button.setAttribute("class", "btn btn-default");
    Button.setAttribute("id", id);
    var del = document.createElement("span");
    del.setAttribute("class", icon);
    del.setAttribute("aria-hidden", "true");
    Button.appendChild(del);
    return Button;
}

function createReq(method, url, body, errorMsg){
    var createRequest = new XMLHttpRequest();
    createRequest.open(method, url);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(body);
    createRequest.onload = function() {
        if (this.status === 200) {
            //reloadTodoList();
        } else {
            error.textContent = errorMsg + " Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function createItem(title, completeValue) {

    deleteButton = createButton("deleteButton", "glyphicon glyphicon-remove");
    deleteButton.setAttribute("style", "right: 1%; position: absolute");
    
    updateButton = createButton("updateButton", "glyphicon glyphicon-pencil");
    updateButton.setAttribute("style", "right: 5%; position: absolute");

    updButton = createButton("doneButton", "glyphicon glyphicon-ok");
    updButton.setAttribute("style", "right: 5%; position: absolute");

    listItem = document.createElement("div");
                
    item = document.createElement("div");
    item.textContent = title;
    item.setAttribute("id", "item");
                
    complete = document.createElement("button");
    complete.setAttribute("class", "btn btn-default");
    tick = document.createElement("input");
    tick.setAttribute("type", "checkbox");
    tick.setAttribute("id", "tick");

    if (completeValue==="true") {
        item.setAttribute("style", "display: inline-block;  text-decoration: line-through; font-style: italic; padding-left: 10px");
        tick.setAttribute("checked", "true");
    } else {
        item.setAttribute("style", "display: inline-block;  text-decoration: none; font-style: normal; padding-left: 10px");
        tick.removeAttribute("checked");
    }

    complete.appendChild(tick);

    listItem.appendChild(complete);
    listItem.appendChild(item);
    listItem.appendChild(deleteButton);
    listItem.appendChild(updateButton);
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
                    var url = "/api/todo/" + todo.id;
                    createReq("DELETE", url, "", "Failed to delete item.");
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

                createItem(todo.title, todo.isComplete);
                
                row.appendChild(listItem);

                deleteButton.onclick = function() {
                    var url = "/api/todo/" + todo.id;
                    createReq("DELETE", url, "", "Failed to delete item.");
                    reloadTodoList();
                };

                updateButton.onclick = function() {

                    listItem.removeChild(updateButton);
                    listItem.appendChild(updButton);
                    item.setAttribute("contenteditable", "true");

                    updButton.onclick = function() {

                        listItem.removeChild(updButton);
                        listItem.appendChild(updateButton);
                        item.removeAttribute("contenteditable");

                        var url = "/api/todo/" + todo.id;
                        var body = JSON.stringify({
                            title: item.textContent,
                            isComplete: todo.isComplete,
                            id : todo.id
                        });
                        createReq("PUT", url, body, "Failed to update item.");
                        reloadTodoList();

                    };
                };

                tick.onclick = function () {
                    var completeValue;
                    if (todo.isComplete === "true") { completeValue = "false";
                    } else { completeValue = "true"; }

                    var url = "/api/todo/" + todo.id;
                    var body = JSON.stringify({
                        title: item.textContent,
                        isComplete: completeValue,
                        id : todo.id
                    });
                    createReq("PUT", url, body, "Failed to update item.");
                    reloadTodoList();     
                };

                todoList.appendChild(row);
              }
            });

    itemsLeft.textContent = "You have " + leftItems.toString();
    itemsLeft.textContent += " items left to complete out of " + totalItems.toString();

    });

}

reloadTodoList();


