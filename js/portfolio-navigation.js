(() => {
 const region = document.getElementById('portfolio-information');
 const guide = document.getElementById('section-guide');
 const toggle = document.getElementById('section-guide-toggle');
 const header = document.getElementById('navbar');
 if (!region || !guide || !toggle || !header) return;
 const links = Array.from(guide.querySelectorAll('.section-guide-link'));
 const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
 const desktop = window.matchMedia('(min-width: 1280px)');
 const mainMenu = document.getElementById('mobile-menu');
 let visible = false;
 let expanded = false;
 let pending = false;
 document.documentElement.classList.add('has-section-guide');

 function render() {
  guide.classList.toggle('is-visible', visible);
  guide.classList.toggle('is-expanded', expanded);
  const available = visible && (desktop.matches || expanded);
  guide.setAttribute('aria-hidden', String(!available));
  guide.inert = !available;
  toggle.hidden = desktop.matches || !visible;
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.setAttribute('aria-label', expanded ? 'Close section menu' : 'Open section menu');
 }
 function closeMenu(restoreFocus = false) {
  expanded = false;
  if (restoreFocus && visible && !desktop.matches) toggle.focus({preventScroll:true});
  render();
 }
 function update() {
  pending = false;
  const headerHeight = header.getBoundingClientRect().height;
  document.documentElement.style.setProperty('--portfolio-header-height', `${headerHeight}px`);
  const bounds = region.getBoundingClientRect();
  const mainMenuOpen = mainMenu && !mainMenu.classList.contains('hidden');
  visible = bounds.top <= headerHeight + 32 && bounds.bottom > headerHeight + 80 && !mainMenuOpen;
  if (!visible || desktop.matches) expanded = false;
  const probe = headerHeight + Math.min(180, window.innerHeight * .24);
  let current = sections[0];
  sections.forEach(section => { if (section.getBoundingClientRect().top <= probe) current = section; });
  links.forEach(link => {
   const active = current && link.getAttribute('href') === `#${current.id}`;
   if (active) link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  });
  const label = document.getElementById('section-guide-current');
  const activeLink = links.find(link => link.hasAttribute('aria-current'));
  if (label && activeLink) label.textContent = activeLink.dataset.label;
  render();
 }
 function scheduleUpdate() {
  if (!pending) { pending = true; requestAnimationFrame(update); }
 }
 toggle.addEventListener('click', () => {
  expanded = !expanded;
  render();
  if (expanded) (guide.querySelector('[aria-current="location"]') || links[0]).focus({preventScroll:true});
 });
 guide.querySelector('.section-guide-close').addEventListener('click', () => closeMenu(true));
 links.forEach(link => link.addEventListener('click', () => {
  closeMenu();
  if (!desktop.matches) {
   const target = document.querySelector(link.getAttribute('href'));
   target.setAttribute('tabindex','-1');
   target.focus({preventScroll:true});
  }
 }));
 document.addEventListener('click', event => {
  if (expanded && !guide.contains(event.target) && !toggle.contains(event.target)) closeMenu();
 });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && expanded) { event.preventDefault(); closeMenu(true); }
 });
 window.addEventListener('scroll', scheduleUpdate, {passive:true});
 window.addEventListener('resize', scheduleUpdate, {passive:true});
 window.addEventListener('hashchange', scheduleUpdate);
 window.addEventListener('load', scheduleUpdate);
 desktop.addEventListener('change', scheduleUpdate);
 if (window.ResizeObserver) new ResizeObserver(scheduleUpdate).observe(region);
 if (mainMenu && window.MutationObserver) new MutationObserver(scheduleUpdate).observe(mainMenu,{attributes:true,attributeFilter:['class']});
 update();

 // Carry a visitor's chosen project type into the existing contact form.
 const interests = {
  'service-business': 'Service business website',
  'roofing': 'Roofing website',
  'hvac': 'Heating & air website',
  'plumbing': 'Plumbing website',
  'restaurant': 'Restaurant website',
  'online-store': 'Online store',
  'real-estate': 'Real estate website'
 };
 const params = new URLSearchParams(window.location.search);
 const demos = {
  ridgeline: {name:'Ridgeline Roofing Co.', project:'roofing'},
  northline: {name:'Northline Heating & Air', project:'hvac'},
  clearflow: {name:'Clearflow Plumbing', project:'plumbing'},
  'kape-ni-lola': {name:'Kape Ni Lola', project:'restaurant'},
  bytestore: {name:'ByteStore', project:'online-store'},
  primeestates: {name:'PrimeEstates', project:'real-estate'}
 };
 const demoKey = params.get('demo');
 const demo = Object.prototype.hasOwnProperty.call(demos,demoKey) ? demos[demoKey] : null;
 const projectKey = demo ? demo.project : params.get('project');
 const interest = Object.prototype.hasOwnProperty.call(interests,projectKey) ? interests[projectKey] : null;
 const message = document.querySelector('#contact-form textarea[name="message"]');
 if (interest && message) {
  if (!message.value.trim()) message.value = `I'm interested in a ${interest.toLowerCase()}.${demo ? ` I viewed the ${demo.name} demo and would like to discuss a website for my business.` : ''}\n\nMy business: \nWhat I need: \n`;
  const note = document.createElement('p');
  note.className = 'project-interest-note';
  note.textContent = `Your project interest: ${interest}${demo ? ` · Inspired by ${demo.name}` : ''}`;
  const selectedProject = document.createElement('input');
  selectedProject.type = 'hidden'; selectedProject.name = 'project_type'; selectedProject.value = interest;
  message.closest('form').append(selectedProject);
  if (demo) {
   const selectedDemo = document.createElement('input');
   selectedDemo.type = 'hidden'; selectedDemo.name = 'selected_demo'; selectedDemo.value = demo.name;
   message.closest('form').append(selectedDemo);
  }
  message.closest('form').prepend(note);
 }
})();
