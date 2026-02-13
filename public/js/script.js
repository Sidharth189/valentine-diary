document.addEventListener('DOMContentLoaded', () => {
    const book = document.getElementById('book');
    const pages = document.querySelectorAll('.page');
    const noBtn = document.getElementById('no-btn');
    const yesBtn = document.getElementById('yes-btn');
    const responseMsg = document.getElementById('response-msg');
    const celebration = document.getElementById('celebration');

    let currentPage = 0;
    const totalPages = pages.length;
    let closeTimeout;

    // --- Audio Setup ---
    // const audioFlip = new Audio('https://www.soundjay.com/books/sounds/page-flip-01a.mp3');


    // --- History & Navigation Logic ---

    // Initial State
    history.replaceState({ page: 0, celebration: false }, '', '');

    // Function to handle browser Back/Forward (Jumps)
    function updateBookState(targetPage) {
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
        if (typeof resizeBook === 'function') resizeBook();
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
    updateBookState(currentPage);

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
        const book = document.getElementById('book');

        // Exact Dimensions of the Book Elements
        const baseWidth = 420;
        const baseHeight = 560;
        const padding = 120; // Increased padding to force a smaller "centered" size

        let contentWidth = baseWidth; // Closed state

        // Open state is exactly double width (Left Page + Right Page)
        if (book.classList.contains('open')) {
            contentWidth = baseWidth * 2; // 840px
        }

        // Calculate Fit Ratios
        const widthRatio = window.innerWidth / (contentWidth + padding);
        const heightRatio = window.innerHeight / (baseHeight + padding);

        // Always fit the smallest ratio (Contain)
        let scale = Math.min(widthRatio, heightRatio);

        // Safety multiplier to ensure it's "small" and fits within margins
        scale = scale * 0.95;

        // Cap max size for desktop
        if (scale > 1.2) scale = 1.2;

        scene.style.transformOrigin = 'center center';
        scene.style.transform = `scale(${scale})`;
    }

    window.addEventListener('resize', resizeBook);
    resizeBook(); // Initial call
});
