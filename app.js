// Authored by Amin Erfanian
// To run the Fidibo Scraper follow the steps <assuming you have install node and npm>
// In the terminal enter these commands:
// 1- npm i
// 2- node app.js > >(tee stdout.log) 2> error.log

const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs").promises;
const { eBookSelector, audioBookSelector } = require("./selectors");
const toEnglishDigitConvertor = require("./persianToEnglishDigitConvertor");

const allBooksData = {
  eBooks: [],
  audioBooks: [],
};

const BASE_URL = "https://fidibo.com";

async function getBooksData() {
  try {
    const categoriesList = await getCategoriesList();
    console.log(categoriesList);
    const booksLinksList = [];

    for (const category of categoriesList) {
      const list = await getBooksLinksList(category);
      booksLinksList.push(...list);
    }

    console.log(`total books found everywhere > ${booksLinksList.length}`);

    for (const bookLink of booksLinksList) {
      await findBookData(bookLink.trim());
    }

    console.log("All books data retrieved!!");
  } catch (error) {
    console.error(error);
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
    console.error(error);
  }
}

// function parsList(lists) {
//   return Array.from(lists).map((li) => ({
//     link: li.attribs.href,
//     title: li.attribs.title,
//   }));
// }

async function getBooksLinksList(category) {
  try {
    const booksLinks = [];

    let result = await axios.get(`${BASE_URL}${category.link}`);
    let html = result.data;
    let $ = cheerio.load(html);
    const totalPages = getCategoryTotalPages($);

    console.log(`${category.link}> ${totalPages}`);

    $("#item_list > div > div > div.item-image > a").each(function () {
      booksLinks.push($(this).attr("href"));
    });
    console.log(`Page 1 Books Links Retrieved!`);

    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
      result = await axios.get(
        `${BASE_URL}${category.link}?page=${pageNumber}`
      );
      let html = result.data;
      let $ = cheerio.load(html);
      $("#item_list > div > div > div.item-image > a").each(function () {
        const newBookLink = $(this).attr("href");
        if (!booksLinks.includes(newBookLink)) booksLinks.push(newBookLink);
      });
      console.log(`Page ${pageNumber} Books Links Retrieved!`);
    }

    console.log(`${category.title} category all books links >`);
    console.log(booksLinks);

    return booksLinks;
  } catch (error) {
    console.error("category page load failed...!");
    console.error(error);
  }
}

async function findBookData(bookLink) {
  try {
    const result = await axios.get(encodeURI(BASE_URL + bookLink));
    const html = result.data;
    const $ = cheerio.load(html);
    const isAudioBook =
      $(audioBookSelector["title"]).text().indexOf("صوتی") >= 0;

    const bookData = dataParser($, Boolean(isAudioBook), bookLink);
    allBooksData[`${bookData.type.en}s`].push(bookData);

    await fs.writeFile("./data.json", JSON.stringify(allBooksData));
    console.log(`Book data added, It's link is > ${bookLink}`);
  } catch (error) {
    console.error(error);
  }
}

function dataParser($, isAudioBook, bookLink) {
  const selector = isAudioBook ? audioBookSelector : eBookSelector;
  const bookData = {
    type: {
      en: isAudioBook ? "audioBook" : "eBook",
      fa: isAudioBook ? "کتاب صوتی" : "کتاب الکترونیکی",
    },
    path: bookLink,
  };
  let splittedData = [];
  for (const key in selector) {
    switch (key) {
      case "title":
        const pathString = bookLink.substring(bookLink.indexOf("/", 1));
        const pathArray = pathString.split("-");
        pathArray.shift();
        pathArray.shift();
        if (isAudioBook) pathArray.shift();
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
        splittedData = $(selector[key]).text().trim().split(" ");
        bookData[key] = splittedData[splittedData.length - 1];
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
        bookData[key] = splittedData[splittedData.length - 2];
        break;

      case "fileSize":
      case "pagesCount":
      case "price":
        bookData[key] = $(selector[key]).text().trim().split(" ")[0];
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
  return enDigitsPagesCount < 10 ? enDigitsPagesCount : 10;
}

getBooksData();
