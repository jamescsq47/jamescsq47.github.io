(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('miscs-data').textContent);
  const $ = id => document.getElementById(id);
  const dialog = $('photo-dialog');
  function enlarge(src, caption) {
    $('dialog-photo').src = src;
    $('dialog-photo').alt = caption;
    $('dialog-caption').textContent = caption;
    dialog.showModal();
  }
  $('photo-close').onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  let sport = 0, sportPhoto = 0;
  const sportTabs = document.querySelector('.sport-tabs');
  data.sports.forEach((item, i) => {
    const button = document.createElement('button');
    button.textContent = item.title;
    button.onclick = () => { sport = i; sportPhoto = 0; showSport(); };
    sportTabs.append(button);
  });
  function showSport() {
    const item = data.sports[sport], photo = item.photos[sportPhoto];
    [...sportTabs.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === sport)));
    $('sports-photo').src = photo.src;
    $('sports-photo').alt = photo.caption;
    $('sports-caption').textContent = photo.caption;
    $('sports-count').textContent = `${sportPhoto + 1} / ${item.photos.length}`;
    $('sports-thumbs').replaceChildren();
    item.photos.forEach((p, i) => {
      const b = document.createElement('button'), image = document.createElement('img');
      image.src = p.src; image.alt = p.caption;
      b.setAttribute('aria-label', `Show ${p.caption}`);
      b.setAttribute('aria-pressed', String(i === sportPhoto));
      b.append(image); b.onclick = () => { sportPhoto = i; showSport(); };
      $('sports-thumbs').append(b);
    });
  }
  document.querySelector('.sports-main').onclick = () => {
    const p = data.sports[sport].photos[sportPhoto]; enlarge(p.src, p.caption);
  };
  showSport();
  const ns = 'http://www.w3.org/2000/svg', pins = $('map-pins'), map = $('travel-map');
  const regions = { world: [0, 0, 800, 365], asia: [555, 75, 155, 155], america: [95, 70, 175, 145] };
  let destination = data.travel.findIndex(p => p.title === 'Boston'), region = 'world';
  function xy(item) { return [(item.lon + 180) * 800 / 360, (90 - item.lat) * 400 / 180]; }
  data.travel.forEach((item, i) => {
    const [x, y] = xy(item), g = document.createElementNS(ns, 'g');
    g.classList.add('map-pin'); g.setAttribute('transform', `translate(${x},${y})`);
    g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `View ${item.title}`);
    const hit = document.createElementNS(ns, 'circle'); hit.classList.add('pin-hit');
    const halo = document.createElementNS(ns, 'circle'); halo.classList.add('pin-halo');
    const dot = document.createElementNS(ns, 'circle'); dot.classList.add('pin-dot');
    const title = document.createElementNS(ns, 'title'); title.textContent = item.title;
    g.append(title, hit, halo, dot);
    g.onclick = () => selectDestination(i);
    g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDestination(i); } };
    pins.append(g);
    const b = document.createElement('button'); b.textContent = item.title;
    b.onclick = () => selectDestination(i); $('destination-list').append(b);
  });
  function showMap() {
    const view = regions[region]; map.setAttribute('viewBox', view.join(' '));
    document.querySelectorAll('[data-region]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.region === region)));
    const radius = view[2] / 145;
    [...pins.children].forEach((pin, i) => {
      pin.setAttribute('aria-pressed', String(i === destination));
      pin.querySelector('.pin-hit').setAttribute('r', radius * 2.4);
      pin.querySelector('.pin-halo').setAttribute('r', radius * 1.8);
      pin.querySelector('.pin-dot').setAttribute('r', radius * .7);
    });
    const [x,y] = xy(data.travel[destination]);
    const visible = x >= view[0] && x <= view[0]+view[2] && y >= view[1] && y <= view[1]+view[3];
    $('map-guide').setAttribute('d', visible ? `M${x},${y} Q${x+view[2]*.14},${y-view[3]*.15} ${view[0]+view[2]},${view[1]+view[3]*.6}` : '');
  }
  function selectDestination(i) {
    destination = (i + data.travel.length) % data.travel.length;
    const item = data.travel[destination];
    const [x,y] = xy(item), view = regions[region];
    if (x < view[0] || x > view[0]+view[2] || y < view[1] || y > view[1]+view[3]) region = 'world';
    $('travel-photo').src = item.src; $('travel-photo').alt = item.title;
    $('travel-title').textContent = item.title;
    [...$('destination-list').children].forEach((b, j) => b.setAttribute('aria-pressed', String(j === destination)));
    showMap();
  }
  document.querySelectorAll('[data-region]').forEach(b => b.onclick = () => {
    region = b.dataset.region;
    if (region === 'asia') destination = data.travel.findIndex(p => p.title === 'Chongqing');
    if (region === 'america') destination = data.travel.findIndex(p => p.title === 'Seattle');
    selectDestination(destination);
  });
  $('travel-prev').onclick = () => selectDestination(destination-1);
  $('travel-next').onclick = () => selectDestination(destination+1);
  document.querySelector('.travel-photo').onclick = () => enlarge(data.travel[destination].src, data.travel[destination].title);
  selectDestination(destination);
  const strip = document.querySelector('.experience-strip');
  function scrollExperiences(direction) { strip.scrollBy({left: direction * (strip.clientWidth * .8), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); }
  $('experience-prev').onclick = () => scrollExperiences(-1);
  $('experience-next').onclick = () => scrollExperiences(1);
  strip.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); scrollExperiences(e.key === 'ArrowRight' ? 1 : -1); } });
  document.querySelectorAll('[data-experience]').forEach(b => b.onclick = () => { const p = data.experiences[Number(b.dataset.experience)]; enlarge(p.src, p.title); });
})();
