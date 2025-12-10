const numberToWordsIndian = (number: number): string => {
  const units = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "Ten",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const getUnitName = (n: number): string => units[n] || "";
  const getTeenName = (n: number): string => teens[n - 11] || "";
  const getTensName = (n: number): string => tens[Math.floor(n / 10) - 1] || "";
  const getHundredsName = (n: number): string =>
    n ? `${units[Math.floor(n / 100)]} Hundred` : "";

  function convertHundreds(num: number): string {
    let str = "";
    if (num > 99) {
      str += getHundredsName(num) + " ";
      num %= 100;
    }
    if (num > 10 && num < 20) {
      str += getTeenName(num) + " ";
    } else {
      str += getTensName(num - (num % 10)) + " ";
      str += getUnitName(num % 10) + " ";
    }
    return str.trim();
  }

  function convertNumber(num: number): string {
    if (num === 0) return "Zero";

    let str = "";
    const numString = num.toString();
    const len = numString.length;

    // Handle the crore part
    if (len > 7) {
      const crorePart = Math.floor(num / 10000000);
      str += convertHundreds(crorePart) + " Crore ";
      num %= 10000000;
    }

    // Handle the lakh part
    if (len > 5) {
      const lakhPart = Math.floor(num / 100000);
      str += convertHundreds(lakhPart) + " Lakh ";
      num %= 100000;
    }

    // Handle the thousand part
    if (len > 3) {
      const thousandPart = Math.floor(num / 1000);
      str += convertHundreds(thousandPart) + " Thousand ";
      num %= 1000;
    }

    // Handle the remaining part (less than 1000)
    str += convertHundreds(num);

    // Remove unnecessary zeros and trailing spaces
    str = str
      .trim()
      .replace(/\s{2,}/g, " ")
      .replace(/Zero\s+$/, "")
      .replace(/\s+Zero$/, "");

    return str.trim();
  }

  function convertFractionalPart(fraction: number): string {
    let fractionalStr = "";
    if (fraction > 0) {
      fractionalStr += convertHundreds(fraction) + " Paise";
    }
    return fractionalStr;
  }

  const parts = number.toString().split(".");
  const integerPart = parseInt(parts[0], 10);
  const fractionalPart = parts[1] ? parseInt(parts[1], 10) : 0;

  let result = convertNumber(integerPart) + " Rupees Only";

  if (fractionalPart > 0) {
    result = result.replace("Only", "");
    result += " and " + convertFractionalPart(fractionalPart) + " Only";
  }

  return result;
};

export default numberToWordsIndian;
