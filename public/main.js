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
    fetch( "/api/todo", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            title: title,
            isComplete: "false"
        })
    })
    . then(function(res) {
        console.log("then : " +res);
        callback();
    })
    .catch(function(res){
        console.log("catch : " +res);
        error.textContent = "Failed to create item. Server returned " + res.status + " - " + res.responseText;
    });
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
    var span = document.createElement("span");
    span.setAttribute("class", icon);
    span.setAttribute("aria-hidden", "true");
    Button.appendChild(span);
    return Button;
}

function createReq(method, url, body, errorMsg, callback){
    fetch( url, {
        method: method,
        headers: {
            "Content-type": "application/json"
        },
        body: body
    })
    . then(function(res) {
        console.log("then : " +res);
        error.textContent = res.responseText;
        callback();
    })
    .catch(function(res){
        console.log("catch : " +res);
        error.textContent = errorMsg + " Server returned " + res.status + " - " + res.responseText;
    });
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
                    createReq("DELETE", url, "", "Failed to delete item.", function() {
                        reloadTodoList();
                    });
                }
            });
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

                var deleteButton = createButton("deleteButton", "glyphicon glyphicon-remove");
                deleteButton.setAttribute("style", "right: 1%; position: absolute");
                
                var updateButton = createButton("updateButton", "glyphicon glyphicon-pencil");
                updateButton.setAttribute("style", "right: 5%; position: absolute");

                var updButton = createButton("doneButton", "glyphicon glyphicon-ok");
                updButton.setAttribute("style", "right: 5%; position: absolute");

                var listItem = document.createElement("div");
                            
                var item = document.createElement("div");
                item.textContent = todo.title;
                item.setAttribute("id", "item");
                            
                var complete = document.createElement("button");
                complete.setAttribute("class", "btn btn-default");
                var tick = document.createElement("input");
                tick.setAttribute("type", "checkbox");
                tick.setAttribute("id", "tick");

                if (todo.isComplete==="true") {
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
                
                row.appendChild(listItem);

                deleteButton.onclick = function() {
                    var url = "/api/todo/" + todo.id;
                    createReq("DELETE", url, "", "Failed to delete item.", function() {
                        reloadTodoList();
                    });
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
                        createReq("PUT", url, body, "Failed to update item.", function() {
                            reloadTodoList();
                        });

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
                    createReq("PUT", url, body, "Failed to update item.", function() {
                        reloadTodoList();
                    });    
                };

                todoList.appendChild(row);
              }
            });

    itemsLeft.textContent = "You have " + leftItems.toString();
    itemsLeft.textContent += " items left to complete out of " + totalItems.toString();

    });

}

reloadTodoList();


