const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

console.log("Users:", users);

regd_users.get("/users", (req, res) => {
  // If there are no users, return a message
  if (users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }
  
  // Return all users
  return res.status(200).json({ users: users });
});

const isValid = (username)=>{ //returns boolean
 return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    
  const { username, password } = req.body;
  console.log("Users:", users);
  // Check
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  // Validate
  if (authenticatedUser(username, password)) {
    // Create jwt token
    const accessToken = jwt.sign(
      { username },
      'sampleSecretKeyForTest123',
      { expiresIn: '1h' }
    );
    // Save
    req.session.authorization = {
      accessToken,
      username
    };
    return res.status(200).json({ message: "Login successful", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
  
    const username = req.session?.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }
  
    let bookKey = null;
    for (let key in books) {
      if (books[key].isbn === isbn) {
        bookKey = key;
        break;
      }
    }
  
    if (!bookKey) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    books[bookKey].reviews[username] = review;
  
    return res.status(200).json({ message: "Review added/updated", reviews: books[bookKey].reviews });
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session?.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
    
    let bookKey = null;
    for (let key in books) {
      if (books[key].isbn === isbn) {
        bookKey = key;
        break;
      }
    }
  
    if (!bookKey) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    const reviews = books[bookKey].reviews;
  
    if (!reviews[username]) {
      return res.status(404).json({ message: "Review not found for this user" });
    }
  
    delete reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully" });
  });
  


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
