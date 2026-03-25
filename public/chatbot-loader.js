/**
 * DNF Chatbot Loader — v2.2
 * Features: Mobile-only close button in collapsed state, shrinking to a circular bubble.
 */
(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  var CHATBOT_URL = 'https://dnfchatbot.bolzard.com/'; 
  var COLLAPSED_W = 'min(420px, calc(100vw - 32px))';
  var COLLAPSED_H = '190px';   
  var EXPANDED_W  = 'min(92vw, 900px)';
  var EXPANDED_H  = '88vh';
  var BUBBLE_SIZE = '66px'; // The circular state size
  var BOTTOM      = '24px';
  var RIGHT       = 'max(16px, env(safe-area-inset-right))';
  var Z_INDEX     = '2147483647';
  var TRANSITION  = 'all 0.55s cubic-bezier(0.22,1,0.36,1)';

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
    'box-shadow: 0 8px 40px rgba(0,0,0,0.18)',
    'background: white' 
  ].join(';');

  // ─── Create Close Button (Top-Right, Mobile Only) ──────────────────────────
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg>';
  closeBtn.style.cssText = [
    'position: absolute',
    'top: 12px',
    'right: 12px',
    'width: 30px',
    'height: 30px',
    'border-radius: 50%',
    'background: #f1f5f9',
    'border: none',
    'color: #64748b',
    'cursor: pointer',
    'display: none', // Controlled by media query logic
    'align-items: center',
    'justify-content: center',
    'z-index: 100',
    'box-shadow: 0 2px 8px rgba(0,0,0,0.05)'
  ].join(';');

  // ─── Create iframe ────────────────────────────────────────────────────────
  var iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.id  = '__dnf-chatbot-iframe';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = 'width:100%; height:100%; border:none; display:block; background:transparent; transition: opacity 0.3s;';

  // ─── State Helpers ────────────────────────────────────────────────────────
  var isBubble = false;

  function showCloseBtn() {
    if (window.innerWidth <= 640 && !isBubble) {
      closeBtn.style.display = 'flex';
    } else {
      closeBtn.style.display = 'none';
    }
  }

  function toggleBubble(e) {
    if (e) e.stopPropagation();
    isBubble = !isBubble;

    if (isBubble) {
      wrapper.style.width = BUBBLE_SIZE;
      wrapper.style.height = BUBBLE_SIZE;
      wrapper.style.borderRadius = '50%';
      iframe.style.opacity = '0';
      closeBtn.style.display = 'none';
      // Adjust positioning for bubble on mobile if needed
      if (window.innerWidth <= 640) {
        wrapper.style.bottom = '20px';
        wrapper.style.right = '20px';
      }
    } else {
      applyCurrentStateDimensions();
      iframe.style.opacity = '1';
      showCloseBtn();
    }
  }

  function applyCurrentStateDimensions() {
    // Check if we are currently expanded or collapsed based on iframe scrolling
    var isExpanded = iframe.getAttribute('scrolling') === 'yes';
    if (isExpanded) {
        wrapper.style.width = EXPANDED_W;
        wrapper.style.height = EXPANDED_H;
        wrapper.style.borderRadius = '40px';
    } else {
        wrapper.style.width = COLLAPSED_W;
        wrapper.style.height = COLLAPSED_H;
        wrapper.style.borderRadius = window.innerWidth <= 640 ? '24px 24px 0 0' : '56px';
    }
    
    if (window.innerWidth <= 640) {
        wrapper.style.bottom = isExpanded ? '0px' : '0px';
        wrapper.style.right = '0px';
    } else {
        wrapper.style.bottom = BOTTOM;
        wrapper.style.right = RIGHT;
    }
  }

  // ─── Event Listeners ──────────────────────────────────────────────────────
  closeBtn.onclick = toggleBubble;
  
  wrapper.onclick = function() {
    if (isBubble) toggleBubble();
  };

  wrapper.appendChild(closeBtn);
  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  // ─── Message bridge ───────────────────────────────────────────────────────
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data.action === 'undefined') return;

    if (e.data.action === 'expand') {
      iframe.setAttribute('scrolling', 'yes');
      if (!isBubble) {
          applyCurrentStateDimensions();
          closeBtn.style.display = 'none'; // Hide when full screen
      }
    }

    if (e.data.action === 'collapse') {
      iframe.setAttribute('scrolling', 'no');
      if (!isBubble) {
          applyCurrentStateDimensions();
          showCloseBtn();
      }
    }
  });

  // ─── Mobile Logic ────────────────────────────────────────────────────────
  function applyResponsiveConfig() {
    if (window.innerWidth <= 640) {
      EXPANDED_W = '100vw';
      EXPANDED_H = '100dvh';
      COLLAPSED_W = '100vw';
      COLLAPSED_H = '110px';
      if (!isBubble) applyCurrentStateDimensions();
    }
    showCloseBtn();
  }

  window.addEventListener('resize', applyResponsiveConfig);
  applyResponsiveConfig();

})();
