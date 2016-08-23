var server = require("../server/server");
var request = require("request");
var assert = require("chai").assert;
var _ = require("underscore");


var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var todoListUrl = baseUrl + "/api/todo";

describe("server", function() {
    var serverInstance;
    beforeEach(function() {
        serverInstance = server(testPort);
    });
    afterEach(function() {
        serverInstance.close();
    });
    describe("get list of todos", function() {
        it("responds with status code 200", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request(todoListUrl+"/loc", function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("responds with a body encoded as JSON in UTF-8", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request(todoListUrl+"/loc", function(error, response) {
                    assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
                    done();
                });
            });
        });
        it("responds with a body that is a JSON empty object", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function(error, response) {
                request(todoListUrl+"/loc", function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), { todos: [], bck: "#191818"});
                    done();
                });
            });
        });
    });
    describe("create a new todo", function() {
        it("responds with status code 201", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request.post({
                    url: todoListUrl+"/loc",
                    json: {
                        title: "This is a TODO item",
                        done: false
                    }
                }, function(error, response) {
                    assert.equal(response.statusCode, 201);
                    done();
                });
            });
        });
        it("responds with the location of the newly added resource", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request.post({
                    url: todoListUrl+"/loc",
                    json: {
                        title: "This is a TODO item",
                        done: false
                    }
                }, function(error, response) {
                    assert.equal(response.headers.location, "/api/todo/0");
                    done();
                });
            });
        });
        it("inserts the todo at the end of the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request.post({
                    url: todoListUrl+"/loc",
                    json: {
                        title: "This is a TODO item",
                        done: false
                    }
                }, function() {
                    request.get(todoListUrl+"/loc", function(error, response, body) {
                        assert.deepEqual(JSON.parse(body), { todos: [{ title: "This is a TODO item", done: false, id: 0 }], bck: "#191818" });
                        done();
                    });
                });
            });
        });
    });
    describe("delete a todo", function() {
        it("responds with status code 404 if there is no such item", function(done) {
            request.del(todoListUrl + "/0", function(error, response) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
        it("responds with status code 200", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request.post({
                    url: todoListUrl+"/loc",
                    json: {
                        title: "This is a TODO item",
                        done: false
                    }
                }, function() {
                    request.del(todoListUrl + "/loc/0", function(error, response) {
                        assert.equal(response.statusCode, 200);
                        done();
                    });
                }); 
            });
        });
        it("removes the item from the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request.post({
                    url: todoListUrl+"/loc",
                    json: {
                        title: "This is a TODO item",
                        done: false
                    }
                }, function() {
                    request.del(todoListUrl + "/loc/0", function() {
                        request.get(todoListUrl + "/loc/", function(error, response, body) {
                            assert.deepEqual(JSON.parse(body), { todos: [], bck: "#191818" });
                            done();
                        });
                    });
                });
            });
        });
    });
    describe("change the background", function() {
        it("changes the bck value", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request.put({
                    url: todoListUrl+"/bck",
                    json: {
                        list: "loc",
                        bck: "00000"
                    }
                }, function() {
                    request.get(todoListUrl + "/loc/", function(error, response, body) {
                        assert.deepEqual(JSON.parse(body), { todos: [], bck: "00000" });
                        done();
                    });
                });
            });
        });
    });
    describe("delete a comment", function() {
        it("add a comment", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request.post({
                    url: todoListUrl+"/loc",
                    json: {
                        title: "This is a TODO item",
                        done: false
                    }
                }, function() {

                    request.put({
                        url: todoListUrl+"/loc/0",
                        json: {
                            title: "This is a TODO item",
                            done: false,
                            comments: ["This is a comment"]
                        }
                    }, function() {

                        request.get(todoListUrl+"/loc", function(error, response, body) {
                            assert.deepEqual(JSON.parse(body), { todos: [{ title: "This is a TODO item", done: false, id: 0, comments: ["This is a comment"] }], bck: "#191818" });
                            done();
                        });
                    });
                });
            });
        });
        it("delete a comment", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    loc: "loc"
                }
            }, function() {
                request.post({
                    url: todoListUrl+"/loc",
                    json: {
                        title: "This is a TODO item",
                        done: false
                    }
                }, function() {

                    request.put({
                        url: todoListUrl+"/loc/0",
                        json: {
                            title: "This is a TODO item",
                            done: false,
                            comments: ["This is a comment"]
                        }
                    }, function() {

                        request.del({
                            url: todoListUrl+"/comment",
                            json: {
                                list: "loc",
                                id: 0,
                                comment: "This is a comment"
                            }
                        }, function() {

                            request.get(todoListUrl+"/loc", function(error, response, body) {
                                assert.deepEqual(JSON.parse(body), { todos: [{ title: "This is a TODO item", done: false, id: 0, comments: [] }], bck: "#191818" });
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});
