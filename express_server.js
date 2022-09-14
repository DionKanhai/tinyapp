// Import express library 
const express = require('express');
const app = express();
const PORT = 8080;

// Setup url shortner keys
const urlDatabase = {
  'b2xVn2': 'http:\\lighthouselabs.ca',
  '9sm5xK': 'http:\\google.com'
};

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