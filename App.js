const express = require("express");
const multer = require("multer");
const flash = require("connect-flash");
const session = require("express-session");
const parser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const Gallery = require("./models/gallery");
const app = express();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    // cb(null, file.fieldname + "-" + Date.now());
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
app.use(
  "/images",
  express.static(__dirname + "/node_modules/lightbox2/dist/images")
);
app.use("/images", express.static(__dirname + "/uploads"));
app.use("/js", express.static(__dirname + "/node_modules/lightbox2/dist/js"));
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js"));
app.use("/js", express.static(__dirname + "/node_modules/jquery/dist"));

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));

mongoose.connect(
  process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    console.log(
      "Mongoose connetcion - Ready state is:",
      mongoose.connection.readyState
    );
  }
);

app.post("/upload", upload.single("photo"), (req, res, next) => {
  var obj = {
    url: "images/" + req.file.originalname,
    img: {
      data: fs.readFileSync(
        path.join(__dirname + "/uploads/" + req.file.filename)
      ),
      contentType: "image/png",
    },
  };
  Gallery.create(obj, (err, item) => {
    if (err) {
      res.flash("errors", `${err}`);
      console.log(err);
    } else {
      req.flash("message", `${req.file.originalname}`+'yükleme islemi basarılı');
      res.redirect("/");
    }
  });
});

app.get("/delete/:id", async (req, res) => {
  Gallery.deleteOne({ _id: req.params.id }, (err, post) => {
    if (err) {
      req.flash("errors", `${err}`);
    } else {
      req.flash("message",'silme islemi basarılı');
      res.redirect("/");
    }
  });
});

app.get("/", (req, res) => {
  Gallery.find({}, (err, found) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occurred", err);
    } else {
      res.render("index", { found: found });
    }
  });
});

app.listen(process.env.PORT, function (err) {
  if (err) {
    console.log(err);
  }
  console.log("App listen port 5000");
});
