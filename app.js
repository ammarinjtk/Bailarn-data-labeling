var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/pantip_data");

// SCHEMA SETUP
var pantipSchema = new mongoose.Schema({
  topic: String,
  title: String,
  url: String,
  problem: Boolean,
  keyword: Array,
  sentiment: Number,
  updated_date: Date,
});
pantipSchema.plugin(mongoosePaginate);

var Model = mongoose.model('Pantip', pantipSchema, 'ratchada_room');

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
      res.render("shows", { id: id, pageId: pageId, pantipPost: result });
    }
  });
  // res.render("shows", { id: id, pageId: pageId, data: data });
});

app.post("/posts/page/:pageId/:id", function (req, res) {
  var id = req.params.id;
  var pageId = req.params.pageId;

  var updated = {
    problem: (req.body.problemFlag == 'yes' ? true : false),
    sentiment: req.body.sentiment,
    keyword: req.body.keywords.split(","),
    updated_date: new Date(),
  }
  Model.findByIdAndUpdate(id, { $set: updated }, { new: true }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("id: " + id + " Update successfully");
      // console.log(result);
    }
  });
  res.render("submit", { id: id, pageId: pageId })

});


app.listen(3000, function () {
  console.log("Server running on port 3000");
});