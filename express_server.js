// REQUIREMENTS
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

//HELPER FUNCTIONS

// function that generates a string of 6 random alphanumeric characters
const generateRandomString = function(stringLength = 6) {
  let result = '';
  const charsInAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVQXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < stringLength; i++) {
    result += charsInAlphabet.charAt(Math.floor(Math.random() * charsInAlphabet.length));
  }
  return result;
};

// function that is passed the user email and returns that user object if email is in users object
const getUserByEmail = function(email) {
  for (let user in users) {
    if (email === users[user]["email"]) 
    {
      return users[user]["id"];
    }
  }
  return null;
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
    id: "user1",
    email: "animals123@example.com",
    password: "animals",
  },
  user2: {
    id: "user2",
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
  const emailForNewUser = req.body.email;
  const passwordNewForUser = req.body.password;
  
  // if user attempts to register with an existing email/password respond with error
  for (let user in users) {
    if (users[user].email === emailForNewUser && users[user].password === passwordNewForUser) 
    {
     return res.status(400).send('Sorry, Invalid');
    }
    if (emailForNewUser === "" || passwordNewForUser === "") 
    {
      return res.status(400).send('Invalid Input');
    }
  };

  const idForNewUser = generateRandomString();
  users[idForNewUser] = { id: idForNewUser, email: emailForNewUser, password: passwordNewForUser  };
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

app.get('/login', (req, res) => {
  res.render('urls_login');
});

// set up handler on root path '/'
app.get('/', (req, res) => {
  res.send('Hello!');
});

// route handler for object with shortened urls
app.get('/urls', (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
   };
  res.render('urls_index', templateVars);
});

// present the form to the user and username when user logs in
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render('urls_new', templateVars);
});

// url individual detail page
app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  const templateVars = { 
    id: urlId,
    longURL: urlDatabase[urlId],
    user: users[req.cookies["user_id"]]
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
  const userEmail = req.body.email;
  const userPassword = req.body.password

  // verify if the user is an existing user by checking entered email and password
  for (let user in users) {
    if (userEmail !== users[user].email) 
    {
     return res.status(403).send('Please try again');
    }
    if (userEmail === users[user].email && userPassword !== users[user].password) 
    {
      return res.status(403).send('Invalid Password');
    }
    const user_id = getUserByEmail(userEmail);
    res.cookie('user_id', user_id);
    return res.redirect('/urls');
  };
});

// clear cookies and redirect back to home page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


// LISTENER FOR INCOMING REQUESTS
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

