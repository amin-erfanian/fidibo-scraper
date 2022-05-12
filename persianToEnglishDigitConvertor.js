function toEnglishDigitConvertor(number) {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

  return number
    .split("")
    .map((givenFaDigit) =>
      farsiDigits.findIndex((faDigit) => faDigit === givenFaDigit)
    )
    .join("");
}

module.exports = toEnglishDigitConvertor;
