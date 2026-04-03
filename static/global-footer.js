// Global Footer Component - FORCE CONSISTENT FOOTER
(function() {
    // Footer HTML template - EXACTLY matching index.html
    const footerHTML = `
        <footer>
            <div class="footer-content">
                <div class="footer-brand">
                    <a href="/" class="logo">
                        <img src="/assets/logo/circular-2-ai.svg" alt="attest logo">
                        <span>attest</span>
                    </a>
                    <p>Transparent AI attribution for the modern web</p>
                </div>
                
                <div class="footer-links">
                    <a href="/showcase/">Badges</a>
                    <a href="/examples/">Examples</a>
                    <a href="/developers/">Documentation</a>
                    <a href="https://github.com/97115104/attest" target="_blank">GitHub</a>
                    <a href="mailto:info@attest.97115104.com">Contact</a>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p style="display: inline-flex; align-items: center; margin: 0;">&copy; 2025&nbsp;&nbsp;<a href="https://0x42r.io/" target="_blank">0x42 Research</a>.&nbsp;&nbsp;
                    <a href="https://github.com/97115104/attest/blob/main/LICENSE" target="_blank">
                        <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License" style="vertical-align: middle;">
                    </a>
                    <a href="https://attest.97115104.com/verify/?data=eyJ2ZXJzaW9uIjoiMi4wIiwiaWQiOiIyMDI1LTA3LTE2LTM0ZXpucyIsImNvbnRlbnRfbmFtZSI6ImltcG9ydGVkLWNvbnRlbnQiLCJkb2N1bWVudF90eXBlIjoid2Vic2l0ZSIsIm1vZGVsIjoiY2xhdWRlLTQtb3B1cyIsInJvbGUiOiJhc3Npc3RlZCIsInRpbWVzdGFtcCI6IjIwMjUtMDctMTZUMDI6NTI6MDYuNjU1WiIsInBsYXRmb3JtIjoiYXR0ZXN0LmluayIsImNvbnRlbnRfaGFzaCI6InNoYTI1NjplNWUzMDJmMzczOWViZjU4MTI5YWM5NGJlZGU4OTQ0ZGJhOGVkYWM3N2FlYzBmOGM2ZWQ1ZmY5ZGExOWYwMGJmIiwiYXV0aG9yIjoiMHg0MiBSZXNlYXJjaCIsInNpZ25hdHVyZSI6eyJ0eXBlIjoiZXRoZXJldW0iLCJ2YWx1ZSI6IjB4OTExODcwMGYzZDBiMGQ5M2RiMDQ4YTRkODNlZTk4MTZlZjI0NzEyNWJiN2ExMzNiYzA1MWM2NmIzZGZjNWE4OTRmMWRlYzY1OTMyNWRlNTViMWYxNGIyZmQxYzg1MjlkZjExM2E2OGYyZGE1ZjFiMzUwYjc5YzllMzgyMGQ5NTYxYiIsInNpZ25lciI6IjB4NzlhNzJhMDJiOWIxOTNjNDUyMGYyMmYyY2QyZDYzYTM1NGRmZTRkMyIsIm1lc3NhZ2UiOiJ7XCJjb250ZW50X25hbWVcIjpcImltcG9ydGVkLWNvbnRlbnRcIixcIm1vZGVsXCI6XCJjbGF1ZGUtNC1vcHVzXCIsXCJ0aW1lc3RhbXBcIjpcIjIwMjUtMDctMTZUMDI6NTI6MDYuNjU1WlwiLFwiY29udGVudF9oYXNoXCI6XCJzaGEyNTY6ZTVlMzAyZjM3MzllYmY1ODEyOWFjOTRiZWRlODk0NGRiYThlZGFjNzdhZWMwZjhjNmVkNWZmOWRhMTlmMDBiZlwifSJ9fQ==" target="_blank" style="margin-left: 8px;">
                        <img src="data:image/svg+xml,%3Csvg width='94' height='20' viewBox='0 0 94 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='pixelGrad' x1='0' y1='0' x2='94' y2='0'%3E%3Cstop offset='0%25' stop-color='%2300ffcc' stop-opacity='1'/%3E%3Cstop offset='100%25' stop-color='%23ff006e' stop-opacity='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='94' height='20' fill='%23000'/%3E%3Crect x='1' y='1' width='92' height='18' fill='none' stroke='url(%23pixelGrad)' stroke-width='2'/%3E%3Crect x='3' y='3' width='88' height='14' fill='none' stroke='%23333' stroke-width='1'/%3E%3Crect x='8' y='8' width='2' height='2' fill='%2300ffcc'/%3E%3Crect x='10' y='6' width='2' height='2' fill='%23ff006e'/%3E%3Crect x='12' y='8' width='2' height='2' fill='%2300ffcc'/%3E%3Crect x='10' y='10' width='2' height='2' fill='%23ff006e'/%3E%3Ctext x='20' y='14' font-family='Courier New, monospace' font-size='10' font-weight='bold' fill='url(%23pixelGrad)'%3EAI ASSISTED%3C/text%3E%3C/svg%3E" alt="AI Assisted" style="vertical-align: middle;">
                    </a>
                </p>
            </div>
        </footer>
    `;
    
    // Function to FORCE footer placement
    function replaceFooter() {
        // Remove ALL existing footers first
        const existingFooters = document.querySelectorAll('footer');
        existingFooters.forEach(footer => footer.remove());
        
        // Find the main element and container
        const main = document.querySelector('main');
        const container = document.querySelector('.container');
        
        if (container && main && container.contains(main)) {
            // If main is inside container, append footer to container
            container.insertAdjacentHTML('beforeend', footerHTML);
        } else if (main) {
            // If main exists but not in container, insert after main
            main.insertAdjacentHTML('afterend', footerHTML);
        } else if (container) {
            // If only container exists, append to it
            container.insertAdjacentHTML('beforeend', footerHTML);
        } else {
            // Fallback: append to body
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
    }
    
    // Force execution after everything loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(replaceFooter, 100);
            // Load back-to-top functionality
            loadBackToTop();
        });
    } else {
        setTimeout(replaceFooter, 100);
        // Load back-to-top functionality
        loadBackToTop();
    }
    
    // Function to load back-to-top script
    function loadBackToTop() {
        // Instead of loading external script, inline the functionality
        // Back to top button functionality
        const backToTopButton = document.createElement('a');
        backToTopButton.className = 'back-to-top';
        backToTopButton.href = '#';
        backToTopButton.setAttribute('aria-label', 'Back to top');
        backToTopButton.innerHTML = '▲'; // Add arrow directly
        
        // Add to body
        document.body.appendChild(backToTopButton);
        
        // Show/hide button based on scroll position
        function toggleBackToTop() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }
        
        // Check on scroll
        window.addEventListener('scroll', toggleBackToTop);
        
        // Initial check
        toggleBackToTop();
        
        // Smooth scroll to top when clicked
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
})();