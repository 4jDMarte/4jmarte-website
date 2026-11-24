let currentSelectedDoc = {
    title: "4jMarte Automation Engineering Proposal",
    filename: "4jMarte-Automation Engineering_Proposal.pdf",
    ref: "4JM-PROP-2026",
    src: "./4jMarte-Automation Engineering_Proposal.pdf"
};

let isAuthenticated = false;
let userEmailValue = "";

// 1. Dynamic Search by Filename, Title, Ref, or Keywords
function filterDocuments() {
    const input = document.getElementById('doc-search-input').value.toLowerCase().trim();
    const cards = document.querySelectorAll('.doc-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const title = card.getAttribute('data-title').toLowerCase();
        const filename = card.getAttribute('data-filename').toLowerCase();
        const ref = card.getAttribute('data-ref').toLowerCase();
        const keywords = card.getAttribute('data-keywords').toLowerCase();

        if (filename.includes(input) || title.includes(input) || ref.includes(input) || keywords.includes(input)) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    const noDocs = document.getElementById('no-docs-found');
    if (visibleCount === 0) {
        noDocs.classList.remove('hidden');
    } else {
        noDocs.classList.add('hidden');
    }
}

// 2. Document Selection Switcher
function selectDocument(element) {
    document.querySelectorAll('.doc-card').forEach(c => {
        c.classList.remove('active', 'border-brand-500/50', 'bg-slate-900/80');
        c.classList.add('border-slate-700', 'bg-slate-800/60');
    });

    element.classList.add('active', 'border-brand-500/50', 'bg-slate-900/80');
    element.classList.remove('border-slate-700', 'bg-slate-800/60');

    currentSelectedDoc.title = element.getAttribute('data-title');
    currentSelectedDoc.filename = element.getAttribute('data-filename');
    currentSelectedDoc.ref = element.getAttribute('data-ref');
    currentSelectedDoc.src = element.getAttribute('data-src');

    const pdfFrame = document.getElementById('pdf-frame');
    pdfFrame.src = `${currentSelectedDoc.src}#toolbar=0&navpanes=0`;

    if (isAuthenticated) {
        document.getElementById('pdf-header-title').textContent = currentSelectedDoc.filename;
        document.getElementById('pdf-header-subtitle').textContent = `Authorized View for: ${userEmailValue} (Ref: ${currentSelectedDoc.ref})`;
    }
}

// 3. Strict Corporate Email Validation (Blocks Fake/Dummy & Free Webmail Addresses)
function isLegitCorporateEmail(email) {
    const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicRegex.test(email)) return { valid: false, reason: "Invalid email format. Use name.surname@company.com" };

    const [localPart, domainPart] = email.toLowerCase().split('@');
    const domainName = domainPart.split('.')[0];

    // Block placeholder / fake / dummy local names
    const blockedLocals = ['any', 'test', 'testing', 'demo', 'example', 'user', 'guest', 'none', 'null', 'fake', 'asdf', 'qwerty', '123', 'abc', 'admin', 'temp', 'no-reply', 'noreply'];
    if (blockedLocals.includes(localPart) || localPart.length < 2) {
        return { valid: false, reason: "Please enter your real name (e.g. john.smith@company.com)." };
    }

    // Block placeholder / fake domains
    const blockedDomains = ['company.com', 'companyname.com', 'example.com', 'example.org', 'test.com', 'domain.com', 'email.com', 'mail.com', 'fake.com', 'none.com', 'null.com', 'asdf.com', 'xyz.com', '123.com', 'yourcompany.com'];
    if (blockedDomains.includes(domainPart) || blockedLocals.includes(domainName)) {
        return { valid: false, reason: "Placeholder domains like @company.com are not accepted. Use your actual company domain." };
    }

    // Block public / free consumer email providers
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com', 'protonmail.com', 'proton.me', 'gmx.com', 'yandex.com', 'zoho.com', 'msn.com'];
    if (freeProviders.includes(domainPart)) {
        return { valid: false, reason: "Free consumer emails (Gmail, Yahoo, Outlook) are restricted. Please use your corporate work email." };
    }

    return { valid: true };
}

