function toEnglishDigitConvertor(number) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return number
    .split("")
    .map((givenChar) =>
      farsiDigits.includes(givenChar)
        ? farsiDigits.findIndex((faDigit) => faDigit === givenChar)
        : givenChar
    )
    .join("");
}

module.exports = toEnglishDigitConvertor;
