// function that generates a string of 6 random alphanumeric characters
const generateRandomString = function (stringLength = 6) {
  console.log("1234567")
  let result = '';
  const charsInAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVQXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < stringLength; i++) {
    result += charsInAlphabet.charAt(Math.floor(Math.random() * charsInAlphabet.length));
  }
  return result;
};


// // function that shows users who are logged in their websites only 
// const urlsForUser = function (id) {
//   let userUrls = [];

//   if (id) {
//     for (const shortURL in urlDatabase) {
//       if (urlDatabase[shortURL].userID === id) {
//         userUrls.push(shortURL);
//       };
//     };
//   };
//   return userUrls;
// };

module.exports = generateRandomString
