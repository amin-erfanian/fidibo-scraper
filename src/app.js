// To run the Fidibo Scraper follow the steps <assuming you have install node, npm and tee>
// In the terminal enter these commands:
// 1- npm i
// 2- time node app.js > >(tee ../log/output.log) 2> ../log/error.log

const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs").promises;
const {
  eBookSelector,
  audioBookSelector,
  audioBookWithPrintedPriceSelector,
  podcastSelector,
} = require("./selectors");
const toEnglishDigitConvertor = require("./persianToEnglishDigitConvertor");
const { title } = require("process");

const allBooksData = {
  eBooks: [],
  audioBooks: [],
};

const booksLinks = [];

const BASE_URL = "https://fidibo.com";

async function getBooksData() {
  // step 1 > get categories
  // step 2 > get all books links
  // step 3 > get books data
  try {
    let categoriesList = await getCategoriesList();
    // categoriesList = categoriesList.slice(0, 10);
    console.log(categoriesList);

    const promisesList = [];
    for (const category of categoriesList) {
      promisesList.push(getBooksLinks(category));
    }
    await Promise.all(promisesList);

    console.log(`total books found everywhere > ${booksLinks.length}`);

    await fs.writeFile("../data/books-links.json", JSON.stringify(booksLinks));

    for (const bookLink of booksLinks) {
      promisesList.push(findBookData(bookLink.trim()));
    }
    await Promise.all(promisesList);
    await fs.writeFile("../data/books-data.json", JSON.stringify(allBooksData));

    console.log("All books data retrieved!!");
  } catch (error) {
    const err = {
      status: error?.response?.status,
      text: error?.response?.statusText,
    };
    console.error(err.status ? err : error);
  }
}

async function getCategoriesList() {
  try {
    const result = await axios.get(BASE_URL);
    const html = result.data;
    const $ = cheerio.load(html);
    const categoriesList = [];
    $(
      "#line-navbar-collapse-2 > ul.nav.navbar-nav.nd-navbar-header > li:nth-child(2) > ul > div > li > a"
    ).each(function () {
      const obj = {};
      obj["link"] = $(this).attr("href");
      obj["title"] = $(this).attr("title");
      categoriesList.push(obj);
    });

    return categoriesList;
    // return parsList(lists); // returns categories-link objects list
  } catch (error) {
    const err = {
      status: error?.response?.status,
      text: error?.response?.statusText,
    };
    console.error(err.status ? err : error);
  }
}

// function parsList(lists) {
//   return Array.from(lists).map((li) => ({
//     link: li.attribs.href,
//     title: li.attribs.title,
//   }));
// }

async function getPagesBooksLinks(pageNumber, categoryLink) {
  try {
    result = await axios.get(`${BASE_URL}${categoryLink}?page=${pageNumber}`);
    let html = result.data;
    let $ = cheerio.load(html);
    $("#item_list > div > div > div.item-image > a").each(function () {
      const newBookLink = $(this).attr("href");
      if (!booksLinks.includes(newBookLink)) booksLinks.push(newBookLink);
    });
    console.log(`${categoryLink} page ${pageNumber} books links retrieved!`);
    // await fs.writeFile("../data/books-links.json", JSON.stringify(booksLinks));
  } catch (error) {
    const err = {
      status: error?.response?.status,
      text: error?.response?.statusText,
    };
    console.error(err.status ? err : error);
  }
}

async function getBooksLinks(category) {
  const categoryLink = category.link;
  try {
    let result = await axios.get(`${BASE_URL}${categoryLink}`);
    let html = result.data;
    let $ = cheerio.load(html);
    const totalPages = getCategoryTotalPages($);

    console.log(`${categoryLink}> ${totalPages}`);

    $("#item_list > div > div > div.item-image > a").each(function () {
      booksLinks.push($(this).attr("href"));
    });

    console.log(`${categoryLink} page 1 books links retrieved!`);

    const promisesList = [];
    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
      promisesList.push(getPagesBooksLinks(pageNumber, categoryLink));
    }
    await Promise.all(promisesList);
  } catch (error) {
    console.error("category page load failed...!");
    const err = {
      status: error?.response?.status,
      text: error?.response?.statusText,
    };
    console.error(err.status ? err : error);
  }
}

