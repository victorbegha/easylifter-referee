/*
EasyLifter Referee - Free referee lights and timing system for powerlifting
Copyright (C) 2024  Victor Begha
Licensed under GPLv3 (https://www.gnu.org/licenses/gpl-3.0.html)
*/

function clearInput(i) {
  i.value = '';
}

function maskTimerInput(i) {
  var v = i.value;

  if (isNaN(v[v.length - 1])) {
    // prevents inputting characters that aren't numbers
    i.value = v.substring(0, v.length - 1);
    return;
  }

  i.setAttribute('maxlength', '5');
  if (v.length == 2) {
    i.value += ':';
  } else if (v.length > 2) {
    v = v.replace(':', '');
    v = v.substring(0, 2) + ':' + v.substring(2);
    i.value = v;
  }
}

timerInput.addEventListener('keydown', function (e) {
  // If pressing backspace when ':' is the last character, erase it as well as the previous character. The ':' should
  // act only as a mask and should be intangible for the user
  if (e.key === 'Backspace' && this.value.includes(':') && this.value[this.value.length - 1] == ':') {
    this.value = this.value.substring(0, this.value.length - 1);
  }
});

function validateTimer(i) {
  if (i.value == null || i.value == '' || i.value.length > 5) {
    i.value = '01:00';
  } else if (i.value.length < 5) {
    i.value = i.value + '00:00'.substring(i.value.length, 5);
  } else {
    let minutesString = i.value.substring(0, 2);
    let secondsString = i.value.substring(3, 5);
    let minutes = parseInt(minutesString);
    let seconds = parseInt(secondsString);
    if (minutes > 59) {
      minutesString = '59';
    }
    if (seconds > 59) {
      secondsString = '59';
    }
    i.value = minutesString + ':' + secondsString;
  }
}
