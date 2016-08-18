/*global angular */

var app = angular.module("TodoApp", []);
app.controller("mainController", ["$scope", function($scope) {

    $scope.todos = [];
    $scope.todoText = "";
    $scope.error = "";
    $scope.textInput = "";
    $scope.itemsLeft = 0;
    $scope.totalItems = 0;
    $scope.updating = false;
    $scope.activeTab = "All";


    $scope.addTodo = function() {
        var title = $scope.todoText;
        console.log(title);
        var body= JSON.stringify({
            title: title,
            isComplete: false
        });
        $scope.createReq("POST", "/api/todo", body, "Failed to create item.");
        $scope.todoText = "";
    };

    $scope.deleteTodo = function(id) {
        var url = "/api/todo/" + id;
        $scope.createReq("DELETE", url, "", "Failed to delete item.");
    };

    $scope.deleteAllCompleted = function() {
        $scope.todos.forEach(function(todo) {
            if (todo.isComplete === true) {
                var url = "/api/todo/" + todo.id;
                $scope.createReq("DELETE", url, "", "Failed to delete item.");
            }
        });
    };

    $scope.updateTodo = function(id, complete, text) {
        var url = "/api/todo/" + id;
        var body = JSON.stringify({
            title: text,
            isComplete: complete,
            id : id
        });
        $scope.createReq("PUT", url, body, "Failed to update item.");
    };


    $scope.getTodoList = function() {
        $scope.totalItems = 0;
        $scope.itemsLeft = 0;
        fetch( "/api/todo")
            .then(function(res) {
                if (res.status !== 200) {
                    $scope.error = "Failed to get list. Server returned " + res.status + " - " + res.responseText;
                    return;
                } else {
                    res.json().then(function(data) {
                        $scope.todos = data;
                        $scope.todos.forEach(function(todo) {
                            $scope.totalItems += 1 ;
                            if (todo.isComplete === false) {
                                $scope.itemsLeft += 1 ;
                            }
                        });
                        $scope.$apply();
                    });
                }
            })
            .catch(function(res){
                $scope.error = "Failed to get list. Server returned " + res.status + " - " + res.responseText;
            });
    };

    $scope.createReq = function (method, url, body, errorMsg){
        fetch( url, {
            method: method,
            headers: {
                "Content-type": "application/json"
            },
            body: body
        })
        . then(function(res) {

            $scope.error = res;
            if (res.status !== 200) {
                $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;   
            }
            $scope.getTodoList();
        })
        .catch(function(res){
            $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;
        });
    };

    

}]);

