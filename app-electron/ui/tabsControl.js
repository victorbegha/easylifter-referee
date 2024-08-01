function setActiveTab(tab, option) {
  Array.from(document.getElementsByClassName('panel-content')).forEach(function (el) {
    el.classList.add('hidden');
  });
  document.getElementById('panel-' + option).classList.remove('hidden');

  Array.from(document.getElementsByClassName('nav-link')).forEach(function (el) {
    el.classList.remove('active');
  });
  tab.classList.add('active');

  try {
    togglePassword(true); // Auto hides the network password on the Network Connection tab if changing to another tab.
    showNetworkInfo(false); // Also hides the entire network info section on the Kit version.
  } catch (e) {}
}
