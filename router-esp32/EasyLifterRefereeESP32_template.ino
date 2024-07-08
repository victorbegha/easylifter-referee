/*
EasyLifter Referee - Free referee lights and timing system for powerlifting

Copyright (C) 2024  Victor Begha

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <ESPmDNS.h>

/* Generate EasyLifterRefereeESP32.ino from this file by running "tools/inoCodeGenerator/automate.js" */

#include "pages.h"

// We communicate with the referees via websocket, and with the desktop app via serial port.
// Referee access the webserver page from their device and then button presses are issued via websocket

// You MUST replace these with your own custom ssid and password for the softAP, before loading
// the code into the ESP32. In the future this will be configurable.
// Note that you should NOT put in the credentials for an existing WiFi network; instead we're
// defining brand new credentials for the system's own network the ESP32 will be creating.
const String ssid = ""; // Suggestion: "REFEREES"
const String password = ""; // Create your own, unique, strong password

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");
IPAddress localIP;
Pages pages; // Class for handling the HTML contents

/*
  Each referee is represented by four "bits". I used a string for ease of implementation as the
  program uses little of the ESP32's memory anyway, but you can change this to an int or even
  an array of booleans if that ever becomes a concern.
  Each bit represents one of the buttons: white, red, blue and yellow.
*/
String leftReferee = "0000";
String centerReferee = "0000";
String rightReferee = "0000";

/*
  Any time a referee's result changes, OR any new device connects to the system, we should notify
  both the referees' devices (via websocket) and the desktop app (via serial port) with the
  current status of the system, as in, the decisions of the referees.
*/
void notifyClients() {
  String currentResults = getAllResults();
  ws.textAll(currentResults);
  sendToSerial(currentResults);
}

/*
  The chief referee can issue simplified timer commands (ex. restart and play 1 minute).
  Full timer controls are available on the desktop app
*/
void sendTimerCommand(String millis) {
  // Currently the only available command is 'restart and play'
  sendToSerial("timer|rp|" + millis);
}

/*
  Processing for all messages coming from the referees via websocket happens here
*/
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo *)arg;
  String incomingData;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    incomingData = String((char *)data);
    //sendToSerial("msg|incomingData: " + incomingData);

    if (incomingData == "clear") {
      clearAll();
    } else {
      switch (incomingData[0]) {
        // If 't', it's a timer command by the chief referee
        case 't':
          sendTimerCommand(incomingData.substring(1));
          break;
        // Otherwise it's the decision of one of the referees, identified by its position
        case 'l':
          leftReferee = updateReferee(leftReferee, incomingData[1]);
          break;
        case 'c':
          centerReferee = updateReferee(centerReferee, incomingData[1]);
          break;
        case 'r':
          rightReferee = updateReferee(rightReferee, incomingData[1]);
          break;
      }
    }

    notifyClients();
  }
}

/*
  Handling websocket initialization and events
*/

void initWebSocket() {
  ws.onEvent(onEvent);
  server.addHandler(&ws);
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      sendToSerial("msg|WebSocket client connected: " +  String(client->id()) + ", IP: "+ client->remoteIP().toString());
      notifyClients();
      break;
    case WS_EVT_DISCONNECT:
      sendToSerial("msg|WebSocket client disconnected: " + String(client->id()));
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}


/*
  Get network connection info to display on the desktop app
*/
String getNetworkConnectionInfo() {
  String info = "network|";
  info += localIP.toString();
  info += "|";
  info += ssid;
  info += "|";
  info += password;
  return info;
}


/*
  Reads any messages the desktop app is sending us through the serial port
*/
void readSerialInputs() {
  String readString = "";
  while (Serial.available()) {
    delay(3);  //delay to allow buffer to fill
    if (Serial.available() > 0) {
      char c = Serial.read();  //gets one byte from serial buffer
      readString += c;         //makes the string readString
    }
  }

  if (readString.length() > 0) {
    if (readString == "clear") {
      clearAll();
    }
    else if (readString == "status") {
      notifyClients();
    }
    else if (readString == "network") {
      sendToSerial(getNetworkConnectionInfo());
    }
    readString = "";
  }
}

/*
  Simply prints the current results in a single string, with a letter identifying
  the position and then that corresponding referee's decision.
*/
String getAllResults() {
  return "l" + leftReferee + "c" + centerReferee + "r" + rightReferee;
}

/*
  After the lights are shown, the desktop app will send a signal
  to clear all referee decisions. This is then notified to all referee devices
  and also the desktop app itself, which will clear the state of the buttons
  on each ref's device, and turn off all lights in the desktop app.
*/
void clearAll() {
  leftReferee = updateReferee(leftReferee, 'c');
  centerReferee = updateReferee(centerReferee, 'c');
  rightReferee = updateReferee(rightReferee, 'c');
  notifyClients();
}


/*
  The "business logic" of the referee controller is implemented here.
  The white button refers simply to a valid lift. The red, blue and yellow buttons refer
  to each individual referee card for an invalid lift (as per IPF rules). A valid lift
  will never have any colored cards, but multiple colored cards may be raised for an
  invalid lift; as such, if the bit corresponding to the white button is 1, all other
  buttons will be at 0. Likewise, if any of the colored buttons is pressed, the white
  bit MUST be set to 0, while allowing other colors to still be pressed.
*/
String updateReferee(String referee, char button) {
  if (button == 'w') {  // white
    referee = "1000";
  } else if (button == 'r') {  // red
    referee[0] = '0';
    referee[1] = '1';
  } else if (button == 'b') {  // blue
    referee[0] = '0';
    referee[2] = '1';
  } else if (button == 'y') {  // yellow
    referee[0] = '0';
    referee[3] = '1';
  } else if (button == 'c') {  // clear
    referee = "0000";
  }
  return referee;
}

/*
  Handling the HTML for the webserver pages
*/
String getHtml(String page) {
  if (page == "menu") {
    return pages.menu;
  }
  if (page == "referee") {
    return pages.referee;
  }
  return "";
}


/*
  Serial communication should be wrapped between an identifiable header and trailer which will
  be treated by the desktop app to prevent any garbage data from being used.
*/
void sendToSerial(String data) {
  String message = "|S|";  // header
  message += data;
  message += "|E|";  // trailer
  Serial.println(message);
}


/* --- MAIN PROGRAM SETUP AND LOOP --- */

void setup() {
  // We speak to the desktop app via serial port
  Serial.begin(115200);
  sendToSerial("msg|Starting program");

  // Create WiFi network (softAP because it's not connected to the internet,
  // only the referees' devices will be connected to this)
  WiFi.softAP(ssid, password);
  sendToSerial("msg|AP setup successfully");

  // Print ESP Local IP Address
  localIP = WiFi.softAPIP();
  sendToSerial("msg|IP address: " + localIP.toString());

  // Uses mDNS to set host name as 'easylifter.local'
  if (!MDNS.begin("easylifter")) {
    sendToSerial("err|mDNS responder failed");
  }
  sendToSerial("msg|mDNS responder started");

  // Start the websocket that will be used to communicate with the referees' devices
  initWebSocket();

  // Web server router
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "text/html", getHtml("menu"));  // Menu to select referee position
  });
  server.on("/referee", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "text/html", getHtml("referee"));  // Referee controls
  });

  // Starting webserver
  server.begin();
}

void loop() {
  ws.cleanupClients();

  readSerialInputs();
}