import './style.css'
/**
 * DNF Chatbot — Concierge Core v2.0
 * Key change: postMessage('expand' / 'collapse') drives iframe resize from parent loader.
 * The iframe itself no longer needs to be large when closed.
 */

// --- 0. INJECT REVEAL ANIMATION STYLES ---
const style = document.createElement('style');
style.textContent = `
    * { box-sizing: border-box; }
    #chat-history {
        user-select: none;
        cursor: default;
    }
    @keyframes geminiReveal {
        from { opacity: 0; transform: translateY(4px); filter: blur(2px); }
        to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    .word-reveal {
        display: inline-block;
        white-space: pre-wrap;
        animation: geminiReveal 0.4s ease-out forwards;
    }
    /* Collapsed pill: hide overflow, ensure body fits snugly */
    body.is-collapsed {
        overflow: hidden;
    }
    body.is-expanded {
        overflow: hidden; /* iframe handles its own scroll */
    }
`;
document.head.appendChild(style);

// --- ELEMENT SELECTORS ---
const chatHub          = document.getElementById('chat-hub');
const hookText         = document.getElementById('hook-text');
const subText          = document.getElementById('sub-text');
const textStage        = document.getElementById('text-stage');
const chatHistory      = document.getElementById('chat-history');
const chatForm         = document.getElementById('chat-form');
const userInput        = document.getElementById('user-input');
const minimizeBtn      = document.getElementById('minimize-btn');
const historyContainer = document.getElementById('history-container');
const typingIndicator  = document.getElementById('typing');
const chipsArea        = document.getElementById('chips-area');
const liveClock        = document.getElementById('live-clock');

const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
let isCollapsed = true;

// --- UI UTILS ---
const scrollToBottom = () => {
    historyContainer.scrollTo({ top: historyContainer.scrollHeight, behavior: 'smooth' });
};

// --- 1. CLOSED-STATE MARQUEE ---
const lines = [
    { hook: '"Who should you meet at Nomad Fest?"', sub: 'Ask me before you walk into the room.' },
    { hook: '"Skip random networking."',            sub: "I'll tell you exactly who's worth talking to." },
    { hook: '"New in Da Nang?"',                    sub: 'Events, people & places — instantly.' },
    { hook: '"One question can change your week."', sub: 'Try me.' }
];

let lineIdx = 0;
function cycle() {
    if (chatHub.classList.contains('is-expanded')) return;
    textStage.classList.add('text-hidden');
    setTimeout(() => {
        lineIdx = (lineIdx + 1) % lines.length;
        hookText.innerHTML = lines[lineIdx].hook;
        subText.innerHTML  = lines[lineIdx].sub;
        textStage.classList.remove('text-hidden');
        textStage.classList.add('text-incoming');
        requestAnimationFrame(() => setTimeout(() => textStage.classList.remove('text-incoming'), 50));
    }, 800);
}
setInterval(cycle, 5000);
cycle();

// --- 2. CLOCK LOGIC ---
function updateClock() {
    const options = { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: true };
    liveClock.innerText = new Intl.DateTimeFormat('en-US', options).format(new Date());
}
setInterval(updateClock, 1000);
updateClock();

