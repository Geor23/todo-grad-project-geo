var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
var fetch = require('whatwg-fetch');
const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

module.exports = function(port, middleware, callback) {
    
    var app = express();

    if (middleware) {
        app.use(middleware);
    }
    app.use(express.static("public"));
    app.use(bodyParser.json());

    var h = {};

    MongoClient.connect(process.env.MONGO, (err, db) => {  
        if (err) {
            return console.log(err);
        }

        // Create new list
        app.post("/api/todo", function(req, res) {
            db.collection('lists')
            .insertOne({
                name: req.body.loc,
                bck: "#191818",
                todos: []
            })
            .then(function() {
                res.sendStatus(201);
            })
        });

        // create todo
        app.post("/api/todo/:list", function(req, res) {
            db.collection('lists')
            .findOne({name: req.params.list})
            .then(function(result) {
                db.collection('todos')
                .insertOne({
                    title: req.body.title,
                    listId: result._id,
                    isComplete: false
                })
                .then(function(rs) {
                    res.set("Location", "/api/todo/" + rs.insertedId);
                    res.sendStatus(201);
                })
            });
        });

        // Read
        app.get("/api/todo/:list", function(req, res) {
            var list = req.params.list;
            db.collection('lists')
            .findOne({name: list})
            .then(function(ls) {
                db.collection('todos')
                .find({listId: ls._id})
                .toArray(function(err, rst) {
                    var response = {
                        todos : rst,
                        bck: ls.bck
                    };
                    res.json(response);
                });
            })
        });

        // Delete todo
        app.delete("/api/todo/:list/:id", function(req, res) {
            db.collection('todos')
                .remove(
                    {_id : ObjectId(req.params.id)},
                    true
                )
                .then(function(rs) {
                    res.sendStatus(200);
                })
        });

        app.delete("/api/todo/comment", function(req, res) {
            db.collection('todos')
                .findOne(
                    {_id : ObjectId(req.body.id)}
                )
                .then(function(resp) {
                    newComments = resp.comments.filter(function(comm){
                        return comm !== req.body.comment;
                    });
                    db.collection('todos')
                        .updateOne(
                            {_id : ObjectId(req.body.id)},
                            { $set: {comments : newComments} }
                        )
                        .then(function(rs) {
                            res.sendStatus(200);
                        })
                })
        });

        //Set background
        app.put("/api/todo/bck", function(req, res) {
            var list = req.body.list;
            db.collection('lists')
                .updateOne(
                    {name : list},
                    { $set: {bck : req.body.bck} }
                )
                .then(function(rs) {
                    res.sendStatus(200);
                })
        });

        //Update
        app.put("/api/todo/:list/:id", function(req, res) {
            var list = req.params.list;
            var id = req.params.id;
            db.collection('todos')
                .updateOne(
                    {"_id" : ObjectId(id)},
                    { $set: {title : req.body.title, isComplete : req.body.isComplete, comments : req.body.comments} }
                )
                .then(function(rs) {
                    res.sendStatus(200);
                })
        });

    });

    var server = app.listen(port, callback);

    // We manually manage the connections to ensure that they're closed when calling close().
    var connections = [];
    server.on("connection", function(connection) {
        connections.push(connection);
    });

    return {
        close: function(callback) {
            connections.forEach(function(connection) {
                connection.destroy();
            });
            server.close(callback);
        }
    };
};
