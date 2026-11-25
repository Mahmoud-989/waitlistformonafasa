document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check local storage for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        updateThemeIcon(true);
    }

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        const isLight = body.classList.contains('light-theme');
        
        // Save to local storage
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        // Update the button icon
        updateThemeIcon(isLight);
    });

    function updateThemeIcon(isLight) {
        if (isLight) {
            themeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
        } else {
            themeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        }
    }

    // 2. Mobile Menu Logic
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 3. Scroll Reveal Animations (Intersection Observer)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add the visible class to trigger CSS animation
                entry.target.classList.add('visible');
                // Unobserve after animating once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements with the .reveal class
    document.querySelectorAll('.reveal').forEach(el => {
        scrollObserver.observe(el);
    });
    
    // 4. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // 5. Language Switch (Arabic <-> English)
    // <html lang> and <html dir> are the single source of truth: the CSS reads them to show
    // the .a (Arabic) or .e (English) spans and to flip the layout RTL <-> LTR.
    // Before a choice is made the page is Arabic/RTL by default; 5b shows the language picker on every page load.
    const langBtn = document.getElementById('lang-toggle');
    const LANG_TEXT = {
        ar: {
            title: 'منافسة | Monafasa — مش لازم تتمرن لوحدك',
            description: 'منافسة منصة لياقة اجتماعية تنافسية بتحوّل التمرين الفردي لمنافسة تفاعلية.'
        },
        en: {
            title: 'Monafasa | Never Train Alone',
            description: 'Monafasa is a social competitive fitness platform designed to turn isolated workouts into interactive competition.'
        }
    };

    function applyLang(lang) {
        const html = document.documentElement;
        html.lang = lang;
        html.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.title = LANG_TEXT[lang].title;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', LANG_TEXT[lang].description);

        // Attributes can't hold two <span>s, so placeholder + aria-label are swapped here
        document.querySelectorAll('[data-ar-placeholder]').forEach(el => {
            el.placeholder = lang === 'ar' ? el.dataset.arPlaceholder : el.dataset.enPlaceholder;
        });
        document.querySelectorAll('[data-ar-label]').forEach(el => {
            el.setAttribute('aria-label', lang === 'ar' ? el.dataset.arLabel : el.dataset.enLabel);
        });
    }

    // Sync title / placeholder / aria-label with the language the <head> script already picked
    applyLang(document.documentElement.lang === 'en' ? 'en' : 'ar');

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const next = document.documentElement.lang === 'ar' ? 'en' : 'ar';
            applyLang(next);
        });
    }

    // 5b. Language picker (shown on EVERY page load; nothing is remembered between visits)
    // The <head> script adds html.lang-pending on every load; the CSS then shows #lang-gate full-screen.
    // Until the visitor picks a language, everything behind it is inert (can't be clicked or tabbed to).
    const langGate = document.getElementById('lang-gate');
    const siteParts = document.querySelectorAll('header, main, footer, #mobile-bar');

    function chooseLang(lang) {
        applyLang(lang);

        siteParts.forEach(el => { el.inert = false; });
        langGate.classList.add('is-leaving');           // fade the picker out (0.4s, see CSS)

        // Replay the hero entrance so the site "appears" right after the choice
        const heroItems = document.querySelectorAll('#hero .reveal');
        heroItems.forEach(el => el.classList.remove('visible'));
        void document.body.offsetHeight;                // force a reflow so the animation restarts
        requestAnimationFrame(() => heroItems.forEach(el => el.classList.add('visible')));

        setTimeout(() => {                              // after the fade, remove the picker for good
            document.documentElement.classList.remove('lang-pending');
            langGate.classList.remove('is-leaving');
        }, 450);
    }

    if (langGate && document.documentElement.classList.contains('lang-pending')) {
        siteParts.forEach(el => { el.inert = true; });
        const firstChoice = langGate.querySelector('.lang-choice');
        if (firstChoice) firstChoice.focus();
        langGate.querySelectorAll('.lang-choice').forEach(btn => {
            btn.addEventListener('click', () => chooseLang(btn.dataset.lang));
        });
    }

    // The browser's Back button can restore the page from memory with the picker already closed.
    // Reload in that case, so the picker really does appear every time the site is opened.
    window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); });

    // 6. Sticky mobile join bar: hide it while the real waitlist form is on screen
    const mobileBar = document.getElementById('mobile-bar');
    const ctaSection = document.getElementById('cta');
    if (mobileBar && ctaSection) {
        new IntersectionObserver(entries => {
            mobileBar.classList.toggle('is-hidden', entries[0].isIntersecting);
        }, { threshold: 0.2 }).observe(ctaSection);
    }
});
