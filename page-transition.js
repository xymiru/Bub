/* Petal-bloom page transition. Works on index.html and monthsary.html.
   Any link with data-transition="bloom" plays the animation, then navigates. */
(function () {
  var PETAL = '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12 2c2 3 2 6 0 8-2-2-2-5 0-8zm0 12c2 3 2 6 0 8-2-2-2-5 0-8zM2 12c3-2 6-2 8 0-2 2-5 2-8 0zm12 0c3-2 6-2 8 0-2 2-5 2-8 0z"/></svg>';
  var COLORS = ['#F3CFD9', '#E8A0B4', '#C96A7A', '#C89B6A', '#F9E8C8'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'mt-arrive';

  var css = '.mt-overlay{position:fixed;left:0;top:0;width:100%;height:100%;z-index:9999;pointer-events:none;' +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:#FCF6F5;text-align:center;' +
    'background:radial-gradient(ellipse 900px 600px at 50% 20%,rgba(200,80,100,.55),transparent 60%),linear-gradient(145deg,#3A0D18,#6B1424,#3A0D18);' +
    '-webkit-clip-path:circle(0px at 50% 50%);clip-path:circle(0px at 50% 50%);' +
    '-webkit-transition:-webkit-clip-path .85s cubic-bezier(.65,0,.25,1);transition:clip-path .85s cubic-bezier(.65,0,.25,1)}' +
    '.mt-overlay.mt-on{pointer-events:all}' +
    '.mt-overlay .mt-mark{width:54px;height:54px;color:#F3CFD9;opacity:0;-webkit-transform:scale(.4) rotate(-40deg);transform:scale(.4) rotate(-40deg);transition:opacity .5s ease .3s,transform .8s cubic-bezier(.2,.9,.3,1.3) .3s}' +
    '.mt-overlay .mt-text{font-family:Fraunces,Georgia,serif;font-style:italic;font-size:clamp(1.5rem,5vw,2.4rem);opacity:0;transition:opacity .5s ease .5s}' +
    '.mt-overlay.mt-show .mt-mark{opacity:1;-webkit-transform:scale(1) rotate(0);transform:scale(1) rotate(0)}' +
    '.mt-overlay.mt-show .mt-text{opacity:1}' +
    '.mt-petal{position:fixed;z-index:10000;pointer-events:none;will-change:transform,opacity}';
  var style = document.createElement('style');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'mt-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<div class="mt-mark">' + PETAL + '</div><div class="mt-text">our monthsary</div>';
  document.documentElement.appendChild(overlay);

  function setClip(x, y, r) {
    var v = 'circle(' + r + ' at ' + x + 'px ' + y + 'px)';
    overlay.style.webkitClipPath = v;
    overlay.style.clipPath = v;
  }

  function burst(x, y, count) {
    if (reduce || !document.body || !document.body.animate) return;
    count = count || 26;
    for (var i = 0; i < count; i++) {
      var p = document.createElement('span');
      var size = 14 + Math.random() * 18;
      p.className = 'mt-petal';
      p.style.left = x - size / 2 + 'px';
      p.style.top = y - size / 2 + 'px';
      p.style.width = p.style.height = size + 'px';
      p.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      p.innerHTML = PETAL;
      document.body.appendChild(p);
      var ang = Math.random() * Math.PI * 2;
      var dist = 90 + Math.random() * 220;
      var dx = Math.cos(ang) * dist;
      var dy = Math.sin(ang) * dist + 120;
      var rot = (Math.random() - 0.5) * 540;
      var a = p.animate([
        { transform: 'translate(0,0) rotate(0deg) scale(.6)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg) scale(1)', opacity: 0 }
      ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
      (function (el) { a.onfinish = function () { el.remove(); }; })(p);
    }
  }

  function playOut(href, x, y) {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    burst(x, y, 22);
    overlay.classList.add('mt-on');
    setClip(x, y, '0px');
    void overlay.offsetWidth; // force reflow so the transition runs
    setClip(x, y, '150vmax');
    setTimeout(function () { overlay.classList.add('mt-show'); }, 150);
    setTimeout(function () { window.location.href = href; }, reduce ? 150 : 1250);
  }

  function playIn() {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    overlay.style.transition = 'none';
    overlay.style.webkitTransition = 'none';
    overlay.classList.add('mt-show');
    setClip(cx, cy, '150vmax');
    void overlay.offsetWidth;
    overlay.style.transition = '';
    overlay.style.webkitTransition = '';
    setTimeout(function () {
      overlay.classList.remove('mt-show');
      setClip(cx, cy, '0px');
      setTimeout(function () { burst(cx, cy * 0.7, 36); }, reduce ? 0 : 500);
    }, reduce ? 50 : 500);
  }

  function reset() {
    overlay.classList.remove('mt-on', 'mt-show');
    setClip(0, 0, '0px');
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[data-transition]') : null;
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    var r = a.getBoundingClientRect();
    var x = e.clientX || r.left + r.width / 2;
    var y = e.clientY || r.top + r.height / 2;
    playOut(a.href, x, y);
  });

  // back/forward cache (iOS Safari / Chrome) can restore the page mid-animation
  window.addEventListener('pageshow', function (e) { if (e.persisted) reset(); });

  var arriving = false;
  try { arriving = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (e) {}
  if (arriving && document.body === null) {
    // script is in <head>: cover the page immediately, then open once loaded
    overlay.style.transition = 'none';
    setClip(window.innerWidth / 2, window.innerHeight / 2, '150vmax');
    overlay.classList.add('mt-show');
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(function () { overlay.style.transition = ''; playIn(); });
    });
  } else if (arriving) {
    playIn();
  }

  window.MT = { burst: burst };
})();
