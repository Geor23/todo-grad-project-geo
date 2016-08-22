
/*global angular */

var app = angular.module("TodoApp", [ "ngDialog", "colorpicker.module"]);
app.controller("mainController", ["$scope", "ngDialog", function($scope, ngDialog) {

    $scope.todos = [];
    $scope.todoText = "";
    $scope.error = "";
    $scope.textInput = "";
    $scope.itemsLeft = 0;
    $scope.totalItems = 0;
    $scope.updating = false;
    $scope.activeTab = "All";
    $scope.newList = "";
    $scope.loc = window.location.pathname;

    $scope.openBackgroundDialog = function() {
        ngDialog.open({ 
            template: "set-background.html", 
            className: "ngdialog-theme-default",
            showClose: true,
            closeByDocument: true,
            closeByEscape: true,
            scope: $scope 
        });
    };

    $scope.setBackground = function(bck) {
        console.log($scope.loc);
        $scope.style={"background-color":bck};
        var body = JSON.stringify({
            bck: bck
        });
        $scope.createReq("PUT", "/api/todo/bck", body, "Failed to update item.");
    };

    $scope.createNewList = function() {
        var loc = $scope.newList;
        console.log(loc);
        var body= JSON.stringify({
            loc: loc
        });
        $scope.createReq("POST", "/api/todo", body, "Failed to create list.");
        window.location.pathname = $scope.newList;
        $scope.newList = "";
    };

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
        fetch( "/api/todo" + loc)
            .then(function(res) {
                if (res.status !== 200) {
                    $scope.error = "Failed to get list. Server returned " + res.status + " - " + res.responseText;
                    return;
                } else {
                    res.json().then(function(data) {
                        $scope.style={"background-color":data.bck};
                        $scope.todos = data.todos;
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
            if (res.status !== 200 && res.status !== 201) {
                $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;   
            }
            //$scope.getTodoList();
        })
        .catch(function(res){
            $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;
        });
    };

}]);

