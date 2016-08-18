var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on delete todo item", function() {
        testing.it("deletes the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
                helpers.deleteTodo("New todo item");
                helpers.getTodoList().then(function(elements) {
                    assert.equal(elements.length, 0);
                });
            });
        });
    });
    testing.describe("on update todo item", function() {
        testing.it("changes the update button into a done button", function() {
            helpers.navigateToSite();
            helpers.addTodo("N");
            helpers.checkUpdateButton().then(function(res) {
                assert.equal(res, true);
            });
            
        });
        testing.it("changes the done button into an update button after update", function() {
            helpers.navigateToSite();
            helpers.addTodo("N");
            helpers.checkDoneUpdateButton().then(function(res) {
                assert.equal(res, true);
            });
        });
        testing.it("updates the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("N");
            var text = helpers.updateTodo();
            text.then(function(text) {
                assert.equal(text, "Nu");
            });
        });
    });
});

