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


    // --- Page Turning Logic ---
    // Initialize z-indexes
    pages.forEach((page, index) => {
        page.style.zIndex = totalPages - index;
    });

    pages.forEach((page, index) => {
        page.addEventListener('click', (e) => {
            // If clicking buttons, don't flip
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

            // Play flip sound (removed)
            // audioFlip.currentTime = 0;
            // audioFlip.play().catch(e => console.log("Audio play failed (user interaction needed first):", e));

            if (index === currentPage) {
                // Flip forward (Open page)
                page.classList.add('flipped');
                page.style.zIndex = index + 1; // Update Z-index for left stack
                currentPage++;
            } else if (index === currentPage - 1) {
                // Flip backward (Close page)
                page.classList.remove('flipped');

                // Add a small delay to reset z-index so it doesn't clip immediately
                setTimeout(() => {
                    page.style.zIndex = totalPages - index;
                }, 500); // Halfway through transition

                currentPage--;
            }

            // --- Centering & Tilt Logic ---
            const isFrontClosed = currentPage === 0;
            const isBackClosed = currentPage === totalPages;
            const isOpen = !isFrontClosed && !isBackClosed;

            if (closeTimeout) clearTimeout(closeTimeout);

            if (isOpen) {
                book.classList.add('open');
                book.classList.remove('closed-back');
            } else if (isBackClosed) {
                book.classList.remove('open');
                book.classList.add('closed-back');
            } else {
                // Front Closed
                book.classList.remove('open');
                book.classList.remove('closed-back');
            }
        });
    });

    // --- "No" Button Logic (Broken Button) ---
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Add broken class to trigger CSS animation
        noBtn.classList.add('broken');

        // Optional: Show "Oops" message
        responseMsg.textContent = "Oops! That button seems broken... 😉";
        responseMsg.style.color = '#c0392b';
        responseMsg.style.opacity = '0';
        responseMsg.style.transition = 'opacity 1s';

        setTimeout(() => {
            responseMsg.style.opacity = '1';
        }, 500);
    });

    // --- "Yes" Button Logic ---
    yesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        celebrate();
    });

    function celebrate() {
        celebration.classList.remove('hidden');

        // 1. Fade in Overlay & Envelope
        setTimeout(() => {
            celebration.classList.add('visible');

            // 2. Open Envelope (Flap & Slide Up)
            setTimeout(() => {
                const envelope = document.querySelector('.envelope');
                const card = document.querySelector('.invitation-card');

                if (envelope) envelope.classList.add('open');

                // 3. Expand Card (Scale & Center)
                setTimeout(() => {
                    if (card) card.classList.add('expanded');
                }, 1000); // Wait for slide up to finish

            }, 500); // Small delay after fade in

        }, 10);

        // Simple confetti effect
        createConfetti();
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
            confetti.animate([
                { transform: `translate3d(0,0,0) rotateX(0) rotateY(0)` },
                { transform: `translate3d(${Math.random() * 100 - 50}px, 100vh, 0) rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg)` }
            ], {
                duration: Math.random() * 2000 + 1500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                fill: 'forwards'
            });

            document.body.appendChild(confetti);
        }
    }
});
