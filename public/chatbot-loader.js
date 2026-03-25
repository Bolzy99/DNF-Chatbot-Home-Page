/**
 * DNF Chatbot Loader — v2.1
 * Includes Top-Left Close Button and Circular Bubble State.
 */
(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  var CHATBOT_URL = 'https://dnfchatbot.bolzard.com/'; 
  var COLLAPSED_W = 'min(420px, calc(100vw - 32px))';
  var COLLAPSED_H = '190px';   
  var EXPANDED_W  = 'min(92vw, 900px)';
  var EXPANDED_H  = '88vh';
  var BUBBLE_SIZE = '60px'; // Size of the circle state
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

  // ─── Create Close Button (Top-Left) ───────────────────────────────────────
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = [
    'position: absolute',
    'top: 15px',
    'left: 15px',
    'width: 32px',
    'height: 32px',
    'border-radius: 50%',
    'background: #0f172a',
    'border: none',
    'color: #f59e0b',
    'font-size: 22px',
    'line-height: 1',
    'cursor: pointer',
    'display: flex',
    'align-items: center',
    'justify-content: center',
    'z-index: 100',
    'transition: opacity 0.3s, transform 0.3s',
    'opacity: 0', 
    'pointer-events: none',
    'box-shadow: 0 4px 12px rgba(0,0,0,0.15)'
  ].join(';');

  // ─── Create iframe ────────────────────────────────────────────────────────
  var iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.id  = '__dnf-chatbot-iframe';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = 'width:100%; height:100%; border:none; display:block; background:transparent; transition: opacity 0.5s;';

  // ─── State Actions ────────────────────────────────────────────────────────
  function minimizeToBubble() {
    wrapper.style.width = BUBBLE_SIZE;
    wrapper.style.height = BUBBLE_SIZE;
    wrapper.style.borderRadius = '50%';
    closeBtn.style.opacity = '0';
    closeBtn.style.pointerEvents = 'none';
    iframe.style.opacity = '0'; // Hide content in bubble mode
  }

  closeBtn.onclick = function(e) {
    e.stopPropagation();
    minimizeToBubble();
  };

  // Click bubble to restore to pill state
  wrapper.onclick = function() {
    if (wrapper.style.width === BUBBLE_SIZE) {
      wrapper.style.width = COLLAPSED_W;
      wrapper.style.height = COLLAPSED_H;
      wrapper.style.borderRadius = '56px';
      iframe.style.opacity = '1';
    }
  };

  wrapper.appendChild(closeBtn);
  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  // ─── Message bridge ───────────────────────────────────────────────────────
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data.action === 'undefined') return;

    if (e.data.action === 'expand') {
      wrapper.style.width         = EXPANDED_W;
      wrapper.style.height        = EXPANDED_H;
      wrapper.style.borderRadius  = '40px';
      iframe.style.opacity        = '1';
      closeBtn.style.opacity      = '1';
      closeBtn.style.pointerEvents = 'auto';
      iframe.setAttribute('scrolling', 'yes');
    }

    if (e.data.action === 'collapse') {
      wrapper.style.width         = COLLAPSED_W;
      wrapper.style.height        = COLLAPSED_H;
      wrapper.style.borderRadius  = '56px';
      iframe.style.opacity        = '1';
      closeBtn.style.opacity      = '0';
      closeBtn.style.pointerEvents = 'none';
      iframe.setAttribute('scrolling', 'no');
    }
  });

  // ─── Mobile Styles ────────────────────────────────────────────────────────
  function applyMobileStyles() {
    if (window.innerWidth <= 640) {
      EXPANDED_W = '100vw';
      EXPANDED_H = '100dvh';
      BOTTOM     = '0px';
      RIGHT      = '0px';
      COLLAPSED_W = '100vw';
      COLLAPSED_H = '110px';
      // Only apply if not currently in bubble mode
      if (wrapper.style.width !== BUBBLE_SIZE) {
         wrapper.style.bottom = BOTTOM;
         wrapper.style.right = RIGHT;
      }
    }
  }
  applyMobileStyles();
  window.addEventListener('resize', applyMobileStyles);

})();
