// // Simple script for demo interactions
// document.querySelectorAll('.nav-btn, .btn-primary, .btn-yellow, .btn-white').forEach(btn => {
//   btn.addEventListener('click', () => {
//     alert('Application process coming soon!');
//   });
// });


// Contact form submission (demo only)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for contacting CloudTech Analytics! We’ll get back to you soon.');
  });
}

// Contact action buttons: WhatsApp and Email
const whatsappBtn = document.getElementById('whatsappSendBtn');
const emailBtn = document.getElementById('emailSendBtn');
const WA_NUMBER = '2349115591877'; // change to your target number in international format without '+'
const CONTACT_EMAIL = 'cloudtechanalytics.consultant@gmail.com';

function gatherContactData(){
  return {
    name: document.getElementById('contact-name')?.value || '',
    email: document.getElementById('contact-email')?.value || '',
    phone: document.getElementById('contact-phone')?.value || '',
    interest: document.getElementById('contact-interest')?.value || '',
    message: document.getElementById('contact-message')?.value || ''
  };
}

function validateContact(data){
  if(!data.name) return 'Please enter your name';
  if(!data.email && !data.phone) return 'Please provide either an email or phone number so we can reach you';
  return null;
}

if(whatsappBtn){
  whatsappBtn.addEventListener('click', () => {
    const data = gatherContactData();
    const err = validateContact(data);
    if(err){ alert(err); return; }

    const text = `Name: ${data.name}%0AEmail: ${data.email}%0APhone: ${data.phone}%0AInterest: ${data.interest}%0AMessage: ${encodeURIComponent(data.message)}`;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${text}`;
    window.open(waUrl, '_blank');
  });
}

if(emailBtn){
  emailBtn.addEventListener('click', () => {
    const data = gatherContactData();
    const err = validateContact(data);
    if(err){ alert(err); return; }

    const subject = encodeURIComponent(`Enquiry from ${data.name} - ${data.interest || 'General'}`);
    const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nInterest: ${data.interest}\n\nMessage:\n${data.message}`);
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  });
}


// Animated counter example
const counters = document.querySelectorAll('.counter');
counters.forEach(counter => {
  counter.innerText = '0';
  const updateCounter = () => {
    const target = +counter.getAttribute('data-target');
    const c = +counter.innerText;
    const increment = target / 200;
    if(c < target){
      counter.innerText = Math.ceil(c + increment);
      setTimeout(updateCounter, 10);
    } else {
      counter.innerText = target;
    }
  };
  updateCounter();
});

// Lazy-load large images and animate counters when visible
document.addEventListener('DOMContentLoaded', () => {
  const lazyImgs = document.querySelectorAll('img.lazy');
  const counters = document.querySelectorAll('.counter');

  const onIntersect = (entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const img = entry.target.querySelector('img.lazy');
        if(img && img.dataset.src){
          img.src = img.dataset.src;
          img.addEventListener('load', () => img.classList.add('lazy-loaded'));
        }

        // start counters inside this section
        entry.target.querySelectorAll('.counter').forEach(counter => {
          if(!counter.classList.contains('counting')){
            counter.classList.add('counting');
            const target = +counter.getAttribute('data-target');
            let current = 0;
            const step = Math.max(1, Math.floor(target / 200));
            const tick = () => {
              current += step;
              if(current >= target) { counter.innerText = target; }
              else { counter.innerText = current; setTimeout(tick, 12); }
            };
            tick();
          }
        });

        obs.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(onIntersect, { root: null, threshold: 0.25 });
  const partnersSection = document.getElementById('partners');
  if(partnersSection) observer.observe(partnersSection);
});

// Navigation selection handling: hover via CSS already applied; this toggles persistent selection
(function(){
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const getLinkByHash = (hash) => document.querySelector('.navbar-nav .nav-link[href="' + hash + '"]');

  function clearSelections(){
    navLinks.forEach(a => { a.classList.remove('nav-selected-home', 'nav-selected-contact'); });
  }

  function applySelectionForHash(hash){
    clearSelections();
    if(hash === '#home' || hash === '' || hash === '#'){
      const a = getLinkByHash('#home');
      if(a) a.classList.add('nav-selected-home');
    } else if(hash === '#contact'){
      const a = getLinkByHash('#contact');
      if(a) a.classList.add('nav-selected-contact');
    } else {
      // no special selection for other pages — keep Bootstrap's active logic
      const a = getLinkByHash(hash);
      if(a) a.classList.add('nav-selected-home');
    }
  }

  // Initialize based on current hash
  applySelectionForHash(window.location.hash || '#home');

  // When nav links are clicked, update selection and allow normal anchor behavior
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      // small timeout to allow the hash to change
      setTimeout(() => applySelectionForHash(window.location.hash || '#home'), 50);
    });
  });

  // Also listen for back/forward navigation
  window.addEventListener('hashchange', () => applySelectionForHash(window.location.hash || '#home'));
})();


// Hero image rotator + background toggle
(function(){
  const media = document.querySelector('.hero-media');
  if(!media) return;

  const mainImg = media.querySelector('.hero-main');
  const thumbs = Array.from(media.querySelectorAll('.thumb-item'));
  const prevBtn = media.querySelector('.hero-prev');
  const nextBtn = media.querySelector('.hero-next');

  // gather images by data-index
  const imgs = [];
  if(mainImg && mainImg.dataset.index) imgs[+mainImg.dataset.index] = mainImg.src;
  thumbs.forEach(t => { if(t.dataset.index) imgs[+t.dataset.index] = t.src; });

  // if there are no images available, bail out to avoid runtime errors (modulo by zero etc.)
  const hasAnyImage = imgs.some(src => !!src);
  if (!imgs.length || !hasAnyImage) return;

  let current = 0;

  function markActiveThumb(idx){
    thumbs.forEach(t => t.classList.toggle('active', +t.dataset.index === idx));
  }

  function isImageHealthy(src){
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function showImage(idx){
    // wrap index
    idx = ((idx % imgs.length) + imgs.length) % imgs.length;

    // find next healthy image if the current is broken
    let attempts = 0;
    let candidate = idx;
    while(attempts < imgs.length){
      const src = imgs[candidate];
      // skip undefined or empty
      if(src){
        // check image health
        // small timeout to avoid slow network blocking — but we still await result
        // if broken, try next
        // eslint-disable-next-line no-await-in-loop
        const ok = await isImageHealthy(src);
        if(ok){ idx = candidate; break; }
      }
      candidate = (candidate + 1) % imgs.length;
      attempts++;
    }

    current = idx;

    const src = imgs[current];
      // Always use background cover for the hero column so the image covers the area
      media.classList.add('bg-mode');
      media.style.backgroundImage = src ? `url("${src}")` : 'none';

    markActiveThumb(current);
  }

  // wire buttons
  if(prevBtn) prevBtn.addEventListener('click', () => showImage(current - 1));
  if(nextBtn) nextBtn.addEventListener('click', () => showImage(current + 1));

  // thumbnail clicks
  thumbs.forEach(t => t.addEventListener('click', () => showImage(+t.dataset.index)));


  // initialize
  showImage(0);
})();
