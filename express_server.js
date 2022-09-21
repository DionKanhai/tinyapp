// REQUIREMENTS
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;


// function that generates a string of 6 random alphanumeric characters
const generateRandomString = function(stringLength = 6) {
  let result = '';
  const charsInAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVQXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < stringLength; i++) {
    result += charsInAlphabet.charAt(Math.floor(Math.random() * charsInAlphabet.length));
  }
  return result;
};


// DATABASES

// Setup url shortner keys
const urlDatabase = {
  'b2xVn2': "http://lighthouselabs.ca",
  '9sm5xK': "http://google.com"
};

//store user login registration information
const users = {
  user1: {
    id: "firstUser",
    email: "animals123@example.com",
    password: "animals",
  },
  user2: {
    id: "secondUser",
    email: "sports@example.com",
    password: "basketball",
  },
};


// SETTING MIDDLEWARES

// set ejs as the view engine
app.set('view engine', 'ejs');
// convert the request body from a buffer into a object we can read
app.use(express.urlencoded({ extended: true }));
//this is a middleware for cookies
app.use(cookieParser())


// ROUTES/ENDPOINTS
//URLS CRUD API 
// generate a random short url and redirect to it (create)
app.post('/urls', (req, res) => {
  const shortIdForLongUrl = generateRandomString()
  urlDatabase[shortIdForLongUrl] = req.body.longURL
  res.redirect(`/urls/${shortIdForLongUrl}`);
});

// set up handler for urlDatabase object (read all)
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//use the shortURL to redirect to the longURL (read one)
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// post rerouting edit button (update)
app.post('/urls/:id', (req, res) =>  {
  const shortIdForLongUrl = req.params.id
  urlDatabase[shortIdForLongUrl] = req.body.longURL
  res.redirect('/urls');
});

// post route for updating registration form from user input (update)
app.post('/register', (req, res) => {
  const newUser = {};
  const idForNewUser = generateRandomString();
  const emailForNewUser = req.body.email;
  const passwordNewForUser = req.body.password;
  users[newUser] = { idForNewUser, emailForNewUser, passwordNewForUser }; 
  console.log(users);
  res.cookie('user_id', idForNewUser);
  res.redirect('/urls');
});

// post route for deleting short urls (delete)
app.post('/urls/:id/delete', (req, res) =>  {
  const shortURL = req.params.id 
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


// INDEX / RENDERING ROUTES (views)

// set up handler on root path '/'
app.get('/', (req, res) => {
  res.send('Hello!');
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

// url individual detail page
app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  const templateVars = { 
    id: urlId, 
    longURL: urlDatabase[urlId],
    username: req.cookies['username']
  };
  res.render('urls_show', templateVars);
});

// render the user registration page
app.get('/register', (req, res) => {
  res.render('urls_registration');
});


// AUTHENTICATION API ROUTES

// post route for setting cookie of username in client
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// clear cookies and redirect back to home page
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


// LISTENER FOR INCOMING REQUESTS
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});