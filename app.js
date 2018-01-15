var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverrie = require("method-override");
var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');
var PythonShell = require('python-shell');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverrie("_method"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/pantip_data");

// SCHEMA SETUP
var pantipSchema = new mongoose.Schema({
  post_no: Number,
  topic: String,
  title: String,
  url: String,
  is_problem: Boolean,
  type: String,
  type_keywords: Array,
  company_name: Array,
  company_keywords: Array,
  sentiment: String,
  is_updated: Boolean,
  is_reported: Boolean
});
pantipSchema.plugin(mongoosePaginate);

var Model = mongoose.model('Pantip', pantipSchema, 'motor_tag_2');

// // PYTHON SCRIPT SETUP
// var options = {
//   pythonPath: '/Library/Frameworks/Python.framework/Versions/3.5/bin/python3.5',
// };

app.get("/", function (req, res) {
  // var pyshell = new PythonShell('script/tokenizer.py', options);
  // var out;
  // // sends a message to the Python script via stdin
  // pyshell.send('พฤติกรรมแบบนี้ เอาออกไปจากสังคมไทยได้ไหมครับ');

  // pyshell.on('message', function (message) {
  //   // received a message sent from the Python script (a simple "print" statement)
  //   console.log(typeof message);
  //   console.log(message)
  //   var array = message.split(',');
  //   console.log(typeof array);
  //   console.log(array)
  //   out = array.join("")
  //   res.render("index", { out: out });
  // });

  // // end the input stream and allow the process to exit
  // pyshell.end(function (err) {
  //   if (err) throw err;
  // });

  res.render("index");
});

app.get("/posts/:filter/page/:pageId", function (req, res) {

  var totalPosts = 7980;

  var limitPerPage = 100;
  find_dict = {
    "todo": { is_reported: false, is_updated: false },
    "done": { is_reported: false, is_updated: true },
    "report": { is_reported: true },
  };
  Model.paginate(find_dict[req.params.filter], { page: req.params.pageId, limit: limitPerPage }, function (err, results) {
    // console.log(results.total);
    res.render("posts", { pantipPosts: results.docs, limitPerPage: limitPerPage, currentPage: results.page, totalPage: Math.ceil(results.total / limitPerPage), postNum: results.total, totalNum: totalPosts, filter: req.params.filter });
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

      var topic = result.topic.replace(/\s\s+/g, ' ').trim();
      var topic_list = [];
      var i = 0;
      (topic.split(" ")).forEach(element => {
        i++;
        topic_list.push(" | <font color=#808080>[" + i + "]</font> " + element);
      });

      var title = result.title.replace(/\s\s+/g, ' ').trim();
      var title_list = [];
      var i = 0;
      (title.split(" ")).forEach(element => {
        i++;
        title_list.push(" | <font color=#808080>[T" + i + "]</font> " + element);
      });
      res.render("shows", { id: id, pageId: pageId, pantipPost: result, pantipTopic: topic_list.join(""), pantipTitle: title_list.join("") });
    }
  });
  // res.render("shows", { id: id, pageId: pageId, data: data });
});

app.post("/posts/page/:pageId/:id/report", function (req, res) {
  var id = req.params.id;
  var pageId = req.params.pageId;

  var reported = {
    is_updated: true,
    is_reported: true
  }

  Model.findByIdAndUpdate(id, { $set: reported }, { new: true }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("id: " + id + " Report successfully");
      // console.log(result);
    }
  });

  res.render("report", { id: id, pageId: pageId, reported: reported })

});

app.put("/posts/page/:pageId/:id", function (req, res) {
  var id = req.params.id;
  var pageId = req.params.pageId;

  var company_keyword_list = [];
  req.body.company_keyword.forEach(element => {
    company_keyword_list.push(element.split(','));
  });;

  var updated = {
    is_problem: (req.body.is_problem == 'Problem' ? true : false),
    type: (req.body.type == 'ปัญหาอื่น ๆ' ? req.body.other_type : req.body.type),
    type_keywords: req.body.type_keyword,
    company_name: req.body.company_name.split(','),
    company_keywords: company_keyword_list,
    sentiment: req.body.sentiment,
    is_updated: true,
    is_reported: false
  }

  Model.findByIdAndUpdate(id, { $set: updated }, { new: true }, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      console.log("id: " + id + " Update successfully");
      // console.log(result);
    }
  });

  res.render("submit", { id: id, pageId: pageId, updated: updated })

});


app.listen(3000, function () {
  console.log("Server running on port 3000");
});