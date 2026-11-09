/* Damoon TO-BE — mark active nav item from data-nav attribute */
(function () {
  var active = document.body.getAttribute('data-nav');
  if (!active) return;
  document.querySelectorAll('.sidebar-nav .nav-item[data-nav]').forEach(function (el) {
    if (el.getAttribute('data-nav') === active) {
      el.classList.add('active');
      el.setAttribute('aria-current', 'page');
    }
  });
})();
