var app = angular.module('TodoApp', []);
app.controller('mainController', ['$scope', function($scope) {

    $scope.todos;
    $scope.todoText;
    $scope.error;
    $scope.text;
    $scope.itemsLeft = 0;
    $scope.totalItems = 0;
    $scope.updating = false;


    $scope.addTodo = function() {
        var title = $scope.todoText;
        console.log(title);
        var body= JSON.stringify({
            title: title,
            isComplete: false
        });
        $scope.createReq("POST", "/api/todo", body, "Failed to create item.");
        $scope.todoText = "";
    }

    $scope.deleteTodo = function(id) {
        var url = "/api/todo/" + id;
        $scope.createReq("DELETE", url, "", "Failed to delete item.");
    }

    $scope.deleteAllCompleted = function() {
        $scope.todos.forEach(function(todo) {
            if (todo.isComplete === true) {
                var url = "/api/todo/" + todo.id;
                $scope.createReq("DELETE", url, "", "Failed to delete item.");
            }
        });
    }

    $scope.updateTodo = function(id, complete) {
        console.log($scope.text);
        var url = "/api/todo/" + id;
        var body = JSON.stringify({
            title: $scope.text,
            isComplete: complete,
            id : id
        });
        console.log(body);
        $scope.createReq("PUT", url, body, "Failed to update item.");
    }

    $scope.completeTodo = function (id, complete, title) {
        console.log(complete);
        var url = "/api/todo/" + id;
        var body = JSON.stringify({
            title: title,
            isComplete: complete,
            id : id
        });
        console.log(body);
        $scope.createReq("PUT", url, body, "Failed to update item.");
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
                            if (todo.isComplete === false) {
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
            console.log(res);
            if (res.status !== 200) {
                $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;
                $scope.getTodoList();
            }
        })
        .catch(function(res){
            $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;
        });
    }

    

}]);

// ng-if="{{(todo.isComplete === 'true' && !activeTab.includes('Active'))||(todo.isComplete === 'false' && !activeTab.includes('Completed'))}}"