async function findBookData(bookLink) {
  try {
    const result = await axios.get(encodeURI(BASE_URL + bookLink));
    const html = result.data;
    const $ = cheerio.load(html);

    const bookData = dataParser($, bookLink);
    allBooksData[`${bookData.type.en}s`].push(bookData);

    await fs.writeFile("../data/books-data.json", JSON.stringify(allBooksData));
    console.log(`Book data added, It's link is > ${bookLink}`);
  } catch (error) {
    const err = {
      status: error?.response?.status,
      text: error?.response?.statusText,
    };
    console.error(err.status ? err : error);
  }
}

function getBookType(bookLink) {
  const books = [
    { type: "podcast", searchKey: "پادکست" },
    { type: "audioBook", searchKey: "صوتی" },
    { selector: "eBook", searchKey: "کتاب" },
  ];
  for (const book of books) {
    if (bookLink.indexOf(book.searchKey)) {
      return book.type;
    }
  }
  return "eBook";
}

function dataParser($, bookLink) {
  const type = getBookType(bookLink);
  let selector;

  if (type === "audioBook") {
    if (
      $(
        "#content > div.single2 > section > div > div > ul > li:nth-child(2) > span"
      )
        .text()
        .indexOf("قیمت") >= 0
    )
      selector = audioBookWithPrintedPriceSelector;
  }

  if (type === "podcast") {
    selector = podcastSelector;
    isAudioBook = true;
  } else if (type === "audioBook") {
    if (
      $(
        "#content > div.single2 > section > div > div > ul > li:nth-child(2) > span"
      )
        .text()
        .indexOf("قیمت") >= 0
    ) {
      selector = audioBookWithPrintedPriceSelector;
    } else {
      selector = audioBookSelector;
    }
    isAudioBook = true;
  } else if (type === "eBook") {
    selector = eBookSelector;
    isAudioBook = false;
  }

  const bookData = {
    type: {
      en: isAudioBook ? "audioBook" : "eBook",
      fa: isAudioBook ? "کتاب صوتی" : "کتاب الکترونیکی",
    },
    bookLink: `${BASE_URL}${bookLink}`,
  };
  let splittedData = [];
  let removableWords = [];
  for (const key in selector) {
    switch (key) {
      case "title":
        removableWords = ["کتاب", "صوتی", "پادکست", "pdf"];
        const pathString = bookLink.substring(bookLink.indexOf("/", 1));
        const pathArray = pathString.split("-");
        pathArray.shift(); // to remove book id
        if (removableWords.includes(pathArray[0])) pathArray.shift();
        if (isAudioBook && removableWords.includes(pathArray[0]))
          pathArray.shift();
        console.log(pathArray);
        bookData[key] = pathArray.join(" "); // as title of the book
        break;

      case "description":
        bookData[key] = (
          $(selector[key][0]).length ? $(selector[key][0]) : $(selector[key][1])
        )
          ?.text()
          .trim();
        break;

      case "translators":
      case "authors":
      case "narrators":
        const namesList = [];
        $(selector[key]).each(function () {
          namesList.push($(this).text().trim());
        });
        bookData[key] = namesList;
        break;

      case "publisher":
        removableWords = ["نشر", "انتشارات"];
        splittedData = $(selector[key]).text().trim().split(" ");
        if (removableWords.includes(splittedData[0])) splittedData.shift();
        bookData[key] = splittedData.join(" ");
        break;

      case "category":
        const list = [];
        $(selector[key]).each(function () {
          list.push($(this).text().trim());
        });
        list.shift();
        list.pop();
        bookData[key] = list;
        break;

      case "printedPrice":
        splittedData = $(selector[key]).text().trim().split(" ");
        bookData[key] = toEnglishDigitConvertor(
          splittedData[splittedData.length - 2]
        );
        break;

      case "fileSize":
      case "pagesCount":
      case "price":
        bookData[key] = toEnglishDigitConvertor(
          $(selector[key]).text().trim().split(" ")[0]
        );
        break;

      case "publishedDate":
        bookData[key] = toEnglishDigitConvertor($(selector[key]).text().trim());
        break;

      case "coverLink":
        bookData[key] = $(selector[key]).attr("src");
        break;

      default:
        bookData[key] = $(selector[key]).text().trim();
        break;
    }
  }
  return bookData;
}

function getCategoryTotalPages($) {
  const pages = $("#result > div.pagination > ul > li:nth-last-child(3)");
  const pagesCount = pages.find("a").text();
  const enDigitsPagesCount = toEnglishDigitConvertor(pagesCount);
  // return enDigitsPagesCount < 2 ? enDigitsPagesCount : 2;
  return enDigitsPagesCount;
}

getBooksData();
