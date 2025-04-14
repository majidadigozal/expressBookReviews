const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    // Check if exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

//Get all books
public_users.get('/all', async function (req, res) {
    try {
      const response = await axios.get('http://localhost:5000/');
      const formattedBooks = JSON.stringify({ books: response.data }, null, 2);
      return res.status(200).send(formattedBooks);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  });

//Get the book list available in the shop
public_users.get('/',function (req, res) {
    const formattedBooks = JSON.stringify({ books: books }, null, 2)
    return res.status(200).send(formattedBooks);
});

//Get books by isbn
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
  
    try {
      const response = await axios.get('http://localhost:5000/'); // External or mock API
      const booksData = response.data;
  
      // Loop through books to find the one with matching ISBN
      for (let key in booksData) {
        if (booksData[key].isbn === isbn) {
          return res.status(200).json(booksData[key]);
        }
      }
  
      return res.status(404).json({ message: "Book not found" });
  
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  });

// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//     const isbn = req.params.isbn;
//     const book = books[isbn];

//     for (let key in books) {
//         if (books[key].isbn === isbn) {
//           return res.status(200).json(books[key]);
//         }
//       }

//     return res.status(404).json({ message: "Book not found" });
      
//  });

//Get books by author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
  
    try {
      const response = await axios.get('http://localhost:5000/');
      const booksData = response.data.books;
  
      const matchingBooks = Object.values(booksData).filter(book => book.author === author);
  
      if (matchingBooks.length > 0) {
        const formattedOutput = JSON.stringify({ booksByAuthor: matchingBooks }, null, 2);
        return res.status(200).send(formattedOutput);
      } else {
        return res.status(404).json({ message: "No books found by this author" });
      }
  
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  });
  
// Get book details based on author || used Axios version
// public_users.get('/author/:author',function (req, res) {
//     const author = req.params.author;
//     const matchingBooks = Object.values(books).filter(book => book.author === author);

//     if (matchingBooks.length > 0) {
//         const formattedOutput = JSON.stringify({ booksByAuthor: matchingBooks }, null, 2);
//         return res.status(200).send(formattedOutput);
//     } else {
//         return res.status(404).json({ message: "No books found by this author" });
//     }
// });

// Get all books based on title || used Axios version
// public_users.get('/title/:title',function (req, res) {
//     const title = req.params.title;
//     const matchingTitles = Object.values(books).filter(book => book.title === title);

//     if (matchingTitles.length > 0) {
//         const formattedOutput = JSON.stringify({ booksByTitle: matchingTitles }, null, 2);
//         return res.status(200).send(formattedOutput);
//     } else {
//         return res.status(404).json({ message: "No books found by this author" });
//     }
// });

public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
  
    try {
      const response = await axios.get('http://localhost:5000/');
      const booksData = response.data.books;
  
      const matchingTitles = Object.values(booksData).filter(book => book.title === title);
  
      if (matchingTitles.length > 0) {
        const formattedOutput = JSON.stringify({ booksByTitle: matchingTitles }, null, 2);
        return res.status(200).send(formattedOutput);
      } else {
        return res.status(404).json({ message: "No books found with this title" });
      }
  
    } catch (error) {
      return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    const book = Object.values(books).find(book => book.isbn === isbn);
  
    if (book) {
      const formattedOutput = JSON.stringify({ reviewByISBN: book }, null, 2);
      return res.status(200).send(formattedOutput);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
