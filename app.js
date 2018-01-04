var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/pantip_data");

// SCHEMA SETUP
var pantipSchema = new mongoose.Schema({
  topic: String,
  title: String,
  url: String,
  keyword: String,
  sentiment: Number
});
pantipSchema.plugin(mongoosePaginate);

var Model = mongoose.model('Pantip', pantipSchema, 'ratchada_room');

// var pantipPosts = [
//   { id: 1, title: "สวัสดี นี้คือหัวข้อ1", post: "นี้คือโพสต์1", is_problem: "", keywords: [], sentiment: "", },
//   { id: 2, title: "สวัสดี นี้คือหัวข้อ2", post: "นี้คือโพสต์2", is_problem: "", keywords: [], sentiment: "", }
// ];

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/posts/page/:pageId", function (req, res) {
  var limitPerPage = 100;
  Model.paginate({}, { page: req.params.pageId, limit: limitPerPage }, function (err, results) {
    // console.log(results.total);
    res.render("posts", { pantipPosts: results.docs, limitPerPage: limitPerPage, currentPage: results.page, totalPage: Math.ceil(results.total / limitPerPage) });
  });
});

app.get("/posts/page/:pageId/:id", function (req, res) {
  var id = req.params.id;
  var pageId = req.params.pageId;
  // var data = {
  //   "title": "title",
  //   "topic": "topic"
  // };
  Model.findById(id, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log(id);
      console.log(result);
      res.render("shows", { id: id, pageId: pageId, pantipPost: result });
    }
  });
  // res.render("shows", { id: id, pageId: pageId, data: data });
});

app.post("/posts/page/:pageId/:id", function (req, res) {
  var id = req.params.id;
  var pageId = req.params.pageId;
  var name = req.body.name;
  var another = req.body.another;
  var problemFlag = req.body.problemFlag;
  console.log(req.params.id);
  console.log(problemFlag);
  console.log(name);
  console.log(another);
  res.render("submit", { id: id, pageId: pageId })
  // //redirect back to list of all posts
  // res.redirect("/posts/page/" + pageId);
});


app.listen(3000, function () {
  console.log("Server running on port 3000");
});