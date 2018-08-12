const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

const usersRoute = require('./routes/users');

const app = express();
const PORT = 8080;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse', 'devhub', 'sansan', 'nick', 'hoang'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");
app.use('/', usersRoute);
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Tiny App running on port ${PORT}!`);
});

