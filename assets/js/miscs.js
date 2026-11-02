(() => {
  'use strict';
  const data = JSON.parse(document.getElementById('miscs-data').textContent);
  const $ = id => document.getElementById(id);
  const previewObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const image = entry.target;
      image.src = image.dataset.src;
      previewObserver.unobserve(image);
    });
  }, {rootMargin: '160px'});
  function showPreview(image, src) {
    image.dataset.src = src;
    previewObserver.unobserve(image);
    previewObserver.observe(image);
  }
  document.querySelectorAll('img[data-src]').forEach(image => previewObserver.observe(image));
  const dialog = $('photo-dialog');
  function enlarge(src, caption) {
    $('dialog-photo').src = src;
    $('dialog-photo').alt = caption;
    $('dialog-caption').textContent = caption;
    dialog.showModal();
  }
  $('photo-close').onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  const allPhotos = data.sports.flatMap(group => group.photos);
  const byName = name => allPhotos.find(photo => photo.full.endsWith('/' + name + '.webp'));
  const collage = ['track-3', 'track-1', 'track-2', 'frisbee-1', 'basketball-1', 'jump-rope-1', 'sports-team', 'sports-relay'];
  collage.forEach((name, i) => {
    const photo = byName(name);
    const figure = document.createElement('figure'), button = document.createElement('button'), image = document.createElement('img');
    figure.className = 'collage-photo collage-' + (i + 1);
    button.className = 'photo-open'; button.setAttribute('aria-label', `Enlarge: ${photo.caption}`);
    showPreview(image, photo.src); image.alt = photo.caption; image.decoding = 'async';
    button.append(image); button.onclick = () => enlarge(photo.full, photo.caption);
    figure.append(button); $('sports-wall').append(figure);
  });
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
    const scale = Math.min(map.clientWidth / view[2], map.clientHeight / view[3]);
    const radius = 3.8 / Math.max(scale, .1);
    [...pins.children].forEach((pin, i) => {
      pin.setAttribute('aria-pressed', String(i === destination));
      pin.querySelector('.pin-hit').setAttribute('r', radius * 2.4);
      pin.querySelector('.pin-halo').setAttribute('r', radius * 1.8);
      pin.querySelector('.pin-dot').setAttribute('r', radius * .7);
    });
    const [x,y] = xy(data.travel[destination]);
    const visible = x >= view[0] && x <= view[0]+view[2] && y >= view[1] && y <= view[1]+view[3];
    const endX = view[0] + view[2], dx = Math.max(0, endX - x);
    const endY = y * .65 + (view[1] + view[3] * .52) * .35;
    $('map-guide').setAttribute('d', visible ? `M${x},${y} C${x+dx*.42},${y} ${endX-dx*.25},${endY} ${endX},${endY}` : '');
  }
  function selectDestination(i) {
    destination = (i + data.travel.length) % data.travel.length;
    const item = data.travel[destination];
    const [x,y] = xy(item), view = regions[region];
    if (x < view[0] || x > view[0]+view[2] || y < view[1] || y > view[1]+view[3]) region = 'world';
    showPreview($('travel-photo'), item.src); $('travel-photo').alt = item.title;
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
  document.querySelector('.travel-photo').onclick = () => enlarge(data.travel[destination].full || data.travel[destination].src, data.travel[destination].title);
  selectDestination(destination);
  window.addEventListener('resize', showMap);
  const strip = document.querySelector('.experience-strip');
  function scrollExperiences(direction) { strip.scrollBy({left: direction * (strip.clientWidth * .8), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); }
  $('experience-prev').onclick = () => scrollExperiences(-1);
  $('experience-next').onclick = () => scrollExperiences(1);
  strip.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); scrollExperiences(e.key === 'ArrowRight' ? 1 : -1); } });
  document.querySelectorAll('[data-experience]').forEach(b => b.onclick = () => { const p = data.experiences[Number(b.dataset.experience)]; enlarge(p.full || p.src, p.title); });
})();
