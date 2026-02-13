document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');
    const pages = document.querySelectorAll('.page');
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const responseMsg = document.getElementById('response-msg');
    const celebration = document.getElementById('celebration');


    const totalPages = pages.length;
    let closeTimeout;

    // --- Audio Setup ---
    // const audioFlip = new Audio('https://www.soundjay.com/books/sounds/page-flip-01a.mp3');


    // --- Page State & Initialization ---

    // 1. Read Initial State from URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialPage = parseInt(urlParams.get('page')) || 0;
    let currentPage = initialPage;

    // Apply initial z-index from data attribute (set in EJS)
    document.querySelectorAll('.page[data-z-index]').forEach(el => {
        el.style.zIndex = el.getAttribute('data-z-index');
    });

    // Check for Preview Mode
    if (urlParams.get('preview') === 'true') {
        document.body.classList.add('body-preview');
    }

    // Preserve initial state in history without wiping the URL
    history.replaceState({ page: initialPage, celebration: false }, '', window.location.search);

    // Function to handle browser Back/Forward (Exposed for compatibility)
    window.updateBookState = function (targetPage) {
        // Iterate all pages to match target state instantly
        pages.forEach((page, index) => {
            if (index < targetPage) {
                // Should be flipped (Left)
                page.classList.add('flipped');
                page.style.zIndex = index + 1;
            } else {
                // Should be unflipped (Right)
                page.classList.remove('flipped');
                page.style.zIndex = totalPages - index;
            }
        });
        updateBookOpenState(targetPage);
        currentPage = targetPage;

        // Auto-scale content to fit the new state
        if (typeof fitContentToContainer === 'function') fitContentToContainer();
    }

    function updateBookOpenState(pageIndex) {
        const isFrontClosed = pageIndex === 0;
        const isBackClosed = pageIndex === totalPages;
        const isOpen = !isFrontClosed && !isBackClosed;

        if (isOpen) {
            book.classList.add('open');
            book.classList.remove('closed-back');
        } else if (isBackClosed) {
            book.classList.remove('open');
            book.classList.add('closed-back');
        } else {
            book.classList.remove('open');
            book.classList.remove('closed-back');
        }

        // Ensure scale fits the current state
        resizeBook();
    }

    // Handle Browser Back/Forward
    window.addEventListener('popstate', (event) => {
        const state = event.state || { page: 0, celebration: false };

        // 1. Handle Celebration Modal
        if (state.celebration) {
            celebration.classList.remove('hidden');
            setTimeout(() => celebration.classList.add('visible'), 10);
        } else {
            celebration.classList.remove('visible');
            setTimeout(() => celebration.classList.add('hidden'), 500);
        }

        // 2. Handle Page Turn
        if (state.page !== undefined) {
            updateBookState(state.page);
        }
    });

    // --- Page Interaction (Click) ---
    pages.forEach((page, index) => {
        page.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

            if (index === currentPage) {
                // Flip Forward (Right to Left)
                page.classList.add('flipped');
                page.style.zIndex = index + 1; // Bringing to top of left stack
                currentPage++;

                // Push State
                history.pushState({ page: currentPage, celebration: false }, '', `?page=${currentPage}`);
                updateBookOpenState(currentPage);

            } else if (index === currentPage - 1) {
                // Flip Backward (Left to Right)
                page.classList.remove('flipped');

                // CRITICAL: Delay Z-Index change so it stays visible while flipping
                setTimeout(() => {
                    page.style.zIndex = totalPages - index;
                }, 500); // 0.5s matches CSS transition

                currentPage--;

                // Push State
                history.pushState({ page: currentPage, celebration: false }, '', `?page=${currentPage}`);
                updateBookOpenState(currentPage);
            }
        });
    });

    // --- "No" Button Logic ---
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        noBtn.classList.add('broken');
        responseMsg.textContent = "Oops! That button seems broken... 😉";
        responseMsg.style.color = '#c0392b';
        responseMsg.style.opacity = '0';
        responseMsg.style.transition = 'opacity 1s';
        setTimeout(() => responseMsg.style.opacity = '1', 500);
    });

    // --- "Yes" Button Logic ---
    yesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        celebrate();
    });

    function celebrate() {
        // Push State for Success
        history.pushState({ page: currentPage, celebration: true }, '', '#love');

        celebration.classList.remove('hidden');
        setTimeout(() => {
            celebration.classList.add('visible');

            // Trigger Confetti
            createConfetti();
        }, 10);

        // Ensure card pops in via CSS
    }

    function createConfetti() {
        const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = -10 + 'px';
            confetti.style.opacity = Math.random();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

            // Animation
            const animation = confetti.animate([
                { transform: `translate3d(0,0,0) rotateX(0) rotateY(0)` },
                { transform: `translate3d(${Math.random() * 100 - 50}px, 100vh, 0) rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg)` }
            ], {
                duration: Math.random() * 2000 + 1500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });

            // Clean up after animation
            animation.onfinish = () => confetti.remove();

            document.body.appendChild(confetti);
        }
    }

    // Initialize Book State on Load
    window.updateBookState(currentPage);

    // --- Content Fitting Logic ---
    function fitContentToContainer() {
        document.querySelectorAll('.content').forEach(content => {
            const p = content.querySelector('p');
            const imgContainer = content.querySelector('.photo-placeholder');
            if (!p) return;

            // Reset styles
            let fontSize = 1.2;
            p.style.fontSize = fontSize + 'rem';
            if (imgContainer) imgContainer.style.maxHeight = '45%';

            const isOverflowing = () => content.scrollHeight > content.clientHeight;

            // Strategy 1: Shrink Image
            if (imgContainer && isOverflowing()) {
                let mh = 45;
                while (isOverflowing() && mh > 20) {
                    mh -= 2;
                    imgContainer.style.maxHeight = mh + '%';
                }
            }

            // Strategy 2: Shrink Font
            while (isOverflowing() && fontSize > 0.6) {
                fontSize -= 0.05;
                p.style.fontSize = fontSize + 'rem';
            }
        });
    }

    // --- Floating Background Elements ---
    // createFloatingBackground(); // Disabled for User Image Background

    function createFloatingBackground() {
        const items = ['🌹', '🌸', '✨', '❤️', '💗', '🤍', '🍃'];
        const count = 25; // Number of floating items

        for (let i = 0; i < count; i++) {
            const el = document.createElement('span');
            el.classList.add('floating-bg-item');
            el.textContent = items[Math.floor(Math.random() * items.length)];

            // Random Position
            el.style.left = Math.random() * 100 + 'vw';

            // Random Animation Properties
            const duration = Math.random() * 15 + 10; // 10s - 25s
            const delay = Math.random() * -20; // Start immediately (negative delay)

            el.style.animationDuration = duration + 's';
            el.style.animationDelay = delay + 's';

            // Random Size
            const size = Math.random() * 1.5 + 1; // 1rem - 2.5rem
            el.style.fontSize = size + 'rem';
            el.style.opacity = Math.random() * 0.5 + 0.3; // 0.3 - 0.8

            document.body.appendChild(el);
        }
    }
    // --- Fluid Responsiveness (Strict Fit) ---
    function resizeBook() {
        const scene = document.querySelector('.scene');
        if (!scene) return;
        const book = document.getElementById('book');
        const envelopeWrapper = document.querySelector('.envelope-wrapper');
        const previewBanner = document.getElementById('preview-banner');
        const isPreviewMode = document.body.classList.contains('body-preview');

        // --- 1. Available Viewport ---
        let availableHeight = window.innerHeight;
        let availableWidth = window.innerWidth;
        if (previewBanner) {
            availableHeight -= previewBanner.offsetHeight;
        }

        // --- 2. Scale Logic ---
        const baseWidth = 420;
        const baseHeight = 560;
        const isMobile = availableWidth < 600;
        const isOpen = book.classList.contains('open');

        // When open, always target TWO pages (840px) for full spread
        let targetWidth = baseWidth;
        if (isOpen) {
            targetWidth = baseWidth * 2;
        }

        // Dynamic padding: smaller viewport = less padding
        let paddingW, paddingH;
        if (isPreviewMode) {
            paddingW = isMobile ? 10 : 20;
            paddingH = isMobile ? 20 : 30;
        } else {
            paddingW = Math.max(10, Math.min(availableWidth * 0.05, 60));
            paddingH = Math.max(20, Math.min(availableHeight * 0.06, 80));
        }

        // On mobile when open, scale to fit the viewport width
        // Allow scaling down significantly to ensure "all corners inside"
        let widthRatio, heightRatio;
        if (isMobile && isOpen) {
            widthRatio = Math.max(availableWidth / (targetWidth + paddingW), 0.2);
            heightRatio = availableHeight / (baseHeight + paddingH);
        } else {
            widthRatio = availableWidth / (targetWidth + paddingW);
            heightRatio = availableHeight / (baseHeight + paddingH);
        }

        let scale = Math.min(widthRatio, heightRatio);
        if (scale > 1.2) scale = 1.2;
        if (scale < 0.2) scale = 0.2; // Absolute minimum

        scene.style.transform = `scale(${scale})`;

        // --- KEY FIX: Compensate margins so layout box matches visual size ---
        // Without this, the scene's 420x560 layout box causes flexbox misalignment
        const excessW = baseWidth * (1 - scale) / 2;
        const excessH = baseHeight * (1 - scale) / 2;

        // If mobile open, shift right to reveal left page and expand for right page
        // (Open book is 840px wide vs 420px closed - extends 210px left/right beyond scene)
        let marginLeft = -excessW;
        let marginRight = -excessW;

        if (isMobile && isOpen) {
            const spreadOffset = 210 * scale;

            // Smart Centering: Calculate available whitespace and distribute
            const visualWidth = targetWidth * scale; // 840 * scale
            // If it fits, center it. If not, align to start (centeringOffset = 0)
            const centeringOffset = Math.max(0, (availableWidth - visualWidth) / 2);

            marginLeft += spreadOffset + centeringOffset;
            marginRight += spreadOffset;
        }

        scene.style.marginLeft = `${marginLeft}px`;
        scene.style.marginRight = `${marginRight}px`;
        scene.style.marginTop = `${-excessH}px`;
        scene.style.marginBottom = `${-excessH}px`;

        // Re-run content fitting
        setTimeout(() => {
            if (typeof fitContentToContainer === 'function') fitContentToContainer();
        }, 50);

        // --- 3. Book Transform (Open/Closed) ---
        if (isOpen) {
            // Always center the spine (show both pages)
            book.style.transform = `translateX(210px) rotateZ(0deg)`;
        } else {
            book.style.transform = '';
        }

        // --- 4. Mobile Scroll Handling ---
        if (isMobile && isOpen) {
            document.body.classList.add('book-open-mobile');
            document.documentElement.classList.add('book-open-mobile');

            // Auto-scroll to center the book after a brief delay
            setTimeout(() => {
                const sceneRect = scene.getBoundingClientRect();
                const scrollTarget = sceneRect.left + window.scrollX + (sceneRect.width / 2) - (availableWidth / 2);
                window.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
            }, 100);
        } else {
            document.body.classList.remove('book-open-mobile');
            document.documentElement.classList.remove('book-open-mobile');
            window.scrollTo({ left: 0 });
        }

        // --- 5. Scale the Celebration Overlay ---
        if (envelopeWrapper) {
            const cardBaseWidth = 800;
            const safetyPadding = isMobile ? 40 : 80;
            const cardScale = Math.min(availableWidth / (cardBaseWidth + safetyPadding), availableHeight / 400, 1);
            envelopeWrapper.style.transform = `scale(${cardScale})`;
        }
    }

    window.addEventListener('resize', resizeBook);
    resizeBook(); // Initial call
});
