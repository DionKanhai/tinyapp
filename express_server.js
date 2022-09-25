// REQUIREMENTS
const express = require('express');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail } = require('./helpers');
const app = express();
const PORT = 8080;


// SETTING MIDDLEWARES

// set ejs as the view engine
app.set('view engine', 'ejs');
// convert the request body from a buffer into a object we can read
app.use(express.urlencoded({ extended: true }));
//this is a middleware for cookies
app.use(cookieParser())
// set up session cookies
app.use(cookieSession({
  name: 'session',
  keys: ["12345678910abcdedfg"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


//HELPER FUNCTIONS


// function to get the cookie
const getCookie = function(cookieName, req) {
  return req.session[cookieName];
}
//function to set a cookie
const setCookie = function(cookieName, req, cookieValue) {
  req.session[cookieName] = cookieValue;
}

// function that shows users who are logged in their websites only 
const urlsForUser = function (id) {
  let userUrls = [];

  if (id) {
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === id) {
        userUrls.push(shortURL);
      };
    };
  };
  return userUrls;
};


// DATABASES

// store user preferences
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  T4BoG3: {
    longURL: "https://www.theweathernetwork.com",
    userID: "user1",
  },
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


// ROUTES/ENDPOINTS   //URLS CRUD API

// generate a random short url and redirect to it (create)
app.post('/urls', (req, res) => {
  const newLongUrl = req.body.longURL
  const newUserId = getCookie("user_id", req)
  
  const templateVars = {
    user: users[newUserId]
  };
  // if user does not exist
  if (!newUserId) {
    res.render('urls_notAllowedIfNotSignedIn', templateVars)
  }
  else {
    // generate random shortUrl
    const shortUrl = generateRandomString()
    urlDatabase[shortUrl] = { longURL: newLongUrl, userID: newUserId }
    urlDatabase[shortUrl].longURL = req.body.longURL
    res.redirect(`/urls/${shortUrl}`);
  };
});

// set up handler for urlDatabase object (read all)
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//use the shortURL to redirect to the longURL (read one)
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  
  const templateVars = {
    id: req.params.id,
    user: users[getCookie("user_id", req)]
  };

  if (!longURL) {
    res.render('urls_shortUrlNotFound', templateVars);
  }
    res.redirect(longURL);
});

// post rerouting edit button (update)
app.post('/urls/:id', (req, res) => {
  const id = req.params.id
  urlDatabase[id].longURL = req.body.longURL
  res.redirect('/urls');
});

// post route for updating registration form from user input (update)
app.post('/register', (req, res) => {
  const emailForNewUser = req.body.email;
  const passwordNewForUser = req.body.password;
  const hashPassword = bcrypt.hashSync(passwordNewForUser, 10);

  // if user attempts to register with an existing email/password respond with error
  for (let user in users) {
    if (users[user].email === emailForNewUser && users[user].password === hashPassword) {
      return res.status(400).send('Sorry, Invalid');
    }
    if (emailForNewUser === "" || passwordNewForUser === "") {
      return res.status(400).send('Invalid Input');
    }
  };

  // create id for user and then append user info to users object
  const idForNewUser = generateRandomString();
  users[idForNewUser] = { id: idForNewUser, email: emailForNewUser, password: hashPassword };
  setCookie("user_id", req, idForNewUser);
  res.redirect('/urls');
});


// post route for deleting short urls (delete)
app.post('/urls/:id/delete', (req, res) => {
  const shortUrlID = req.params.id

  if (!req.session.user_id) {
    return res.status(400).send("Sorry, please log in to use this feature");
  };
  const id = req.session.user_id;
  //pass the id of the current user logged in 
  const urls = urlsForUser(id)
  
  // urls is the array with the shortURLs pushed from the function urlsForUser
  for (const shortURL of urls) {
    // if shortURL in the array matches the shortURL entered by the current user 
    if (shortURL == shortUrlID) {
      delete urlDatabase[shortUrlID];
      return res.redirect('/urls');
    }
  };
  return res.status(400).send("Sorry, you do not own any URL")
});


// INDEX / RENDERING ROUTES (views)

// provide log in page and if user logs in redirect to url page
app.get('/login', (req, res) => {

  if (req.session.user_id) {
    return res.redirect('/urls');
  }
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
    user: users[req.session.user_id]
  };

  if (!users[req.session.user_id]) {
    res.render('urls_notAllowedIfNotSignedIn', templateVars)
  }
  else {
    res.render('urls_index', templateVars);
  }
});

// present the form to the user and userID when user logs in
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

// url individual detail page
app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  // stop non-users from using short urls for access
  if (!req.session.user_id) {
    return res.status(400).send("Sorry, please log in to use this feature");
  };

  const id = req.session.user_id;

  const urls = urlsForUser(id)
  for (const shortURL of urls) {
    if (shortURL == urlId) {
      const templateVars = {
        id: urlId,
        longURL: urlDatabase[shortURL].longURL,
        user: users[req.session.user_id]
      };
      return res.render('urls_show', templateVars);
    }
  };

  return res.status(400).send("Sorry, you do not own any URL")
});

// render the user registration page and if user logs in redirect to url page
app.get('/register', (req, res) => {
  if (req.session.user_id)
  {
    return res.redirect('/urls');
  }

  res.render('urls_registration');
});


// AUTHENTICATION API ROUTES

// post route for setting cookie of userID in and verification on server for client
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  const comparePassword = bcrypt.compareSync(userPassword, hashedPassword);
  const user = getUserByEmail(userEmail, users);
  
  // if user fails to enter password or em
  if (!userEmail || !userPassword)
  {
    return res.status(400).send('Fields cannot be empty');
  };
  // verify if the user is an existing user by checking entered email and password
  if (!user)
  {
    return res.status(403).send('Please register for an account to login');
  }
  if (userEmail === user.email && userPassword !== user.password)
  {
    return res.status(403).send('Email or Password incorrect');
  }

  setCookie("user_id", req, user.id);

  //check if hashed password matches on sign in and if true log in to home page
  if (comparePassword)
  {
  return res.redirect('/urls')
  };
});

// clear cookies and redirect back to home page
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


// LISTENER FOR INCOMING REQUESTS
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
