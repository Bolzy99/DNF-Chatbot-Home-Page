/**
 * DNF Chatbot Loader — v2.0
 * Drop-in embed script. No client-side setup required.
 * Paste ONE <script> tag. Done.
 */
(function () {
  'use strict';

  // ─── Config ───────────────────────────────────────────────────────────────
  var CHATBOT_URL = 'https://dnfchatbot.bolzard.com/'; // ← change to your hosted URL
  var COLLAPSED_W = 'min(420px, calc(100vw - 32px))';
  var COLLAPSED_H = '100px';   // height in closed state — just enough for the pill
  var EXPANDED_W  = 'min(92vw, 900px)';
  var EXPANDED_H  = '88vh';
  var BOTTOM      = '24px';
  var RIGHT       = '16px';
  var Z_INDEX     = '2147483647'; // max z-index, above everything
  var TRANSITION  = 'width 0.55s cubic-bezier(0.22,1,0.36,1), height 0.55s cubic-bezier(0.22,1,0.36,1), border-radius 0.55s ease';

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
    'pointer-events: auto',   // wrapper is clickable
    'box-shadow: 0 8px 40px rgba(0,0,0,0.18)',
  ].join(';');

  // ─── Create iframe ────────────────────────────────────────────────────────
  var iframe = document.createElement('iframe');
  iframe.src = CHATBOT_URL;
  iframe.id  = '__dnf-chatbot-iframe';
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.style.cssText = [
    'width: 100%',
    'height: 100%',
    'border: none',
    'display: block',
    'background: transparent',
  ].join(';');

  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  // ─── Message bridge ───────────────────────────────────────────────────────
  window.addEventListener('message', function (e) {
    // Only trust messages from our chatbot origin
    // Loosened to '*' for flexibility; tighten in production:
    // if (e.origin !== 'https://dnfchatbot.bolzard.com/') return;

    if (!e.data || typeof e.data.action === 'undefined') return;

    if (e.data.action === 'expand') {
      wrapper.style.width         = EXPANDED_W;
      wrapper.style.height        = EXPANDED_H;
      wrapper.style.borderRadius  = '40px';
      wrapper.style.bottom        = BOTTOM;
      wrapper.style.right         = RIGHT;
      // While expanded the iframe needs scroll
      iframe.setAttribute('scrolling', 'yes');
    }

    if (e.data.action === 'collapse') {
      wrapper.style.width         = COLLAPSED_W;
      wrapper.style.height        = COLLAPSED_H;
      wrapper.style.borderRadius  = '56px';
      iframe.setAttribute('scrolling', 'no');
    }

    // Legacy pointer-events helpers (no-op when using this loader, kept for safety)
    if (e.data.action === 'enableClicks')  wrapper.style.pointerEvents = 'auto';
    if (e.data.action === 'disableClicks') wrapper.style.pointerEvents = 'auto'; // always clickable in this model
  });

  // ─── Mobile: full-screen when expanded ───────────────────────────────────
  function applyMobileStyles() {
    if (window.innerWidth <= 640) {
      EXPANDED_W = '100vw';
      EXPANDED_H = '100dvh';
      BOTTOM     = '0px';
      RIGHT      = '0px';
      COLLAPSED_W = '100vw';
      COLLAPSED_H = '90px';
      wrapper.style.width  = COLLAPSED_W;
      wrapper.style.height = COLLAPSED_H;
      wrapper.style.bottom = BOTTOM;
      wrapper.style.right  = RIGHT;
      wrapper.style.borderRadius = '24px 24px 0 0';
    }
  }
  applyMobileStyles();
  window.addEventListener('resize', applyMobileStyles);

})();
