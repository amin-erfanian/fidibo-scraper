const fs = require("fs");
const booksData = require("./books-data.json");
console.log(`Retrieved eBooks Count: ${booksData.eBooks.length}`);
console.log(`Retrieved audioBooks Count: ${booksData.audioBooks.length}`);

function summarizeData() {
  booksData.eBooks = booksData.eBooks.slice(0, 100);
  booksData.audioBooks = booksData.audioBooks.slice(0, 100);

  fs.writeFile(
    "./summarized-books-data.json",
    JSON.stringify(booksData),
    (error) => {
      error
        ? console.log(error)
        : console.log(
            "100 of each type of books successfully written into the summarized file..!"
          );
    }
  );
}
