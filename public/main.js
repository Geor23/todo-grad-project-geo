var app = angular.module('TodoApp', []);
app.controller('mainController', function($scope) {

    $scope.todos;
    $scope.todoText;
    $scope.error;
    $scope.itemsLeft = 0;
    $scope.totalItems = 0;


    $scope.addTodo = function() {
        var title = $scope.todoText;
        console.log(title);
        var body= JSON.stringify({
            title: title,
            isComplete: "false"
        });
        $scope.createReq("POST", "/api/todo", body, "Failed to create item.");
        $scope.getTodoList();
        $scope.todoText = "";
    }

    $scope.deleteTodo = function(id) {
        var url = "/api/todo/" + id;
        $scope.createReq("DELETE", url, "", "Failed to delete item.");
        $scope.getTodoList();
    }

    $scope.deleteAllCompleted = function() {
        $scope.todos.forEach(function(todo) {
            if (todo.isComplete === "true") {
                var url = "/api/todo/" + todo.id;
                $scope.createReq("DELETE", url, "", "Failed to delete item.");
                $scope.getTodoList();
            }
        });
    }

    $scope.getTodoList = function() {
        fetch( "/api/todo")
            .then(function(res) {
                if (res.status !== 200) {
                    $scope.error = "Failed to get list. Server returned " + res.status + " - " + res.responseText;
                    return;
                } else {
                    res.json().then(function(data) {
                        console.log(data);
                        $scope.todos = data;
                        $scope.todos.forEach(function(todo) {
                            $scope.totalItems += 1 ;
                            if (todo.isCompleted === "false") {
                                $scope.leftItems += 1 ;
                            }
                        });
                    });
                }
            })
            .catch(function(res){
                $scope.error = "Failed to get list. Server returned " + res.status + " - " + res.responseText;
            });
    }

    $scope.createReq = function (method, url, body, errorMsg){
        fetch( url, {
            method: method,
            headers: {
                "Content-type": "application/json"
            },
            body: body
        })
        . then(function(res) {
            if (res.status !== 200) {
               $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;
            }
        })
        .catch(function(res){
            $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;
        });
    }

    $scope.getTodoList();

});

// ng-if="{{(todo.isComplete === 'true' && !activeTab.includes('Active'))||(todo.isComplete === 'false' && !activeTab.includes('Completed'))}}"

// tabs.onclick = function () {
//     reloadTodoList();
// };

// function createTodoList(todos) {

//     var activeTab = document.getElementsByClassName("active")[0].innerText;

//     todos.forEach(function(todo) {

//         totalItems += 1 ;
//         if (todo.isComplete === "false") {
//             leftItems += 1 ;
//         }

//             deleteButton.onclick = function() {
//                 var url = "/api/todo/" + todo.id;
//                 createReq("DELETE", url, "", "Failed to delete item.");
//                 reloadTodoList();
//             };

//             updateButton.onclick = function() {

//                 listItem.removeChild(updateButton);
//                 listItem.appendChild(updButton);
//                 item.setAttribute("contenteditable", "true");

//                 updButton.onclick = function() {

//                     listItem.removeChild(updButton);
//                     listItem.appendChild(updateButton);
//                     item.removeAttribute("contenteditable");

//                     var url = "/api/todo/" + todo.id;
//                     var body = JSON.stringify({
//                         title: item.textContent,
//                         isComplete: todo.isComplete,
//                         id : todo.id
//                     });
//                     createReq("PUT", url, body, "Failed to update item.");
//                     reloadTodoList();
//                 };
//             };

//             tick.onclick = function () {
//                 var completeValue;
//                 if (todo.isComplete === "true") { completeValue = "false";
//                 } else { completeValue = "true"; }

//                 var url = "/api/todo/" + todo.id;
//                 var body = JSON.stringify({
//                     title: item.textContent,
//                     isComplete: completeValue,
//                     id : todo.id
//                 });
//                 createReq("PUT", url, body, "Failed to update item.");  
//                 reloadTodoList();  
//             };

//             todoList.appendChild(row);
//         }
//     });

//     itemsLeft.textContent = "You have " + leftItems.toString();
//     itemsLeft.textContent += " items left to complete out of " + totalItems.toString();

// }



