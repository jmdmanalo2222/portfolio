(() => {
 try {
  const theme = localStorage.getItem('portfolio-theme');
  if (theme === 'light' || theme === 'dark') {
   document.documentElement.setAttribute('data-theme', theme);
   window.__themePreference = theme;
  }
 } catch (_) { /* The page also works when browser storage is unavailable. */ }
})();
