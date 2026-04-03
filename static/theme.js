/**
 * attest Theme Manager
 * Handles light/dark mode with keyboard shortcuts and auto-detection
 */

(function() {
    'use strict';

    // Initialize theme system
    function initTheme() {
        const html = document.documentElement;
        const themeToggle = document.getElementById('theme-toggle');
        
        // Get theme based on preferences
        function getPreferredTheme() {
            // Check saved preference first
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            
            // Check time of day (6 PM to 6 AM = dark mode)
            const hour = new Date().getHours();
            if (hour >= 18 || hour < 6) {
                return 'dark';
            }
            
            return 'light';
        }
        
        // Apply theme
        function applyTheme(theme) {
            html.setAttribute('data-theme', theme);
            if (themeToggle) {
                // Show opposite letter - what you'll switch TO
                themeToggle.textContent = theme === 'dark' ? 'L' : 'D';
            }
            localStorage.setItem('theme', theme);
        }
        
        // Toggle theme
        function toggleTheme() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        }
        
        // Set initial theme (theme already applied by inline script)
        const currentTheme = html.getAttribute('data-theme') || getPreferredTheme();
        if (themeToggle) {
            // Show opposite letter - what you'll switch TO
            themeToggle.textContent = currentTheme === 'dark' ? 'L' : 'D';
        }
        
        // Theme toggle button
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key.toLowerCase() === 'l') {
                applyTheme('light');
            } else if (e.key.toLowerCase() === 'd') {
                applyTheme('dark');
            }
        });
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();