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

// route handler for object with shortened urls
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
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