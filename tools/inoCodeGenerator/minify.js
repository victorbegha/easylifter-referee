/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/
const fs = require('fs');

function minifyToHtml(htmlString, ssid, board) {
    const base64favicon = fs.readFileSync('./base64logo.txt').toString();

  // TODO: update to handle single-line JavaScript comments
  htmlString = htmlString.replace(/[\r\n]+/g, ''); // line breaks
  htmlString = htmlString.replace(/\<\!\-\-.+\-\-\>/g, ''); // HTML comments
  htmlString = htmlString.replace(/\/\*.+?\*\//g, ''); // JavaScript comments
  htmlString = htmlString.replace(/[\s\t]+/g, ' '); // Spaces and tabs
    htmlString = htmlString.replace('<<REFEREESNETWORK>>', ssid); // Replace network SSID

  if (board == 'ESP32') {
    // Insert base64 encoded favicon
    htmlString = htmlString.replace('<<BASE64ICON>>', base64favicon);
  }
  else {
    // ESP8266 does not have enough memory for the favicon
    htmlString = htmlString.replace('<link rel="icon" href="data:image/x-icon;base64,<<BASE64ICON>>" />', '');
  }

  return htmlString;
}

function minifyToQuotedString(str) {
  str = str.replace(/\"/g, '\\"'); // Escape quotes
  str = '"' + str + '"'; // Wrap the whole thing in quotes, ready to be used as a string in pages.h
  return str;
}

function minifyFileByPath(path, ssid, board) {
    var fileContents = fs.readFileSync(path).toString();
    fileContents = minifyToHtml(fileContents, ssid, board);
    fileContents = minifyToQuotedString(fileContents);
    return fileContents;
}

module.exports = { minifyToHtml, minifyToQuotedString, minifyFileByPath };
