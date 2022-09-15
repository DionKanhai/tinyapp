// Import express library 
const express = require('express');
const app = express();
const PORT = 8080;

// set ejs as the view engine
app.set('view engine', 'ejs');

// Setup url shortner keys
const urlDatabase = {
  'b2xVn2': "http://lighthouselabs.ca",
  '9sm5xK': "http://google.com"
};

// convert the request body from a buffer into a string we can read
app.use(express.urlencoded({ extended: true }));

// define the route that will match POST request and handle it
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});

// route handler for object with shortened urls
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// present the form to the user
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// second route
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: "http://lighthouselabs.ca"};
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

// test
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// // function that generates a string of 6 random alphanumeric characters
// function generateRandomString(stringLength) {
//   let result = '';
//   let charsInAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVQXYZabcdefghijklmnopqrstuvwxyz';
//   for (let i = 0; i < stringLength; i++) {
//     result += charsInAlphabet.charAt(Math.floor(Math.random() * charsInAlphabet.length));
//   }
//   return result;
// };