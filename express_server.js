// REQUIREMENTS
const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;


//HELPER FUNCTIONS

// function that generates a string of 6 random alphanumeric characters
const generateRandomString = function (stringLength = 6) {
  let result = '';
  const charsInAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVQXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < stringLength; i++) {
    result += charsInAlphabet.charAt(Math.floor(Math.random() * charsInAlphabet.length));
  }
  return result;
};

// function that is passed the user email and returns that user object if email is in users object
const getUserByEmail = function (email) {
  for (let user in users) {
    if (email === users[user].email) {
      return users[user];
    }
  }
  return null;
};

// function that shows users who are logged in their websites only 
const urlsForUser = function (id) {
  let userUrls = [];

  if (id) {
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === id) {
        userUrls.push(shortURL);
      }
    }
  }
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
  i3BoG3: {
    longURL: "https://www.google.ca",
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


// SETTING MIDDLEWARES

// set ejs as the view engine
app.set('view engine', 'ejs');
// convert the request body from a buffer into a object we can read
app.use(express.urlencoded({ extended: true }));
//this is a middleware for cookies
app.use(cookieParser())


// ROUTES/ENDPOINTS   //URLS CRUD API

// generate a random short url and redirect to it (create)
app.post('/urls', (req, res) => {
  const newLongUrl = req.body.longURL
  const newUserId = req.cookies["user_id"]

  const templateVars = {
    user: users[req.cookies["user_id"]]
  };

  if (!req.cookies["user_id"]) {
    res.render('urls_notAllowedIfNotSignedIn', templateVars)
  }
  else {
    const id = generateRandomString()
    urlDatabase[id] = { longURL: newLongUrl, userID: newUserId }
    urlDatabase[id].longURL = req.body.longURL
    res.redirect(`/urls/${id}`);
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
    user: users[req.cookies["user_id"]]
  };

  if (!longURL) {
    res.render('urls_shortUrlNotFound', templateVars);
  }
  else {
    res.redirect(longURL);
  }
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

  // if user attempts to register with an existing email/password respond with error
  for (let user in users) {
    if (users[user].email === emailForNewUser && users[user].password === passwordNewForUser) {
      return res.status(400).send('Sorry, Invalid');
    }
    if (emailForNewUser === "" || passwordNewForUser === "") {
      return res.status(400).send('Invalid Input');
    }
  };
  const idForNewUser = generateRandomString();
  users[idForNewUser] = { id: idForNewUser, email: emailForNewUser, password: passwordNewForUser };
  res.cookie('user_id', idForNewUser);
  res.redirect('/urls');
});


// post route for deleting short urls (delete)
app.post('/urls/:id/delete', (req, res) => {
  const shortUrlID = req.params.id

  if (!req.cookies["user_id"]) {
    return res.status(400).send("Sorry, please log in to use this feature");
  };

  const id = req.cookies["user_id"];
  const urls = urlsForUser(id)

  for (const shortURL of urls) {
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
  if (req.cookies["user_id"]) {
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
    user: users[req.cookies["user_id"]]
  };

  if (!users[req.cookies["user_id"]]) {
    res.render('urls_notAllowedIfNotSignedIn', templateVars)
  }
  else {
    res.render('urls_index', templateVars);
  }
});

// present the form to the user and userID when user logs in
app.get('/urls/new', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  if (!req.cookies["user_id"]) {
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

// url individual detail page
app.get('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  console.log(req.params);
  // stop non-users from using short urls for access
  if (!req.cookies["user_id"]) {
    return res.status(400).send("Sorry, please log in to use this feature");
  };

  const id = req.cookies["user_id"];
  const urls = urlsForUser(id)

  for (const shortURL of urls) {
    if (shortURL == urlId) {
      const templateVars = {
        id: urlId,
        longURL: urlDatabase[shortURL].longURL,
        user: users[req.cookies["user_id"]]
      };
      return res.render('urls_show', templateVars);
    }
  };

  return res.status(400).send("Sorry, you do not own any URL")
});

// render the user registration page and if user logs in redirect to url page
app.get('/register', (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect('/urls');
  }
  res.render('urls_registration');
});


// AUTHENTICATION API ROUTES

// post route for setting cookie of userID in and verification on server for client
app.post('/login', (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password
  const user = getUserByEmail(userEmail);
  if (!userEmail || !userPassword) {
    return res.status(400).send('Fields cannot be empty')
  };
  // verify if the user is an existing user by checking entered email and password
  if (!user) {
    return res.status(403).send('Invalid Credentials');
  }
  if (userEmail === user.email && userPassword !== user.password) {
    return res.status(403).send('Invalid Entry');
  }
  res.cookie('user_id', user.id);
  return res.redirect('/urls');
});

// clear cookies and redirect back to home page
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


// LISTENER FOR INCOMING REQUESTS
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




/** Things to fix 
 * when you submit using the edit button, the old url saves as well
*/
