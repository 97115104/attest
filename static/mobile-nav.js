// Mobile navigation handling for attest

document.addEventListener('DOMContentLoaded', function() {
    // Handle dropdown menus
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;
        
        // Add click handler for mobile
        toggle.addEventListener('click', function(e) {
            // Only prevent default on mobile devices
            if (window.matchMedia('(max-width: 768px)').matches) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close all dropdowns on resize
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }, 250);
    });
    
    // Improve navigation accessibility
    const navLinks = document.querySelectorAll('nav a, .dropdown-toggle');
    navLinks.forEach(link => {
        // Add focus visible styles
        link.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--pixel-primary)';
            this.style.outlineOffset = '2px';
        });
        
        link.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
});