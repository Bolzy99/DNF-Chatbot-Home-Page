/**
 * DNF Chatbot Loader — v2.4
 * Optimization: High-performance hardware-accelerated transitions.
 */
(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  var CHATBOT_URL = 'https://dnfchatbot.bolzard.com/'; 
  var COLLAPSED_W = 'min(420px, calc(100vw - 32px))';
  var COLLAPSED_H = '190px';   
  var EXPANDED_W  = 'min(92vw, 900px)';
  var EXPANDED_H  = '88vh';
  var BUBBLE_SIZE = '70px'; 
  var BOTTOM      = '24px';
  var RIGHT       = 'max(16px, env(safe-area-inset-right))';
  var Z_INDEX     = '2147483647';
  
  // OPTIMIZED: Using 'all' can be heavy; we use a slightly faster easing
  var TRANSITION  = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

  // ─── Create wrapper div ───────────────────────────────────────────────────
  var wrapper = document.createElement('div');
  wrapper.id = '__dnf-chatbot-wrapper';
  wrapper.style.cssText = [
    'position: fixed',
    'bottom: ' + BOTTOM,
    'right: ' + RIGHT,
    'width: ' + COLLAPSED_W,
    'height: ' + COLLAPSED_H,
    'z-index: ' + Z_INDEX,
    'border-radius: 56px',
    'overflow: hidden',
    'transition: ' + TRANSITION,
    'pointer-events: auto',
    'box-shadow: 0 12px 48px rgba(0,0,0,0.15)',
    'background-color: white',
    'background-repeat: no-repeat',
    'background-position: center',
    'background-size: 0%', // Start at 0 to avoid pop-in
    'cursor: pointer',
    'will-change: width, height, border-radius', // Hardware acceleration hint
    '-webkit-backface-visibility: hidden',
    'backface-visibility: hidden'
  ].join(';');

  // ─── Create Close Button (Top-Right) ──────────────────────────────────────
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  closeBtn.style.cssText = [
    'position: absolute',
    'top: 12px',
    'right: 12px',
    'width: 32px',
    'height: 32px',
    'border-radius: 50%',
    'background: #f1f5f9',
    'border: none',
    'color: #64748b',
    'cursor: pointer',
    'display: none', 
    'align-items: center',
    'justify-content: center',
    'z-index: 100',
    'opacity: 0',
    'transition: opacity 0.3s ease'
  ].join(';');

  // ─── Create iframe ────────────────────────────────────────────────────────
  var iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.id  = '__dnf-chatbot-iframe';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = 'width:100%; height:100%; border:none; display:block; background:transparent; transition: opacity 0.4s ease;';

  var isBubble = false;

  function setBubbleState() {
    isBubble = true;
    wrapper.style.width = BUBBLE_SIZE;
    wrapper.style.height = BUBBLE_SIZE;
    wrapper.style.borderRadius = '50%';
    wrapper.style.backgroundColor = '#0f172a';
    wrapper.style.backgroundImage = "url('https://cdn-icons-png.flaticon.com/512/2040/2040946.png')";
    wrapper.style.backgroundSize = '60%'; // Icon appears smoothly
    
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    closeBtn.style.display = 'none';

    if (window.innerWidth <= 640) {
      wrapper.style.bottom = '24px';
      wrapper.style.right = '24px';
    }
  }

  function restoreFromBubble() {
    isBubble = false;
    wrapper.style.backgroundImage = 'none';
    wrapper.style.backgroundSize = '0%';
    wrapper.style.backgroundColor = 'white';
    iframe.style.opacity = '1';
    iframe.style.pointerEvents = 'auto';
    applyCurrentStateDimensions();
    updateCloseBtnVisibility();
  }

  function applyCurrentStateDimensions() {
    var isExpanded = iframe.getAttribute('scrolling') === 'yes';
    if (isExpanded) {
        wrapper.style.width = EXPANDED_W;
        wrapper.style.height = EXPANDED_H;
        wrapper.style.borderRadius = (window.innerWidth <= 640) ? '0px' : '40px';
    } else {
        wrapper.style.width = COLLAPSED_W;
        wrapper.style.height = COLLAPSED_H;
        wrapper.style.borderRadius = (window.innerWidth <= 640) ? '24px 24px 0 0' : '56px';
    }
    
    if (window.innerWidth <= 640) {
        wrapper.style.bottom = '0px';
        wrapper.style.right = '0px';
    } else {
        wrapper.style.bottom = BOTTOM;
        wrapper.style.right = RIGHT;
    }
  }

  function updateCloseBtnVisibility() {
    var isExpanded = iframe.getAttribute('scrolling') === 'yes';
    if (window.innerWidth <= 640 && !isBubble && !isExpanded) {
      closeBtn.style.display = 'flex';
      setTimeout(function() { closeBtn.style.opacity = '1'; }, 10);
    } else {
      closeBtn.style.opacity = '0';
      setTimeout(function() { closeBtn.style.display = 'none'; }, 300);
    }
  }

  closeBtn.onclick = function(e) {
    e.stopPropagation();
    setBubbleState();
  };
  
  wrapper.onclick = function() {
    if (isBubble) restoreFromBubble();
  };

  wrapper.appendChild(closeBtn);
  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data.action === 'undefined') return;

    if (e.data.action === 'expand') {
      iframe.setAttribute('scrolling', 'yes');
      if (!isBubble) {
        applyCurrentStateDimensions();
        updateCloseBtnVisibility();
      }
    }

    if (e.data.action === 'collapse') {
      iframe.setAttribute('scrolling', 'no');
      if (!isBubble) {
          applyCurrentStateDimensions();
          updateCloseBtnVisibility();
      }
    }
  });

  function applyResponsiveConfig() {
    if (window.innerWidth <= 640) {
      EXPANDED_W = '100vw';
      EXPANDED_H = '100dvh';
      COLLAPSED_W = '100vw';
      COLLAPSED_H = '110px';
      if (!isBubble) applyCurrentStateDimensions();
    }
    updateCloseBtnVisibility();
  }

  window.addEventListener('resize', applyResponsiveConfig);
  applyResponsiveConfig();

})();
