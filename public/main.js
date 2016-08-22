
/*global angular */

var app = angular.module("TodoApp", [ "ngDialog", "colorpicker.module"]);
app.controller("mainController", ["$scope", "ngDialog", function($scope, ngDialog) {

    $scope.todos = [];
    $scope.todoText = "";
    $scope.error = "";
    $scope.textInput = "";
    $scope.todoComment = "";
    $scope.itemsLeft = 0;
    $scope.totalItems = 0;
    $scope.updating = false;
    $scope.activeTab = "All";
    $scope.newList = "";
    $scope.commentOn = false;
    $scope.loc = window.location.search;

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
        var url = "/api/todo/bck";
        var body = JSON.stringify({
            list: ($scope.loc).split("?list=")[1],
            bck: bck
        });
        $scope.createReq("PUT", url, body, "Failed to update item.");
    };

    $scope.createNewList = function() {
        var loc = $scope.newList;
        var body= JSON.stringify({
            loc: loc
        });
        $scope.createReq("POST", "/api/todo", body, "Failed to create list.");
        window.location.replace(window.location + "?list=" +  encodeURIComponent(loc));
        $scope.newList = "";
    };

    $scope.addTodo = function() {
        var title = $scope.todoText;
        var url = "/api/todo/" + ($scope.loc).split("?list=")[1];
        var body= JSON.stringify({
            title: title,
            isComplete: false,
            comments: []
        });
        $scope.createReq("POST", url, body, "Failed to create item.");
        $scope.todoText = "";
    };

    $scope.deleteComment = function(id, comment){
        var url = "/api/todo/comment";
        var body = JSON.stringify({
            list: ($scope.loc).split("?list=")[1],
            id : id,
            comment : comment
        });
        $scope.createReq("DELETE", url, body, "Failed to delete item.");
    };
   
    $scope.deleteTodo = function(id) {
        var url = "/api/todo/" + ($scope.loc).split("?list=")[1] + "/" + id;
        $scope.createReq("DELETE", url, "", "Failed to delete item.");
    };

    $scope.deleteAllCompleted = function() {
        $scope.todos.forEach(function(todo) {
            if (todo.isComplete === true) {
                var url = "/api/todo/" + ($scope.loc).split("?list=")[1] + "/" + todo.id;
                $scope.createReq("DELETE", url, "", "Failed to delete item.");
            }
        });
    };

    $scope.updateTodo = function(id, complete, text, comments, comment) {
        if (comment !== "") {
            comments.push(comment); 
        }
        var url = "/api/todo/" + ($scope.loc).split("?list=")[1] + "/" + id;
        var body = JSON.stringify({
            title: text,
            isComplete: complete,
            id : id,
            comments : comments
        });
        $scope.createReq("PUT", url, body, "Failed to update item.");
    };

    $scope.getTodoList = function() {
        $scope.totalItems = 0;
        $scope.itemsLeft = 0;
        if ($scope.loc!=="") {
            var url = "/api/todo/" + ($scope.loc).split("?list=")[1];
            fetch(url)
                .then(function(res) {
                    if (res.status !== 200) {
                        $scope.error = "Failed to get list. Server returned " + res.status + " - " + res.responseText;
                        window.location.search="";
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
                    window.location.search="";
                });
        }
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
            $scope.getTodoList();
        })
        .catch(function(res){
            $scope.error = errorMsg + " Server returned " + res.status + " - " + res.responseText;
        });
    };

}]);

