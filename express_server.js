var express = require("express");
var cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

var app = express();
var PORT = 8080;

var urlDatabase = {
  "nick11": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "2dfwM1": "https://www.google.ca"
  },
  "hoahoang11": {
    "9sm5xK": "http://www.google.com"
  }
};
const users = {
  "nick11": {
    id: "nick11",
    email: "nick@san.com",
    password: "$2b$10$YtNRxcVWb9zAmVMgpbAxeu101eIEKcCV5.1sFeWnwsnyspM8d0XOy"
  },
 "hoahoang11": {
    id: "hoahoang11",
    email: "hoa@san.com",
    password: "$2b$10$PW5G3slJrGoKLr6AQ3YYQOAFI.Ek/CbcW3TAMH1mW7453iby41ShK"
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse', 'devhub', 'sansan', 'nick', 'hoang'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

function generateRandomString(num) {
  var possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var randomString = "";
  for (var i = 0; i < Number(num); i++) {
    randomString += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
  }
  return randomString;
}

//Return user_id if property is matched
function findUser(obj, userProperty, checkProperty) {
  const userArr = [];
  for (var user in obj) {
    userArr.push(user);
  }
  const result = userArr.find(u => obj[u][userProperty] === checkProperty);
  return result;
}

function findUserEmail(db, user_id) {
  for (var user in db){
    if (db[user].id === user_id){
      return db[user].email;
    }
  }
  return "";
}

function findURL (id) {
  var outputURL = {};
  for (var i in urlDatabase){
    if (i === id) {
      outputURL = urlDatabase[i];
    }
  }
  return outputURL;
}

function findLongUrlForUser(short_url) {
  for (var i in urlDatabase) {
    for (var j in urlDatabase[i]) {
      if (short_url===j) {
        return urlDatabase[i][j];
      }
    }
  }
  return "";
}

function findUrlsForUser (user_id) {
  return urlDatabase[user_id];
}

function badLogin (req, res, info) {
  req.session.errMessage = info;
  res.redirect(`/login`);
}

function badRegister(req, res, info) {
  req.session.errMessage = info;
  res.redirect(`/register`);
}

app.get("/", (req, res) => {
  const user = findUser(users,"id", req.session.user_id);
  const loggedIn = (user !== undefined);
  if (loggedIn) {
    res.redirect(`/urls`);
  }
  res.redirect(`/login`);
});

app.get("/urls", (req, res) => {
  const user = findUser(users,"id", req.session.user_id);
  const userURL = findURL(user);
  const userEmail = findUserEmail(users, user);
  const loggedIn = (user !== undefined);

  if (loggedIn) {
    res.render("urls_index", { loggedIn, userEmail, userURL });
  } else {
    res.render("urls_index", { loggedIn });
  }
});

app.get("/urls/new", (req, res) => {
  const user = findUser(users,"id", req.session.user_id);
  const loggedIn = (user !== undefined);

  res.render("urls_new", { loggedIn });
});

app.get("/urls/:id", (req, res) => {
  const user = findUser(users,"id", req.session.user_id) ;
  const userURL = findURL(user);
  let loggedIn = (user !== undefined);
  let urlNotFound = false;
  let urlNotOwned = false;

  for (var i in userURL) {
    if (i === req.params.id) {
      var shortURL = i;
      var longURL = userURL[i];
    }
  }

  if (!findLongUrlForUser(req.params.id)){
    urlNotFound = true;
  } else if (findLongUrlForUser(req.params.id) !== longURL){
    urlNotOwned = true;
  }

  if (urlNotFound) {
    res.send('this url does not exist');
  } else if (loggedIn) {
    if (urlNotOwned) {
      res.send('this url does not belong to you!');
    } else {
      res.render("urls_show", { loggedIn, shortURL, longURL });
    }
  } else if (!loggedIn) {
    res.render("urls_show", { loggedIn });
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  const message = req.session.errMessage || "";
  res.render("urls_register", { message });
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = findLongUrlForUser(req.params.shortURL);
  res.redirect(`${longURL}`);
});

app.get("/login", (req, res, next) => {
  let message = req.session.errMessage || "";
  res.render(`urls_login`, { message });
});

app.post("/urls", (req, res) => {
  if (req.session.user_id){
    const newID = generateRandomString(6);
    const list = findURL(req.session.user_id);
    list[newID] = req.body.longURL;
    urlDatabase[req.session.user_id] = list;
    res.redirect(`urls/${newID}`);
  } else {
    res.redirect(`/login`);
  }
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.session.user_id][req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete findURL(req.session.user_id)[req.params.id];
  res.redirect(`/urls`);
});


app.post("/register", (req, res) => {
  const { email, password } = req.body;
  var message = "";

  if (findUser(users, "email", email)){
    message = "Email already used";
  } else if (email === "") {
    message = "input email";
  } else if (password === "") {
    message = "input password";
  } else {
    var userID = generateRandomString(6);
    var userObj = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, 10)
    };
    users[userID] = userObj;
    message = "";
  }
  if (message === "") {
    res.redirect(`/urls`);
  } else {
    badRegister(req, res, message);
  }
})

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const curUser = findUser(users, "email", email);

  if (curUser){
    var curPassword = users[curUser]['password'];
    if (bcrypt.compareSync(password, curPassword)) {
      req.session.user_id = findUser(users, "email",email);
      res.redirect(`/urls`);
    } else {
      badLogin(req, res, "You have provided invalid credentials.");
    }
  } else {
    badLogin(req, res, "You have provided invalid credentials.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`Tiny App running on port ${PORT}!`);
});

