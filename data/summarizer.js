const fs = require("fs");
const booksData = require("./books-data.json");
console.log(`Retrieved eBooks Count: ${booksData.eBooks.length}`);
console.log(`Retrieved audioBooks Count: ${booksData.audioBooks.length}`);

booksData.eBooks = booksData.eBooks.slice(0, 100);
booksData.audioBooks = booksData.audioBooks.slice(0, 100);

fs.writeFile(
  "./summarized-books-data.json",
  JSON.stringify(booksData),
  (error) => {
    error
      ? console.log(error)
      : console.log("Successfully written into the file..!");
  }
);
