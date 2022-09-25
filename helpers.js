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
  return null;
};

module.exports = { generateRandomString, getUserByEmail }
