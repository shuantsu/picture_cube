const bgColor = localStorage.getItem('backgroundColor');
if (bgColor) {
  document.documentElement.style.setProperty('--bg-color', bgColor);
}
