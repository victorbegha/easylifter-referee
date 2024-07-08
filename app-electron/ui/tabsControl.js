function setActiveTab(tab, option) {
  Array.from(document.getElementsByClassName('panel-content')).forEach(function (el) {
    el.classList.add('hidden');
  });
  document.getElementById('panel-' + option).classList.remove('hidden');

  Array.from(document.getElementsByClassName('nav-link')).forEach(function (el) {
    el.classList.remove('active');
  });
  tab.classList.add('active');
}
