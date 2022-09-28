// HELPER FUNCTIONS

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
const getUserByEmail = function (email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return undefined;
};

// function to get the cookie
const getCookie = function(cookieName, req) {
  return req.session[cookieName];
};

//function to set a cookie
const setCookie = function(cookieName, req, cookieValue) {
  req.session[cookieName] = cookieValue;
};

// function that shows users who are logged in their websites only based on a passed in userid and a database
const urlsForUser = function (userId, urlDatabase) {
  const userUrls = {};

  if (userId) {
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === userId) {
        // construct an object with only the properties that match the shortUrl(key)
        userUrls[shortURL] = urlDatabase[shortURL]
      };
    };
  };
  return userUrls;
};

module.exports = { 
  generateRandomString, 
  getUserByEmail, 
  getCookie,  
  setCookie, 
  urlsForUser
};
