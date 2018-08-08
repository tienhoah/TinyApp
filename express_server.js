var express = require("express");
var cookieParser = require("cookie-parser");

var app = express();

var PORT = 8080;
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString(num) {
  var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var randomString = "";
  for (var i = 0; i < Number(num); i++){
    randomString += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
  }
  return randomString;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = { greetings: 'Helo World!' };
  res.render("hello_world", templateVars);
});

// app.get("/login", (req, res) => {
//   res.render("./partial/_header");
// });

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  console.log("longurl", longURL);
  res.redirect(`https://${longURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.post("/urls", (req, res) => {
  var newID = generateRandomString(6);
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/u/${newID}`);
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.cookies);
  res.redirect(`/urls`);
});
