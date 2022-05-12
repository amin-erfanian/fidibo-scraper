const eBookSelector = {
  title:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-6.col-sm-5.col-xs-12 > div > div > div.col-sm-11 > h1",
  authors:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-6.col-sm-5.col-xs-12 > div > div > div.col-sm-11 > ul > li:nth-child(1) > a",
  translators:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-6.col-sm-5.col-xs-12 > div > div > div.col-sm-11 > ul > li:nth-child(2) > a",
  price:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-3.col-sm-4.text-center.action-area > div > div > span",
  printedPrice:
    "#content > div.single2 > section > div > div > ul > li:nth-child(2) > span",
  description: [
    "#content > div.single2 > article > section > div > section > div.book-description p:first",
    "#fade-content > p",
  ],
  publisher:
    "#content > div.single2 > section > div > div > ul > li:nth-child(1) > a",
  publishedDate:
    "#content > div.single2 > section > div > div > ul > li:nth-child(3) > span",
  language:
    "#content > div.single2 > section.book-tag-section > div > div > ul > li:nth-child(4)",
  fileSize:
    "#content > div.single2 > section.book-tag-section > div > div > ul > li:nth-child(5)",
  pagesCount:
    "#content > div.single2 > section.book-tag-section > div > div > ul > li:nth-child(6)",
  shabak: `#content > div.single2 > section > div > div > ul > li:nth-child(7) > label`,
  category:
    "body > div.alert.HeadAlert.text-center.top-toolbar > nav > ul > li",
  coverLink: "#book_img",
};

const audioBookSelector = {
  title:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-6.col-sm-5.col-xs-12 > div > div > div.col-sm-11 > h1",
  authors:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-6.col-sm-5.col-xs-12 > div > div > div.col-sm-11 > ul > li:nth-child(1) > a",
  translators:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-6.col-sm-5.col-xs-12 > div > div > div.col-sm-11 > ul > li:nth-child(2) > a",
  narrators:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-6.col-sm-5.col-xs-12 > div > div > div.col-sm-11 > ul > li:nth-child(3) > a",
  price:
    "#content > div.single2 > article > div:nth-child(1) > div > div.col-md-3.col-sm-4.text-center.action-area > div > div > span",
  description: [
    "#content > div.single2 > article > section > div > section > div.book-description p:nth-child(1)",
    "#fade-content > p",
  ],
  publisher:
    "#content > div.single2 > section > div > div > ul > li:nth-child(1) > a",
  publishedDate:
    "#content > div.single2 > section > div > div > ul > li:nth-child(2) > span",
  language:
    "#content > div.single2 > section.book-tag-section > div > div > ul > li:nth-child(3)",
  fileSize:
    "#content > div.single2 > section.book-tag-section > div > div > ul > li:nth-child(4)",
  category:
    "body > div.alert.HeadAlert.text-center.top-toolbar > nav > ul > li",
  coverLink: "#book_img",
};

module.exports.eBookSelector = eBookSelector;
module.exports.audioBookSelector = audioBookSelector;