function verifyCorporateEmail() {
    const emailInput = document.getElementById('corporate-email-input');
    const securityMsg = document.getElementById('security-msg');
    const lockedOverlay = document.getElementById('pdf-locked-overlay');
    const pdfFrame = document.getElementById('pdf-frame');
    const downloadBtn = document.getElementById('download-doc-btn');
    const fullscreenBtn = document.getElementById('fullscreen-doc-btn');
    const securityBox = document.getElementById('doc-security-box');

    const email = emailInput.value.trim();
    const check = isLegitCorporateEmail(email);

    if (!check.valid) {
        // Re-lock if previously unlocked and user enters invalid email
        isAuthenticated = false;
        lockedOverlay.classList.remove('opacity-0', 'pointer-events-none');
        pdfFrame.classList.add('opacity-20');
        downloadBtn.classList.add('opacity-50', 'pointer-events-none');
        fullscreenBtn.classList.add('opacity-50', 'pointer-events-none');

        securityBox.className = "bg-red-950/30 border border-red-500/40 rounded-xl p-5";
        securityMsg.className = "mt-2 text-xs text-red-400 font-semibold";
        securityMsg.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> ${check.reason}`;
        emailInput.focus();
        return;
    }

    isAuthenticated = true;
    userEmailValue = email;

    lockedOverlay.classList.add('opacity-0', 'pointer-events-none');
    pdfFrame.classList.remove('opacity-20');
    
    downloadBtn.classList.remove('opacity-50', 'pointer-events-none');
    fullscreenBtn.classList.remove('opacity-50', 'pointer-events-none');

    document.getElementById('pdf-header-title').textContent = currentSelectedDoc.filename;
    document.getElementById('pdf-header-subtitle').textContent = `Authorized View for: ${email} (Ref: ${currentSelectedDoc.ref})`;
    
    securityBox.className = "bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-5";
    securityMsg.className = "mt-2 text-xs text-emerald-400 font-semibold";
    securityMsg.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> Authenticated for <strong>${email}</strong>. Download request ready.`;
}

// 4. Send Email Request directly to info@4jmarte.ie
function requestDownloadViaEmail() {
    if (!isAuthenticated) return;
    const recipient = "info@4jmarte.ie";
    const subject = encodeURIComponent(`Document Download Request: ${currentSelectedDoc.filename} [${currentSelectedDoc.ref}]`);
    const body = encodeURIComponent(
        `Hello 4jMarte Engineering Team,\n\n` +
        `An official document download request has been submitted from the web portal:\n\n` +
        `Requester Email: ${userEmailValue}\n` +
        `File Name: ${currentSelectedDoc.filename}\n` +
        `Document Title: ${currentSelectedDoc.title}\n` +
        `Document Ref: ${currentSelectedDoc.ref}\n\n` +
        `Please forward the requested PDF package to ${userEmailValue}.\n\n` +
        `Best regards,\n` +
        `${userEmailValue}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
}

// 5. Fullscreen Preview Toggle
function toggleDocFullscreen() {
    if (!isAuthenticated) return;
    const pdfFrame = document.getElementById('pdf-frame');
    if (pdfFrame.requestFullscreen) {
        pdfFrame.requestFullscreen();
    } else if (pdfFrame.webkitRequestFullscreen) {
        pdfFrame.webkitRequestFullscreen();
    }
}


// LinkedIn Feed & Publisher JavaScript


function togglePostComposer() {
    const form = document.getElementById('post-composer-form');
    form.classList.toggle('hidden');
}

function openComposerMode(mode) {
    const form = document.getElementById('post-composer-form');
    const typeSelect = document.getElementById('post-type-select');
    form.classList.remove('hidden');

    if (mode === 'article') {
        typeSelect.value = 'Technical Article';
        document.getElementById('post-title-input').focus();
    } else if (mode === 'media') {
        document.getElementById('post-image-input').focus();
    } else {
        typeSelect.value = 'Engineering Update';
        document.getElementById('post-body-input').focus();
    }
}

function buildArticleHTML(post) {
    const imageBlock = post.image 
        ? `<div class="mt-4 rounded-xl overflow-hidden border border-slate-200"><img src="${post.image}" alt="${post.title}" class="w-full max-h-80 object-cover"></div>` 
        : '';

    return `
    <article class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div class="p-6">
            <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3">
                    <img src="./logo.png" alt="4jMarte" class="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white" onerror="this.src='https://placehold.co/100x100/0284c7/ffffff?text=4J'">
                    <div>
                        <div class="flex items-center space-x-2">
                            <h3 class="font-bold text-slate-900 text-base">4jMarte Industrial Automation &amp; Cybersecurity</h3>
                            <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 rounded border border-brand-200">${post.type}</span>
                        </div>
                        <p class="text-xs text-slate-500">Industry 4.0 Engineering • Dublin, Ireland</p>
                        <p class="text-xs text-slate-400 mt-0.5"><i class="fa-solid fa-earth-americas me-1"></i> ${post.date}</p>
                    </div>
                </div>
                <a href="https://www.linkedin.com/company/https-companycheck.ie-company-792458/about/" target="_blank" rel="noopener noreferrer" class="text-[#0A66C2] hover:underline text-xs font-semibold">
                    <i class="fa-brands fa-linkedin text-lg"></i>
                </a>
            </div>
            <div class="mt-4 space-y-3">
                ${post.title ? `<h4 class="text-lg font-bold text-slate-900">${post.title}</h4>` : ''}
                <p class="text-slate-700 text-sm leading-relaxed whitespace-pre-line">${post.body}</p>
                ${imageBlock}
                ${post.tags ? `<p class="text-xs font-semibold text-[#0A66C2]">${post.tags}</p>` : ''}
            </div>
        </div>
        <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <div class="flex items-center space-x-6">
                <button onclick="toggleLikePost(this)" class="flex items-center space-x-1.5 hover:text-[#0A66C2] transition-colors">
                    <i class="fa-regular fa-thumbs-up text-sm"></i>
                    <span>Recommend (<span class="like-count">1</span>)</span>
                </button>
                <a href="#contact" class="flex items-center space-x-1.5 hover:text-brand-600 transition-colors">
                    <i class="fa-regular fa-comment-dots text-sm"></i>
                    <span>Discuss</span>
                </a>
            </div>
            <button onclick="shareFeedPost(this, '${post.title || '4jMarte Update'}')" class="flex items-center space-x-1.5 hover:text-slate-900 transition-colors">
                <i class="fa-solid fa-share-nodes text-sm"></i>
                <span>Copy Link</span>
            </button>
        </div>
    </article>`;
}

function getComposerData() {
    return {
        type: document.getElementById('post-type-select').value,
        title: document.getElementById('post-title-input').value.trim(),
        body: document.getElementById('post-body-input').value.trim(),
        image: document.getElementById('post-image-input').value.trim(),
        tags: document.getElementById('post-tags-input').value.trim(),
        date: new Date().toLocaleDateString('en-IE', { year: 'numeric', month: 'short', day: 'numeric' })
    };
}

function publishFeedPost() {
    const post = getComposerData();
    const feedback = document.getElementById('composer-feedback');

    if (!post.body) {
        feedback.className = "text-xs font-semibold text-red-600";
        feedback.textContent = "Please write some content before posting.";
        feedback.classList.remove('hidden');
        return;
    }

    // Save to browser localStorage
    const saved = JSON.parse(localStorage.getItem('4jmarte_feed_posts') || '[]');
    saved.unshift(post);
    localStorage.setItem('4jmarte_feed_posts', JSON.stringify(saved));

    // Prepend to feed immediately
    const container = document.getElementById('linkedin-feed-container');
    container.insertAdjacentHTML('afterbegin', buildArticleHTML(post));

    // Reset inputs
    document.getElementById('post-title-input').value = '';
    document.getElementById('post-body-input').value = '';
    document.getElementById('post-image-input').value = '';
    feedback.className = "text-xs font-semibold text-emerald-600";
    feedback.textContent = "Published to feed! Tip: Use 'Copy HTML for GitHub' to make posts permanent for all visitors.";
    feedback.classList.remove('hidden');
}

function copyPostHTML() {
    const post = getComposerData();
    const feedback = document.getElementById('composer-feedback');
    if (!post.body) {
        feedback.className = "text-xs font-semibold text-red-600";
        feedback.textContent = "Enter post content first to generate HTML.";
        feedback.classList.remove('hidden');
        return;
    }
    navigator.clipboard.writeText(buildArticleHTML(post));
    feedback.className = "text-xs font-semibold text-emerald-600";
    feedback.textContent = "HTML copied! Paste it inside #linkedin-feed-container in index.html on GitHub.";
    feedback.classList.remove('hidden');
}

function toggleLikePost(btn) {
    const icon = btn.querySelector('i');
    const countSpan = btn.querySelector('.like-count');
    let count = parseInt(countSpan.textContent, 10);

    if (icon.classList.contains('fa-regular')) {
        icon.classList.replace('fa-regular', 'fa-solid');
        btn.classList.add('text-[#0A66C2]');
        countSpan.textContent = count + 1;
    } else {
        icon.classList.replace('fa-solid', 'fa-regular');
        btn.classList.remove('text-[#0A66C2]');
        countSpan.textContent = count - 1;
    }
}

function shareFeedPost(btn, title) {
    const url = `${window.location.origin}${window.location.pathname}#updates`;
    navigator.clipboard.writeText(url);
    const span = btn.querySelector('span');
    const original = span.textContent;
    span.textContent = "Copied!";
    setTimeout(() => span.textContent = original, 2000);
}

// Load any locally saved posts on page load
document.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('4jmarte_feed_posts') || '[]');
    const container = document.getElementById('linkedin-feed-container');
    saved.reverse().forEach(post => {
        container.insertAdjacentHTML('afterbegin', buildArticleHTML(post));
    });
});