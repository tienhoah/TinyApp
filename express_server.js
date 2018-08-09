var express = require("express");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

var app = express();
var PORT = 8080;
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


function generateRandomString(num) {
  var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var randomString = "";
  for (var i = 0; i < Number(num); i++){
    randomString += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
  }
  return randomString;
}

app.get("/", (req, res) => {
  res.end("Successful Log In!!!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    person: users,
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    person: users,
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
app.get("/register", (req, res) => {
  res.render("urls_register");
});
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(`https://${longURL}`);
});

app.get("/login", (req, res) => {
  res.render(`urls_login`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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
  var flag = 0;
  for (var u in users){
    if (users[u].email === req.body.email){
      flag += 1;
      console.log("found email");
      if (users[u].password !== req.body.password){
        console.log("wrong Password");
        res.status(403).send(`Wrong Password!!! <p>Back to <a href="/login">Log In</a></p>`);
      } else {
        res.cookie('user_id', users[u].id);
        res.redirect(`/`);
      }
    }
  }
  if (flag === 0){
    res.status(403).send(`User not found!!! <p>Back to <a href="/login">Log In</a></p>`);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies);
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  if (req.body.email === ""){
    res.status(400).send("please enter your email!!!");
  } else if (req.body.password === "") {
    res.status(400).send("please enter your password!!!");
  } else {
    var userID = generateRandomString(6);
    var userObj = {};
    userObj.id = userID;
    userObj.email = req.body.email;
    userObj.password =  req.body.password;
    users[userID] = userObj;

    res.cookie('user_id', userObj.id);
    res.redirect(`/urls`);
  }
})
