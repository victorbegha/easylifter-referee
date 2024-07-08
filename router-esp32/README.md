# Generating .ino code for the ESP32 router

Notice the 'EasyLifterRefereeESP32' directory is empty, as its file contents are ignored by git. To generate the code you'll be uploading into the ESP32 with the Arduino IDE, follow these steps:

1. Create a 'softApCredentials.json' file in the "tools/inoCodeGenerator" folder. In it, fill in your desired SSID name for the WiFi network we'll be generating (I suggest calling it "REFEREES" or something else easily recognizable), and create your own unique, strong password for it.

2. In the "tools/inoCodeGenerator" folder, run `node automate.js`, passing the desired page language as a parameter, ex. `node automate.js en-us` or `node automate.js pt-br`.

3. This will generate EasyLifterRefereeESP32.ino and pages.h in the EasyLifterRefereeESP32 directory. You can now open it as a sketch in the Arduino IDE and upload it to the ESP32 NodeMCU.

Note that, before you can upload code into the ESP32, you will need to:

* Install the CP210x USB drivers so your board is recognized. You can download them from Silicon Labs:
https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers?tab=downloads ("CP210x Windows Drivers" if you're on Windows).

* In the Arduino IDE, on File > Preferences, add the ESP32 libraries to "Additional board manager URLs":
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json