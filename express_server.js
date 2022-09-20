// Import express library 
const express = require('express');
const app = express();
const PORT = 8080;

const cookieParser = require('cookie-parser')

// set ejs as the view engine
app.set('view engine', 'ejs');
// convert the request body from a buffer into a string we can read
app.use(express.urlencoded({ extended: true }));

//this is a middleware for cookies
app.use(cookieParser())

// function that generates a string of 6 random alphanumeric characters
const generateRandomString = function(stringLength = 6) {
  let result = '';
  const charsInAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVQXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < stringLength; i++) {
    result += charsInAlphabet.charAt(Math.floor(Math.random() * charsInAlphabet.length));
  }
  return result;
};

// Setup url shortner keys
const urlDatabase = {
  'b2xVn2': "http://lighthouselabs.ca",
  '9sm5xK': "http://google.com"
};

// define the route that will match POST request and handle it
app.post('/urls', (req, res) => {
  const shortIdForLongUrl = generateRandomString()
  urlDatabase[shortIdForLongUrl] = req.body.longURL
  res.redirect(`/urls/${shortIdForLongUrl}`);
});

// post route for deleting short urls
app.post('/urls/:id/delete', (req, res) =>  {
  const shortURL = req.params.id 
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// post route for setting cookie of username in client
app.post('/urls/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// post rerouting edit button
app.post('/urls/:id', (req, res) =>  {
  res.redirect('/urls');
});

//use the shortURL to redirect to the longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// route handler for object with shortened urls
app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
   };
  res.render('urls_index', templateVars);
});

// present the form to the user and username when user logs in
app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies["username"] 
  }
  res.render('urls_new', templateVars);
});

// client input 
app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  const templateVars = { 
    id: urlId, 
    longURL: urlDatabase[urlId],
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
});

// set up handler on root path '/'
app.get('/', (req, res) => {
  res.send('Hello!');
});

// set up handler for urlDatabase object
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
