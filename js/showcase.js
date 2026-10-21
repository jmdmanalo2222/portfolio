(() => {
 const root = document.documentElement;
 const themeButton = document.getElementById('showcase-theme');
 function updateThemeLabel() {
  const light = root.getAttribute('data-theme') === 'light';
  themeButton.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  themeButton.querySelector('span').textContent = light ? '☾' : '☀';
 }
 themeButton.addEventListener('click', () => {
  const theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme',theme);
  try { localStorage.setItem('portfolio-theme',theme); } catch (_) {}
  updateThemeLabel();
 });
 updateThemeLabel();
 const filters = Array.from(document.querySelectorAll('.showcase-filter'));
 const cards = Array.from(document.querySelectorAll('[data-project-type]'));
 const count = document.getElementById('showcase-result-count');
 const types = ['all','service-business','online-store','restaurant','real-estate'];
 function selectType(type, updateUrl = false) {
  if (!types.includes(type)) type = 'all';
  filters.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.filter === type)));
  cards.forEach(card => { card.hidden = type !== 'all' && card.dataset.projectType !== type; });
  const visibleCount = cards.filter(card => !card.hidden).length;
  count.textContent = `${visibleCount} website ${visibleCount === 1 ? 'demo' : 'demos'}`;
  if (updateUrl) {
   const url = new URL(window.location.href);
   if (type === 'all') url.searchParams.delete('type'); else url.searchParams.set('type',type);
   try { history.replaceState(null,'',url); } catch (_) {}
  }
 }
 filters.forEach(button => button.addEventListener('click',() => selectType(button.dataset.filter,true)));
 window.addEventListener('popstate',() => selectType(new URLSearchParams(window.location.search).get('type') || 'all'));
 selectType(new URLSearchParams(window.location.search).get('type') || 'all');
})();
