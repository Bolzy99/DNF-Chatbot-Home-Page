/**
 * DNF Chatbot Loader — v2.5
 * Optimization: GPU-Accelerated Scale Transitions (No Layout Thrashing)
 */
(function () {
  'use strict';

  var CHATBOT_URL = 'https://dnfchatbot.bolzard.com/'; 
  var EXPANDED_W  = 'min(92vw, 900px)';
  var EXPANDED_H  = '88vh';
  var COLLAPSED_W = 420; // Target width for pill
  var COLLAPSED_H = 190; // Target height for pill
  var BUBBLE_SIZE = 70;  // Target size for bubble
  
  var Z_INDEX     = '2147483647';
  // Use a cleaner, slightly faster cubic-bezier
  var TRANSITION  = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), border-radius 0.5s ease, background 0.3s ease';

  var wrapper = document.createElement('div');
  wrapper.id = '__dnf-chatbot-wrapper';
  
  // Initial styles: We set it to expanded size but scale it down immediately
  wrapper.style.cssText = [
    'position: fixed',
    'bottom: 24px',
    'right: 24px',
    'width: ' + EXPANDED_W,
    'height: ' + EXPANDED_H,
    'z-index: ' + Z_INDEX,
    'border-radius: 56px',
    'overflow: hidden',
    'transition: ' + TRANSITION,
    'transform-origin: bottom right',
    'box-shadow: 0 12px 48px rgba(0,0,0,0.15)',
    'background: white no-repeat center / 0%',
    'cursor: pointer',
    'will-change: transform',
    'pointer-events: auto'
  ].join(';');

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  closeBtn.style.cssText = 'position:absolute; top:12px; right:12px; width:32px; height:32px; border-radius:50%; background:#f1f5f9; border:none; color:#64748b; cursor:pointer; display:none; align-items:center; justify-content:center; z-index:100; opacity:0; transition:opacity 0.2s;';

  var iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.style.cssText = 'width:100%; height:100%; border:none; display:block; background:transparent; transition:opacity 0.3s;';

  var isBubble = false;

  // ─── The Smooth "Pill" Calculation ───────────────────────────────────────
  // Because we use scale, we calculate the ratio between expanded and target
  function updateState() {
    var isExpanded = iframe.getAttribute('scrolling') === 'yes';
    var rect = wrapper.getBoundingClientRect();
    var currentW = rect.width;
    var currentH = rect.height;

    if (isBubble) {
      var s = BUBBLE_SIZE / 900; // Scale relative to max width
      wrapper.style.transform = 'scale(' + s + ')';
      wrapper.style.borderRadius = '50%';
      wrapper.style.backgroundColor = '#0f172a';
      wrapper.style.backgroundImage = "url('https://cdn-icons-png.flaticon.com/512/2040/2040946.png')";
      wrapper.style.backgroundSize = '60%';
      iframe.style.opacity = '0';
      closeBtn.style.display = 'none';
    } else if (isExpanded) {
      wrapper.style.transform = 'scale(1)';
      wrapper.style.borderRadius = (window.innerWidth <= 640) ? '0px' : '40px';
      wrapper.style.backgroundImage = 'none';
      iframe.style.opacity = '1';
      closeBtn.style.display = 'none';
    } else {
      // Pill State
      var scaleX = 420 / 900;
      var scaleY = 190 / (window.innerHeight * 0.88);
      wrapper.style.transform = 'scale(' + scaleX + ', ' + scaleY + ')';
      wrapper.style.borderRadius = '80px'; 
      wrapper.style.backgroundColor = 'white';
      wrapper.style.backgroundImage = 'none';
      iframe.style.opacity = '1';
      
      if (window.innerWidth <= 640) {
        closeBtn.style.display = 'flex';
        setTimeout(function() { closeBtn.style.opacity = '1'; }, 50);
      }
    }
  }

  closeBtn.onclick = function(e) { e.stopPropagation(); isBubble = true; updateState(); };
  wrapper.onclick = function() { if (isBubble) { isBubble = false; updateState(); } };

  window.addEventListener('message', function (e) {
    if (e.data.action === 'expand') { iframe.setAttribute('scrolling', 'yes'); updateState(); }
    if (e.data.action === 'collapse') { iframe.setAttribute('scrolling', 'no'); updateState(); }
  });

  // Initial call
  setTimeout(updateState, 100);

  wrapper.appendChild(closeBtn);
  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  // Mobile Overrides
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 640) {
        wrapper.style.bottom = '0px';
        wrapper.style.right = '0px';
    } else {
        wrapper.style.bottom = '24px';
        wrapper.style.right = '24px';
    }
    updateState();
  });
})();