// --- 3. EXPANSION LOGIC ---
const expand = () => {
    if (!isCollapsed) return;

    isCollapsed = false;

    chatHub.classList.add('is-expanded');
    document.body.classList.remove('is-collapsed');
    document.body.classList.add('is-expanded');

    window.parent.postMessage({ action: 'expand' }, '*');

    minimizeBtn.classList.remove('hidden');
    chipsArea.style.opacity = '1';
    chipsArea.style.height  = 'auto';
    historyContainer.style.display = 'block';

    const glow = document.getElementById('cta-glow');
    if (glow) glow.style.display = 'none';

    if (chatHistory.children.length === 0) {
        setTimeout(() => {
            const branding = `
                <div class="flex items-center gap-3 px-2 mb-4">
                    <div class="h-[1px] flex-grow bg-slate-100"></div>
                    <div class="flex items-center gap-2 opacity-100">
                        <span class="text-[9px] font-bold text-slate-700 uppercase tracking-[0.25em]">Powered by BOLZARD</span>
                        <img src="./logo.png" alt="Bolzard" class="h-10 rounded-lg object-contain">
                    </div>
                    <div class="h-[1px] flex-grow bg-slate-100"></div>
                </div>`;
            const wrapper = document.createElement('div');
            wrapper.innerHTML = branding;
            chatHistory.appendChild(wrapper);
            scrollToBottom();
        }, 400);

        setTimeout(() => addMessage("Welcome to Nomad Intelligence. I'm here to curate your network, navigate the schedule, and reveal Da Nang's finest. What can I help you with?", 'bot'), 1000);
    }
};
const collapse = () => {
    isCollapsed = true;

    chatHub.classList.remove('is-expanded');
    document.body.classList.remove('is-expanded');
    document.body.classList.add('is-collapsed');

    window.parent.postMessage({ action: 'collapse' }, '*');

    minimizeBtn.classList.add('hidden');
    chipsArea.style.opacity = '0';
    chipsArea.style.height  = '0';
    historyContainer.style.display = 'none';

    const glow = document.getElementById('cta-glow');
    if (glow) glow.style.display = 'block';
};

// Bind expand to the entire container
chatHub.addEventListener('click', () => {
    if (isCollapsed) expand();
});

// Ensure minimize stops event bubbling so it doesn't re-trigger the expand click
minimizeBtn.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    collapse(); 
});

