const express = require("express");
const multer = require("multer");
const flash = require("connect-flash");
const session = require("express-session");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const fs = require("fs");

const dbUrl = "mongodb://localhost:27017";
const app = express();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});
var upload = multer({ storage: storage });

app.use(
  session({
    secret: "secret mesage",
    saveUninitialized: true,
    resave: true,
  })
);
app.use(flash());
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(function (req, res, next) {
  res.locals.errors = req.flash("error");
  res.locals.message = req.flash("message");
  next();
});
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.use("/css", express.static(__dirname + "/node_modules/lightbox2/dist/css"));
app.use("/images", express.static(__dirname + "/node_modules/lightbox2/dist/images"));
app.use("/js", express.static(__dirname + "/node_modules/lightbox2/dist/js"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use("/js", express.static(__dirname + "/node_modules/jquery/dist"));

MongoClient.connect(dbUrl, (err, client) => {
  if (err) return console.log(err);
  db = client.db("admin");
  app.listen(3000, () => {
    console.log("Database listen port 3000");
  });
});

app.post("/uploadphoto", upload.single("photo"), (req, res, next) => {
  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString("base64");
  var finalImg = {
    contentType: req.file.mimetype,
    image: new Buffer(encode_image, "base64"),
  };
  db.collection("galery").insertOne(finalImg, (err, result) => {
    console.log(result);
    if (err) {
      req.flash("error", `${err}`);
      res.redirect("/");
    } else {
      req.flash("message", `${req.file.originalname}`);
      res.redirect("/");
    }
  });
});

app.get("/photos", (req, res) => {
  db.collection("galery")
    .find()
    .toArray((err, result) => {
      const imgArray = result.map((element) => element._id);
      console.log(imgArray);
      if (err) return console.log(err);
      res.send(imgArray);
    });
});
app.get("/photos/:id", (req, res) => {
  const id = req.params.id;
  db.collection("galery").findOne({ _id: ObjectId(id) }, (err, result) => {
    if (err) return console.log(err);
    res.contentType("image/jpeg");
    res.send(result.image.buffer);
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(5000, function (err) {
  if (err) {
    console.log(err);
  }
  console.log("App listen port 5000");
});
