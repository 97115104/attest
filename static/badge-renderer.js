/**
 * attest Badge Renderer
 * Displays attestation badges that link to verification
 */

(function() {
    'use strict';

    // Load AI models if available
    let modelBadges = {};
    
    // Build badge templates from AI_MODELS if available
    if (typeof AI_MODELS !== 'undefined') {
        for (const provider of Object.values(AI_MODELS)) {
            provider.models.forEach(model => {
                modelBadges[model.id] = { 
                    text: model.name, 
                    bg: model.color 
                };
            });
        }
    } else {
        // Fallback badges if AI_MODELS not loaded
        modelBadges = {
            'gpt-4': { text: 'GPT-4', bg: '#74aa9c' },
            'claude-3-opus': { text: 'Claude 3 Opus', bg: '#d4a373' },
            'gemini-pro': { text: 'Gemini Pro', bg: '#4285f4' },
            'llama-3-70b': { text: 'Llama 3 70B', bg: '#0084ff' },
            'mistral-large': { text: 'Mistral Large', bg: '#ff7000' },
            'stable-diffusion-xl': { text: 'SDXL', bg: '#9333ea' },
            'midjourney-v6': { text: 'Midjourney V6', bg: '#5865f2' },
            'default': { text: 'AI Generated', bg: '#6b7280' }
        };
    }
    
    // Add default if not present
    if (!modelBadges.default) {
        modelBadges.default = { text: 'AI Generated', bg: '#6b7280' };
    }

    // Role-based badges
    const roleBadges = {
        'generated': { text: 'AI Generated', bg: '#6b7280' },
        'assisted': { text: 'AI Assisted', bg: '#3b82f6' },
        'edited': { text: 'AI Edited', bg: '#10b981' }
    };

    function createBadgeSVG(model, role) {
        // Try model-specific badge first
        let badge = modelBadges[model] || roleBadges[role] || modelBadges['default'];
        
        const text = badge.text;
        const bg = badge.bg;
        // Standardize width to 140px for consistency
        const width = 140;
        const height = 24;
        
        // Clean pixel art style badge with better contrast
        return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
            <rect width="${width}" height="${height}" fill="${bg}" rx="3"/>
            <text x="${width/2}" y="${height/2}" font-family="VT323, monospace" font-size="13" fill="#ffffff" text-anchor="middle" font-weight="bold" dominant-baseline="middle">${text.toUpperCase()}</text>
        </svg>`;
    }

    // Render badge from attestation URL
    async function renderBadge(element) {
        const attestationUrl = element.getAttribute('data-attestation-url');
        
        if (!attestationUrl) {
            element.innerHTML = '<span style="color: red;">Missing attestation URL</span>';
            return;
        }

        try {
            const response = await fetch(attestationUrl);
            if (!response.ok) throw new Error('Failed to fetch attestation');
            
            const attestation = await response.json();
            
            // Create verification URL
            const verifyUrl = `https://attest.97115104.com/verify/?url=${encodeURIComponent(attestationUrl)}`;
            
            // Create badge SVG
            const svg = createBadgeSVG(attestation.model, attestation.role);
            
            // Create clickable badge
            element.innerHTML = `
                <a href="${verifyUrl}" target="_blank" style="text-decoration: none;">
                    ${svg}
                </a>
            `;
        } catch (error) {
            console.error('Failed to render badge:', error);
            element.innerHTML = '<span style="color: red;">Failed to load badge</span>';
        }
    }

    // Auto-render all badges on page
    function renderAllBadges() {
        const badges = document.querySelectorAll('.ai-attest-badge[data-attestation-url]');
        badges.forEach(badge => renderBadge(badge));
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderAllBadges);
    } else {
        renderAllBadges();
    }

    // Watch for dynamically added badges
    if (window.MutationObserver) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains('ai-attest-badge')) {
                            renderBadge(node);
                        }
                        const badges = node.querySelectorAll('.ai-attest-badge[data-attestation-url]');
                        badges.forEach(badge => renderBadge(badge));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Export functions
    window.AttestInk = {
        renderBadge: renderBadge,
        renderAllBadges: renderAllBadges,
        createBadgeSVG: createBadgeSVG,
        getBadgeUrl: function(model) {
            return `https://attest.97115104.com/static/badges/${model}.svg`;
        }
    };
})();