// --- 4. MESSAGE ENGINE ---
const addMessage = (text, sender = 'bot') => {
    const wrapper = document.createElement('div');
    wrapper.className = `flex flex-col ${sender === 'user' ? 'items-end' : 'items-start'} transition-all duration-500 opacity-0 translate-y-4 mb-3`;

    let label = 'INTELLIGENCE';
    let bubbleStyle = 'bg-white border border-slate-100 rounded-[1.5rem] rounded-tl-none text-slate-800 shadow-sm';

    if (sender === 'user') {
        label      = 'NOMAD';
        bubbleStyle = 'bg-slate-900 text-white rounded-[1.5rem] rounded-tr-none shadow-lg';
    } else if (sender === 'system') {
        label      = 'SYSTEM';
        bubbleStyle = 'bg-slate-50 border border-slate-200 text-slate-500 italic rounded-lg px-4 py-2 text-xs';
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    let processedText = text.replace(urlRegex, '').trim();

    processedText = processedText.replace(/^### (.*$)/gim,
        '<div class="mt-4 mb-1 text-slate-900 font-bold text-xs uppercase tracking-[0.1em]">$1</div>');
    processedText = processedText.replace(/\*\*(.*?)\*\*/g,
        '<span class="text-emerald-600 font-bold text-[1.05rem] tracking-tight">$1</span>');
    processedText = processedText.replace(/\n/g, '<br>');

    wrapper.innerHTML = `
        <span class="text-[8px] font-black text-slate-400 mb-1 px-4 uppercase tracking-[0.2em]">${label}</span>
        <div class="px-5 py-3 max-w-[90%] text-sm md:text-base ${bubbleStyle}">
            <span class="txt"></span>
            <div class="cta-stack mt-3 flex flex-row flex-wrap items-center gap-2 empty:hidden"></div>
        </div>`;
    chatHistory.appendChild(wrapper);

    const txtSpan  = wrapper.querySelector('.txt');
    const ctaStack = wrapper.querySelector('.cta-stack');

    const renderButtons = () => {
        urls.forEach(url => {
            const btn = document.createElement('a');
            btn.href = url; btn.target = '_blank';
            let btnText = 'Explore Now', icon = '✨';
            if (url.includes('t.me'))                 { btnText = 'Connect on Telegram';   icon = '🚀'; }
            else if (url.includes('whatsapp.com'))     { btnText = 'Secure WhatsApp Line';  icon = '💬'; }
            else if (url.includes('danangnomadfest.com')) { btnText = 'Official Festival Page'; icon = '💎'; }
            btn.className = 'inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-tr from-emerald-600 to-green-400 text-white text-[10px] uppercase font-black rounded-full shadow-lg transition-all no-underline tracking-wider';
            btn.innerHTML = `<span>${icon}</span><span>${btnText}</span>`;
            ctaStack.appendChild(btn);
        });
        scrollToBottom();
    };

    if (sender !== 'user') {
        const revealQueue = [];
        const walk = (node, targetContainer) => {
            if (node.nodeType === 3) {
                const words = node.textContent.match(/(\s+|[^\s]+)/g) || [];
                words.forEach(word => revealQueue.push({ type: 'text', content: word, parent: targetContainer }));
            } else if (node.nodeType === 1) {
                const clone = node.cloneNode(false);
                revealQueue.push({ type: 'element', content: clone, parent: targetContainer });
                Array.from(node.childNodes).forEach(child => walk(child, clone));
            }
        };
        const temp = document.createElement('div');
        temp.innerHTML = processedText;
        Array.from(temp.childNodes).forEach(child => walk(child, txtSpan));

        let qIdx = 0;
        const stream = () => {
            if (qIdx < revealQueue.length) {
                const item = revealQueue[qIdx++];
                if (item.type === 'element') {
                    item.parent.appendChild(item.content);
                    stream();
                } else {
                    const span = document.createElement('span');
                    span.className = 'word-reveal';
                    span.textContent = item.content;
                    item.parent.appendChild(span);
                    scrollToBottom();
                    setTimeout(stream, sender === 'system' ? 5 : 20);
                }
            } else if (urls.length > 0) renderButtons();
        };
        stream();
    } else {
        txtSpan.innerHTML = processedText;
        scrollToBottom();
    }

    setTimeout(() => wrapper.classList.remove('opacity-0', 'translate-y-4'), 50);
};

// --- 5. CHIPS & API ---
window.handleChip = (text) => {
    userInput.value = text;
    chatForm.dispatchEvent(new Event('submit'));
};

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = userInput.value.trim();
    if (!val) return;

    if (chipsArea) {
        chipsArea.style.opacity = '0';
        chipsArea.style.height  = '0';
        setTimeout(() => chipsArea.remove(), 700);
    }

    addMessage(val, 'user');
    userInput.value = '';
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    try {
        const res  = await fetch('https://n8n.srv1075357.hstgr.cloud/webhook/danang_nomad-fest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: val, sessionId })
        });
        const data = await res.json();
        typingIndicator.classList.add('hidden');
        addMessage(data.reply || data.output || "I've received your request.");
    } catch (err) {
        typingIndicator.classList.add('hidden');
        addMessage('Sync interrupted.', 'system');
    }
});

// --- 6. NEURAL MESH ---
const canvas = document.createElement('canvas');
canvas.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;';
chatHub.prepend(canvas);
const ctx = canvas.getContext('2d');
let dots = [];

function init() {
    canvas.width  = chatHub.offsetWidth;
    canvas.height = chatHub.offsetHeight;
    dots = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.5
    }));
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dots.forEach((d, i) => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245,158,11,0.35)';
        ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
            const dist = Math.sqrt((d.x - dots[j].x) ** 2 + (d.y - dots[j].y) ** 2);
            if (dist < 110) {
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(dots[j].x, dots[j].y);
                ctx.strokeStyle = `rgba(245,158,11,${(1 - dist / 110) * 0.15})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animate);
}

init(); animate();
window.addEventListener('resize', init);

// Init collapsed body state
document.body.classList.add('is-collapsed');
