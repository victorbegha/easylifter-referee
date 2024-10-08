/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/
const fs = require('fs');
const minify = require('./minify.js');

var credentials;
var board;

function automatePages(language) {
  var pagesHeader = fs.readFileSync('../../router-esp32/pages_template.h').toString();
  pagesHeader = pagesHeader.replace('<<<MENUHTML>>>', minify.minifyFileByPath('../../router-esp32/pages/' + language + '/menu.html', credentials.ssid, board));
  pagesHeader = pagesHeader.replace('<<<REFEREEHTML>>>', minify.minifyFileByPath('../../router-esp32/pages/' + language + '/referee.html', credentials.ssid, board));
  pagesHeader = pagesHeader.replace('/* Generate pages.h from this file by running "tools/inoCodeGenerator/automate.js" */', '/* This file is generated from pages_template.h by running "tools/inoCodeGenerator/automate.js". Do not edit this file directly */');

  if (board == 'ESP32') {
    fs.writeFile('../../router-esp32/EasyLifterRefereeESP32/pages.h', pagesHeader, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('Done');
    });
  } else if (board == 'ESP8266') {
    fs.writeFile('../../router-esp32/EasyLifterRefereeESP8266/pages.h', pagesHeader, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('Done');
    });
  }
}

function loadCredentials() {
  let filePath = './softApCredentials.json';
  if (!fs.existsSync(filePath)) {
    console.log('Error: softApCredentials.json not found');
    return;
  }
  let rawData = fs.readFileSync(filePath);
  credentials = JSON.parse(rawData);
}

function generateInoCredentials() {
  let inoPath = '../../router-esp32/EasyLifterRefereeESP32_template.ino';
  if (board == 'ESP8266') {
    inoPath = '../../router-esp32/EasyLifterRefereeESP8266_template.ino';
  }

  let inoContents = fs.readFileSync(inoPath).toString();
  inoContents = inoContents.replace(/const String ssid = ".*";/, 'const String ssid = "' + credentials.ssid + '";');
  inoContents = inoContents.replace(/const String password = ".*";/, 'const String password = "' + credentials.password + '";');
  inoContents = inoContents.replace('/* Generate EasyLifterRefereeESP32.ino from this file by running "tools/inoCodeGenerator/automate.js" */', '/* This file is generated from EasyLifterRefereeESP32_template.ino by running "tools/inoCodeGenerator/automate.js". Do not edit this file directly */');
  inoContents = inoContents.replace('/* Generate EasyLifterRefereeESP8266.ino from this file by running "tools/inoCodeGenerator/automate.js" */', '/* This file is generated from EasyLifterRefereeESP8266_template.ino by running "tools/inoCodeGenerator/automate.js". Do not edit this file directly */');

  let finalPath = '../../router-esp32/EasyLifterRefereeESP32/EasyLifterRefereeESP32.ino';
  if (board == 'ESP8266') {
    finalPath = '../../router-esp32/EasyLifterRefereeESP8266/EasyLifterRefereeESP8266.ino';
  }
  fs.writeFile(finalPath, inoContents, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log('Done');
  });
}

function main() {
  let language = process.argv[2];
  if (!language) {
    language = 'en-us';
  } else if (language == 'en') {
    language = 'en-us';
  } else if (language == 'pt') {
    language = 'pt-br';
  }

  board = process.argv[3];
  if (!board) {
    board = 'ESP32';
  }

  console.log('Loading ssid and password from softApCredentials.json:');
  loadCredentials();

  if (!credentials || !credentials.ssid || credentials.ssid == '' || !credentials.password || credentials.password == '') {
    console.log('Error: SSID and password must be in softApCredentials.json');
    return;
  }

  console.log('Creating pages.h for language: ' + language);
  automatePages(language);

  console.log('Generating EasyLifterRefereeESP32.ino with ssid and password from softApCredentials.json:');
  generateInoCredentials();
}

main();
