var express = require("express");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var chrome = require("selenium-webdriver/chrome");
var pathc = require("chromedriver").path;

var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;
var service;

module.exports.setupDriver = function() {
    service = new chrome.ServiceBuilder(pathc).build();
    chrome.setDefaultService(service);
    driver = new webdriver.Builder().forBrowser("chrome").build();
};

module.exports.setupServer = function(done) {
    router = express.Router();
    if (gatheringCoverage) {
        router.get("/main.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", "main.js");
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/main.js", "utf8"), absPath));
        });
    }
    server = createServer(testPort, router, done);
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.createList = function() {
    var item = driver.findElement(webdriver.By.id("new-list")).click();
    driver.findElement(webdriver.By.id("new-list")).sendKeys("u");
    driver.findElement(webdriver.By.id("submit-list")).click();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    driver.get(baseUrl);
    var item = driver.findElement(webdriver.By.id("new-list"));
    driver.wait(webdriver.until.elementIsVisible(item), 5000);
    item.click();
    driver.findElement(webdriver.By.id("new-list")).sendKeys("u");
    driver.findElement(webdriver.By.id("submit-list")).click();
};

module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function() {
    return driver.findElement(webdriver.By.id("new-todo")).getAttribute("value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getTodoList = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    return driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.addTodo = function(text) {
    driver.findElement(webdriver.By.id("new-todo")).sendKeys(text);
    driver.findElement(webdriver.By.id("submit-todo")).click();
};

module.exports.deleteTodo = function(text) {
    driver.findElement(webdriver.By.id("deleteButton")).click();
};

module.exports.checkUpdateButton = function() {

    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    driver.findElement(webdriver.By.id("updateButton")).click();
    return driver.findElement(webdriver.By.id("doneButton")).isDisplayed();
};
module.exports.checkDoneUpdateButton = function() {

    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    driver.findElement(webdriver.By.id("updateButton")).click();
    var todoListPl = driver.findElement(webdriver.By.id("doneButton"));
    driver.wait(webdriver.until.elementIsVisible(todoListPl), 5000);
    driver.findElement(webdriver.By.id("doneButton")).click();
    return driver.findElement(webdriver.By.id("updateButton")).isDisplayed();
};


module.exports.updateTodo = function() {

    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    driver.findElement(webdriver.By.id("updateButton")).click();
    var todoListPl = driver.findElement(webdriver.By.id("doneButton"));
    driver.wait(webdriver.until.elementIsVisible(todoListPl), 5000);
    var item = driver.findElement(webdriver.By.id("item")).click();
    driver.findElement(webdriver.By.id("item")).sendKeys("u");
    driver.wait(webdriver.until.elementIsVisible(todoListPl), 5000);
    driver.findElement(webdriver.By.id("doneButton")).click();
    return driver.findElement(webdriver.By.id("item")).getText();
};

module.exports.markTodoAsComplete = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    driver.findElement(webdriver.By.id("tick")).click();
    todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    return driver.findElement(webdriver.By.id("tick")).getAttribute("checked");
};

module.exports.markTodoAsIncomplete = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    driver.findElement(webdriver.By.id("tick")).click();
    todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    driver.findElement(webdriver.By.id("tick")).click();
    todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list"));
    driver.wait(webdriver.until.elementIsVisible(todoListPlaceholder), 5000);
    return driver.findElement(webdriver.By.id("tick")).getAttribute("checked");
};

module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "delete") {
        router.delete(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "put") {
        router.put(route, function(req, res) {
            res.sendStatus(500);
        });
    }
};
