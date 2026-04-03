// attestation-result.js - Logic for displaying attestation results

// Check if we're coming back from a successful payment
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
        // Show success message
        if (window.AttestModal) {
            window.AttestModal.alert('Payment successful! Your short URL is being created...', '🎉 Success');
        }
        // Remove the payment_success parameter from URL
        const newUrl = window.location.pathname + '?id=' + urlParams.get('id');
        window.history.replaceState({}, document.title, newUrl);
    }
});

async function generateAttestationDisplay(attestation) {
    const badgePreview = document.getElementById('badge-preview');
    const embedCodeEl = document.getElementById('badge-embed-code');
    const linkCodeEl = document.getElementById('badge-link-code');
    const dataUrlEl = document.getElementById('badge-data-url');
    const latexSection = document.getElementById('latex-section');
    const markdownSection = document.getElementById('markdown-section');
    
    // Get badge style from attestation metadata or default
    const badgeStyle = attestation.badge_style || 'default';
    
    // Create short URL using just the ID
    const shortVerifyUrl = `https://attest.97115104.com/verify/?id=${attestation.id}`;
    
    // Also create the full data URL for embedding (self-contained)
    const attestationB64 = btoa(JSON.stringify(attestation));
    const fullDataUrl = `https://attest.97115104.com/verify/?data=${attestationB64}`;
    
    // Create a proper data URL for the API
    const dataUrlForApi = `data:application/json;base64,${attestationB64}`;
    
    // Try to create a shortened URL if we're on Vercel
    let shortUrl = null;
    let requiresPayment = false;
    
    console.log('Current hostname:', window.location.hostname);
    
    // Check if we're on Vercel, attest.97115104.com, or localhost (for development)
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('attest.97115104.com') || 
        window.location.hostname === 'localhost') {
        try {
            // Check localStorage for email or API key
            const savedEmail = localStorage.getItem('attest_ink_email');
            const savedApiKey = localStorage.getItem('attest_ink_api_key');
            
            console.log('Attempting to create short URL...');
            console.log('Email:', savedEmail);
            console.log('API Key:', savedApiKey ? 'Present' : 'Not present');
            console.log('Data URL length:', dataUrlForApi.length);
            console.log('Data URL preview:', dataUrlForApi.substring(0, 100) + '...');
            
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    dataUrl: dataUrlForApi,
                    email: savedEmail,
                    apiKey: savedApiKey
                })
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.status === 400) {
                console.error('Bad request error:', data.error);
            }
            
            if (response.ok) {
                shortUrl = data.shortUrl;
                
                // Update the link code to show short URL
                linkCodeEl.textContent = shortUrl;
                
                // Add a note about the permanent short URL
                const shortUrlNote = document.createElement('div');
                shortUrlNote.style.cssText = 'margin-top: 10px; font-size: 12px; color: var(--color-success);';
                shortUrlNote.textContent = '✓ Permanent short URL created';
                linkCodeEl.parentElement.appendChild(shortUrlNote);
            } else if (response.status === 403 && data.requiresPayment) {
                requiresPayment = true;
                
                
                const paymentContainer = document.createElement('div');
                paymentContainer.style.cssText = 'margin-top: 15px; padding: 15px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px;';
                paymentContainer.innerHTML = `
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: var(--text-secondary);">
                        <strong>Unlock permanent short URLs</strong> - Get lifetime access for just $20.
                    </p>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <input type="email" id="payment-email" placeholder="Enter your email" 
                               value="${savedEmail || ''}"
                               style="flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid var(--border-color); 
                                      border-radius: 4px; background: var(--bg-input); color: var(--text-primary);">
                        <input type="text" id="payment-zipcode" placeholder="ZIP code (for tax)" 
                               maxlength="10"
                               style="width: 130px; padding: 8px 12px; border: 1px solid var(--border-color); 
                                      border-radius: 4px; background: var(--bg-input); color: var(--text-primary);">
                        <button id="purchase-short-urls" class="btn btn-primary" style="white-space: nowrap;">
                            Get Lifetime Access - $20
                        </button>
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: var(--text-secondary);">
                        • Create unlimited permanent short URLs<br>
                        • URLs never expire<br>
                        • One-time payment, lifetime access<br>
                        • California residents: sales tax will be added
                    </p>
                `;
                linkCodeEl.parentElement.appendChild(paymentContainer);
                
                // Add click handler for purchase button
                document.getElementById('purchase-short-urls').addEventListener('click', async () => {
                    const email = document.getElementById('payment-email').value.trim();
                    const zipCode = document.getElementById('payment-zipcode').value.trim();
                    
                    if (!email) {
                        if (window.AttestModal) {
                            window.AttestModal.alert('Please enter your email address to continue.', 'Email Required');
                        } else {
                            alert('Please enter your email address');
                        }
                        return;
                    }
                    
                    if (!zipCode) {
                        if (window.AttestModal) {
                            window.AttestModal.alert('Please enter your ZIP code to calculate tax and continue.', 'ZIP Code Required');
                        } else {
                            alert('Please enter your ZIP code');
                        }
                        return;
                    }
                    
                    // Save email for future use
                    localStorage.setItem('attest_ink_email', email);
                    
                    const button = document.getElementById('purchase-short-urls');
                    button.disabled = true;
                    button.textContent = 'Processing...';
                    
                    // Update button text if California zip code
                    if (zipCode && zipCode.length >= 2) {
                        const prefix = parseInt(zipCode.substring(0, 2));
                        if (prefix >= 90 && prefix <= 96) {
                            button.textContent = 'Processing (+ CA tax)...';
                        }
                    }
                    
                    // Store attestation data in sessionStorage for after payment
                    sessionStorage.setItem('pending_attestation', JSON.stringify(attestation));
                    sessionStorage.setItem('pending_attestation_email', email);
                    
                    try {
                        const checkoutResponse = await fetch('/api/create-checkout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email,
                                zipCode,
                                attestationData: attestation,
                                attestationId: attestation.id
                            })
                        });
                        
                        const checkoutData = await checkoutResponse.json();
                        
                        if (checkoutData.alreadyPurchased) {
                            // User already has access
                            localStorage.setItem('attest_ink_api_key', checkoutData.apiKey);
                            if (window.AttestModal) {
                                window.AttestModal.alert('Great news! You already have lifetime access. The page will now reload to create your short URL.', 'Thank you!');
                                setTimeout(() => window.location.reload(), 2000);
                            } else {
                                alert('Great news! You already have lifetime access. The page will now reload to create your short URL.');
                                window.location.reload();
                            }
                        } else if (checkoutData.clientSecret) {
                            // Show embedded checkout
                            await showEmbeddedCheckout(checkoutData.clientSecret, email, attestation);
                        } else {
                            throw new Error('Failed to create checkout session');
                        }
                    } catch (error) {
                        console.error('Checkout error:', error);
                        if (window.AttestModal) {
                            window.AttestModal.alert('Failed to start checkout process. Please try again.', 'Error');
                        } else {
                            alert('Failed to start checkout process. Please try again.');
                        }
                        button.disabled = false;
                        button.textContent = 'Get Lifetime Access - $20';
                    }
                });
            }
        } catch (error) {
            console.error('Failed to create short URL:', error);
            console.error('Error details:', error.message);
            console.error('Stack trace:', error.stack);
            // Fall back to regular URL
        }
    }
    
    // Handle URL display based on payment status
    if (shortUrl) {
        // User has paid and got a short URL
        linkCodeEl.textContent = shortUrl;
    } else if (requiresPayment) {
        // User needs to pay - show grayed out preview
        linkCodeEl.textContent = 'https://attest.97115104.com/s/abc123';
        linkCodeEl.style.opacity = '0.5';
        linkCodeEl.style.filter = 'blur(1px)';
        linkCodeEl.style.pointerEvents = 'none';
        
        const copyBtn = document.getElementById('copy-link-code');
        if (copyBtn) {
            copyBtn.disabled = true;
            copyBtn.style.opacity = '0.5';
            copyBtn.style.cursor = 'not-allowed';
            copyBtn.textContent = 'Unlock with Payment';
        }
    } else {
        // Fallback to regular URL
        linkCodeEl.textContent = shortVerifyUrl;
    }
    
    // Handle LaTeX style
    if (badgeStyle === 'latex') {
        latexSection.style.display = 'block';
        badgePreview.innerHTML = '<div style="font-family: monospace; background: var(--bg-panel); padding: 10px; border: 1px solid var(--border-color); color: var(--text-primary);">LaTeX Badge (see code below)</div>';
        
        // Basic LaTeX code - now shows how to include the modular file
        const roleDisplay = attestation.role === 'edited' ? 'AI-ASSISTED' : attestation.role.toUpperCase().replace('_', '-');
        const latexCode = `% Include AI Attestation section
\\input{ai-attestation}`;
        
        // Extended LaTeX - the content for ai-attestation.tex file
        const modelDisplay = attestation.model === 'human' ? 'Human' : attestation.model;
        
        // Use short URL if available, otherwise full data URL
        const verificationUrl = shortUrl || fullDataUrl;
        const urlText = shortUrl ? shortUrl : 'the attest verification URL';
        
        // Add note about short URLs if user has paid
        if (shortUrl) {
            const shortUrlNote = document.createElement('div');
            shortUrlNote.style.cssText = 'margin: 15px 0; padding: 15px; background: var(--bg-panel); border: 1px solid var(--border-color); border-radius: 8px;';
            shortUrlNote.innerHTML = `<p style="margin: 0; color: var(--text-secondary);"><strong>✓ Using short URL in LaTeX code</strong><br>Short URLs are better for printed documents as they're more readable and less likely to break across lines.</p>`;
            latexSection.insertBefore(shortUrlNote, latexSection.firstChild);
        }
        
        const latexExtended = `% ai-attestation.tex
% AI Attestation section for inclusion in main document
\\section{AI Attestation}
\\begin{center}
\\fbox{\\small\\texttt{${roleDisplay}}}
\\end{center}

This ${attestation.document_type === 'latex' ? 'paper' : 'work'} was ${attestation.role === 'assisted' || attestation.role === 'edited' ? 'assisted by' : attestation.role === 'generated' ? 'generated by' : 'created with'} ${modelDisplay}. These tools served a role similar to LaTeX for typesetting or computational systems for verification, enabling more rigorous expression and validation of ideas. All core concepts, insights, and creative decisions are original human work.\\footnote{For detailed AI tool attribution and transparency, see \\href{${verificationUrl}}{${urlText}}.}`;
        
        document.getElementById('latex-code').textContent = latexCode;
        document.getElementById('latex-extended').textContent = latexExtended;
        
        // Show link section for LaTeX too
        document.getElementById('embed-section').style.display = 'none';
        document.getElementById('link-section').style.display = 'block';
        markdownSection.style.display = 'none';
    } else if (badgeStyle === 'markdown') {
        // Handle markdown style
        markdownSection.style.display = 'block';
        latexSection.style.display = 'none';
        document.getElementById('embed-section').style.display = 'none';
        document.getElementById('link-section').style.display = 'block';
        
        const roleText = attestation.role === 'generated' ? 'AI Generated' : 
                        attestation.role === 'assisted' ? 'AI Assisted' : 
                        attestation.role === 'edited' ? 'AI Edited' : 'AI Involved';
        
        const markdownCode = `[![${roleText}](https://img.shields.io/badge/AI-${encodeURIComponent(roleText.replace(' ', '_'))}-blue)](${shortVerifyUrl})`;
        document.getElementById('markdown-code').textContent = markdownCode;
        
        badgePreview.innerHTML = `<img src="https://img.shields.io/badge/AI-${encodeURIComponent(roleText.replace(' ', '_'))}-blue" alt="${roleText}">`;
    } else {
        // Regular badge styles
        latexSection.style.display = 'none';
        markdownSection.style.display = 'none';
        document.getElementById('embed-section').style.display = 'block';
        document.getElementById('link-section').style.display = 'block';
        
        // Create badge preview based on style
        let badgeHtml = '';
        if (badgeStyle === 'glass') {
            badgeHtml = `<span class="badge-glass badge-glass-primary">AI ${attestation.role.toUpperCase()}</span>`;
        } else if (badgeStyle === 'glass-minimal') {
            badgeHtml = `<span class="badge-glass-minimal">${attestation.role === 'generated' ? 'ai-generated' : 'ai-' + attestation.role}</span>`;
        } else if (badgeStyle === 'terminal') {
            badgeHtml = `<span class="badge-legacy badge-terminal">AI_${attestation.role.toUpperCase()}</span>`;
        } else if (badgeStyle === 'neon') {
            badgeHtml = `<span class="badge-legacy badge-neon">AI ${attestation.role.toUpperCase()}</span>`;
        } else if (badgeStyle === 'rainbow') {
            badgeHtml = `<span class="badge-legacy badge-rainbow">AI ${attestation.role.toUpperCase()}</span>`;
        } else if (badgeStyle === 'matrix') {
            badgeHtml = `<span class="badge-legacy badge-matrix">AI ${attestation.role.toUpperCase()}</span>`;
        } else if (badgeStyle === 'holographic') {
            badgeHtml = `<span class="badge-legacy badge-holographic">AI ${attestation.role.toUpperCase()}</span>`;
        } else {
            // Default badge
            const svg = window.AttestInk ? window.AttestInk.createBadgeSVG(attestation.model, attestation.role) : '';
            badgeHtml = svg || `<span style="display: inline-flex; align-items: center; padding: 4px 12px; background: #2563eb; color: white; font-family: VT323, monospace; font-size: 16px; text-transform: uppercase; border-radius: 4px;">AI ${attestation.role.toUpperCase()}</span>`;
        }
        
        badgePreview.innerHTML = badgeHtml;
        
        // Generate embed code - use short URL if available, otherwise full data URL
        const embedUrl = shortUrl || fullDataUrl;
        const embedCode = `<!-- attest AI Badge -->
<a href="${embedUrl}" target="_blank" style="text-decoration: none;">
    ${badgeHtml}
</a>`;
        
        embedCodeEl.textContent = embedCode;
    }
    
    // Always set the data URL
    dataUrlEl.textContent = fullDataUrl;
    
    // Generate curl command for API
    const curlCommand = `curl -s "https://attest.97115104.com/api/create.html?content_name=${encodeURIComponent(attestation.content_name)}&model=${encodeURIComponent(attestation.model)}&role=${encodeURIComponent(attestation.role)}&document_type=${encodeURIComponent(attestation.document_type)}&author=${encodeURIComponent(attestation.author || 'Anonymous')}&output=curl"`;
    document.getElementById('api-curl-command').textContent = curlCommand;
}

// Initialize copy button handlers
function initializeCopyButtons() {
    // Copy embed code
    const copyEmbedBtn = document.getElementById('copy-embed-code');
    if (copyEmbedBtn) {
        copyEmbedBtn.addEventListener('click', async function() {
            const code = document.getElementById('badge-embed-code').textContent;
            try {
                await navigator.clipboard.writeText(code);
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy Embed Code';
                }, 2000);
            } catch (err) {
                alert('Failed to copy embed code');
            }
        });
    }
    
    // Copy link code
    const copyLinkBtn = document.getElementById('copy-link-code');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', async function() {
            const code = document.getElementById('badge-link-code').textContent;
            try {
                await navigator.clipboard.writeText(code);
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy Short URL';
                }, 2000);
            } catch (err) {
                alert('Failed to copy link');
            }
        });
    }
    
    // Copy data URL
    const copyDataUrlBtn = document.getElementById('copy-data-url');
    if (copyDataUrlBtn) {
        copyDataUrlBtn.addEventListener('click', async function() {
            const code = document.getElementById('badge-data-url').textContent;
            try {
                await navigator.clipboard.writeText(code);
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy Data URL';
                }, 2000);
            } catch (err) {
                alert('Failed to copy data URL');
            }
        });
    }
    
    // Copy API command
    const copyApiBtn = document.getElementById('copy-api-command');
    if (copyApiBtn) {
        copyApiBtn.addEventListener('click', async function() {
            const code = document.getElementById('api-curl-command').textContent;
            try {
                await navigator.clipboard.writeText(code);
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy curl Command';
                }, 2000);
            } catch (err) {
                alert('Failed to copy command');
            }
        });
    }
    
    // Copy LaTeX code
    const copyLatexBtn = document.getElementById('copy-latex-code');
    if (copyLatexBtn) {
        copyLatexBtn.addEventListener('click', async function() {
            const code = document.getElementById('latex-code').textContent;
            try {
                await navigator.clipboard.writeText(code);
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy Main File Code';
                }, 2000);
            } catch (err) {
                alert('Failed to copy LaTeX code');
            }
        });
    }
    
    // Copy extended LaTeX
    const copyLatexExtBtn = document.getElementById('copy-latex-extended');
    if (copyLatexExtBtn) {
        copyLatexExtBtn.addEventListener('click', async function() {
            const code = document.getElementById('latex-extended').textContent;
            try {
                await navigator.clipboard.writeText(code);
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy ai-attestation.tex Content';
                }, 2000);
            } catch (err) {
                alert('Failed to copy LaTeX code');
            }
        });
    }
    
    // Copy markdown code
    const copyMarkdownBtn = document.getElementById('copy-markdown-code');
    if (copyMarkdownBtn) {
        copyMarkdownBtn.addEventListener('click', async function() {
            const code = document.getElementById('markdown-code').textContent;
            try {
                await navigator.clipboard.writeText(code);
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = 'Copy Markdown';
                }, 2000);
            } catch (err) {
                alert('Failed to copy markdown');
            }
        });
    }
}

// Stripe embedded checkout functionality
async function showEmbeddedCheckout(clientSecret, email, attestation) {
    // Use test key for now - in production this should be configured
    const stripe = window.Stripe('pk_test_51RnmhPCS9p44gPz1OJCQxT03PN5Vww2KZCW6zzKfJyW1qCF1fIgGxLbxe3cOgv4GHiM9ND0jvQOqrTTQQvGjbcGa00cKCt0Ugw');
    
    // Add blur to the main content
    const mainContent = document.body;
    const blurOverlay = document.createElement('div');
    blurOverlay.id = 'blur-overlay';
    blurOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        background: rgba(0, 0, 0, 0.6);
        z-index: 9999;
    `;
    document.body.appendChild(blurOverlay);
    
    // Create modal for embedded checkout
    const modal = document.createElement('div');
    modal.id = 'checkout-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: var(--bg-main);
        border-radius: 12px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow: auto;
        position: relative;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    `;
    
    // Add header with Stripe branding
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    header.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="/assets/logo/circular-2-ai.svg" alt="attest" style="width: 32px; height: 32px;">
            <span style="font-size: 18px; font-weight: 600;">Complete Your Purchase</span>
        </div>
        <button id="close-checkout" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s;
        " onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='none'">×</button>
    `;
    
    // Add checkout container
    const checkoutContainer = document.createElement('div');
    checkoutContainer.id = 'checkout';
    checkoutContainer.style.cssText = 'padding: 20px;';
    
    // Add powered by Stripe notice
    const stripeNotice = document.createElement('div');
    stripeNotice.style.cssText = `
        padding: 15px 20px;
        background: var(--bg-panel);
        border-top: 1px solid var(--border-color);
        text-align: center;
        font-size: 14px;
        color: var(--text-secondary);
    `;
    stripeNotice.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg width="50" height="20" viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.73126 7.58614C6.73126 6.62846 7.46924 6.24954 8.52593 6.24954C9.98147 6.24954 11.8171 6.6886 13.2724 7.48597V3.5429C11.6967 2.84477 10.1419 2.62573 8.52593 2.62573C4.67489 2.62573 2.11768 4.66008 2.11768 7.90691C2.11768 13.0949 9.16172 12.216 9.16172 14.4117C9.16172 15.5089 8.24303 15.8678 7.0864 15.8678C5.47082 15.8678 3.43366 15.1899 1.79768 14.3315V18.3344C3.53383 19.1324 5.29046 19.4114 7.0864 19.4114C11.0578 19.4114 13.8354 17.4366 13.8354 14.1306C13.8148 8.46551 6.73126 9.60423 6.73126 7.58614ZM18.5901 3.86453L18.1092 6.21516H16.0932V10.0384C16.0932 11.3364 16.6541 11.9749 17.832 11.9749C18.4284 11.9749 18.8296 11.8954 19.1694 11.7349L19.1899 15.4396C18.5901 15.6601 17.5708 15.8807 16.4949 15.8807C13.3755 15.8807 11.62 14.1224 11.62 11.116V2.06712L16.0932 1.20844V3.01518H19.0899L18.5901 3.86453ZM25.9008 2.62443C24.7066 2.62443 23.7904 3.00227 23.0513 3.82063L22.8118 3.00227H19.0522V19.1116H23.5261V17.6539C24.2462 18.3128 25.2248 18.6917 26.4423 18.6917C29.6012 18.6917 32.2789 16.2174 32.2789 10.6118C32.2584 5.56872 29.2614 2.62443 25.9008 2.62443ZM25.0993 14.9288C23.9628 14.9288 23.2236 14.4297 22.7631 13.8316L22.7426 13.6712V7.00753C23.2236 6.36923 23.9833 5.87014 25.1198 5.87014C26.8378 5.87014 28.0128 7.54716 28.0128 10.413C28.0128 13.3384 26.8583 14.9288 25.0993 14.9288ZM42.4359 10.1743C42.4359 14.5616 39.8794 18.7046 35.1672 18.7046C30.5139 18.7046 27.7566 14.9212 27.7566 10.652C27.7566 6.28392 30.3534 2.61981 35.0056 2.61981C38.1189 2.61981 40.4958 3.8983 41.7149 4.916L40.1955 7.82987C39.1584 7.0318 37.6799 6.31307 35.9423 6.31307C34.2043 6.31307 32.7264 7.11158 32.345 9.00769L42.3968 9.00769C42.4174 9.36662 42.4359 9.86532 42.4359 10.1743ZM32.4246 11.8411C32.6641 13.8575 34.0624 15.0548 35.9833 15.0548C37.2783 15.0548 38.1968 14.4363 38.4772 13.0194V12.0016L32.4041 12.0016L32.4246 11.8411Z" fill="#635BFF"/>
            </svg>
            Secure payment powered by Stripe
        </div>
    `;
    
    modalContent.appendChild(header);
    modalContent.appendChild(checkoutContainer);
    modalContent.appendChild(stripeNotice);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Initialize embedded checkout
    try {
        const checkout = await stripe.initEmbeddedCheckout({
            clientSecret,
        });
        
        // Mount checkout
        checkout.mount('#checkout');
        
        // Handle close button
        document.getElementById('close-checkout').addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel the payment process?')) {
                modal.remove();
                document.getElementById('blur-overlay')?.remove();
                // Refresh the page to reset the state
                window.location.reload();
            }
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (confirm('Are you sure you want to cancel the payment process?')) {
                    modal.remove();
                    document.getElementById('blur-overlay')?.remove();
                    // Refresh the page to reset the state
                    window.location.reload();
                }
            }
        });
    } catch (error) {
        console.error('Failed to initialize embedded checkout:', error);
        modal.remove();
        document.getElementById('blur-overlay')?.remove();
        throw error;
    }
}

// Handle payment completion
async function handlePaymentComplete() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('payment_complete');
    
    if (!sessionId) return;
    
    // Check if we've already processed this payment session
    const processedSessions = JSON.parse(localStorage.getItem('processed_payment_sessions') || '[]');
    if (processedSessions.includes(sessionId)) {
        console.log('Payment session already processed, redirecting...');
        // Redirect to attestation creation page to avoid duplicate processing
        window.location.href = '/';
        return;
    }
    
    // Get pending attestation data
    const pendingAttestation = sessionStorage.getItem('pending_attestation');
    const pendingEmail = sessionStorage.getItem('pending_attestation_email');
    
    if (!pendingAttestation) {
        console.error('No pending attestation found after payment');
        // Still verify the payment to save the API key
        try {
            const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success && verifyData.apiKey) {
                // Mark this session as processed
                const processedSessions = JSON.parse(localStorage.getItem('processed_payment_sessions') || '[]');
                processedSessions.push(sessionId);
                localStorage.setItem('processed_payment_sessions', JSON.stringify(processedSessions));
                
                // Save API key
                localStorage.setItem('attest_ink_api_key', verifyData.apiKey);
                localStorage.setItem('attest_ink_email', verifyData.email);
                
                // Launch confetti
                launchConfetti();
                
                // Check if a short URL was created from metadata
                if (verifyData.shortUrl) {
                    // Show success with short URL from metadata
                    if (window.AttestModal) {
                        window.AttestModal.showSuccess(
                            `Payment successful! Your short URL has been created:<br><br>
                            <div style="display: flex; gap: 10px; align-items: center; margin: 15px 0;">
                                <input type="text" value="${verifyData.shortUrl}" readonly 
                                       style="flex: 1; padding: 10px; font-family: monospace; background: var(--bg-input); 
                                              border: 1px solid var(--border-color); border-radius: 4px;"
                                       onclick="this.select()">
                                <button onclick="navigator.clipboard.writeText('${verifyData.shortUrl}').then(() => {
                                    this.textContent = 'Copied!';
                                    setTimeout(() => this.textContent = 'Copy', 2000);
                                })" class="btn btn-secondary">Copy</button>
                            </div>`,
                            'Thank you!'
                        );
                    }
                    
                    // Redirect to create page after a delay
                    setTimeout(() => {
                        window.location.href = '/create/';
                    }, 5000);
                } else {
                    // Show success message without short URL
                    if (window.AttestModal) {
                        window.AttestModal.showSuccess(
                            `Payment successful! You now have lifetime access to create short URLs.<br><br>
                            Your API key has been saved and emailed to you.<br><br>
                            <em>Note: The attestation data was lost during payment processing, but you can create new short URLs anytime.</em>`,
                            'Thank you!'
                        );
                    }
                    
                    // Redirect to create page after a delay
                    setTimeout(() => {
                        window.location.href = '/create/';
                    }, 4000);
                }
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
        }
        return;
    }
    
    try {
        // Verify payment
        const verifyResponse = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId })
        });
        
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success && verifyData.apiKey) {
            // Mark this session as processed
            const processedSessions = JSON.parse(localStorage.getItem('processed_payment_sessions') || '[]');
            processedSessions.push(sessionId);
            localStorage.setItem('processed_payment_sessions', JSON.stringify(processedSessions));
            
            // Save API key
            localStorage.setItem('attest_ink_api_key', verifyData.apiKey);
            localStorage.setItem('attest_ink_email', verifyData.email);
            
            // Clear pending data
            sessionStorage.removeItem('pending_attestation');
            sessionStorage.removeItem('pending_attestation_email');
            
            // Launch confetti
            launchConfetti();
            
            // Create short URL with the original attestation data
            const attestation = JSON.parse(pendingAttestation);
            const dataUrl = `data:application/json;base64,${btoa(JSON.stringify(attestation))}`;
            
            const shortResponse = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: dataUrl,
                    apiKey: verifyData.apiKey
                })
            });
            
            if (shortResponse.ok) {
                const shortData = await shortResponse.json();
                
                // Show success modal with short URL
                if (window.AttestModal) {
                    window.AttestModal.showSuccess(
                        `Payment successful! Your short URL has been created:<br><br>
                        <div style="display: flex; gap: 10px; align-items: center; margin: 15px 0;">
                            <input type="text" value="${shortData.shortUrl}" readonly 
                                   style="flex: 1; padding: 10px; font-family: monospace; background: var(--bg-input); 
                                          border: 1px solid var(--border-color); border-radius: 4px;"
                                   onclick="this.select()">
                            <button onclick="navigator.clipboard.writeText('${shortData.shortUrl}').then(() => {
                                this.textContent = 'Copied!';
                                setTimeout(() => this.textContent = 'Copy', 2000);
                            })" class="btn btn-secondary">Copy</button>
                        </div>`,
                        'Thank you!'
                    );
                }
                
                // Reload page after a delay to show the short URL
                setTimeout(() => {
                    window.location.href = window.location.pathname + '?id=' + attestation.id;
                }, 3000);
            }
        }
    } catch (error) {
        console.error('Error handling payment completion:', error);
        if (window.AttestModal) {
            window.AttestModal.alert('There was an error processing your payment. Please contact support if you were charged.', 'Error');
        }
    }
}

// Confetti animation
function launchConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10001;';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff1493'];
    
    // Create confetti particles
    for (let i = 0; i < 150; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: -10,
            w: Math.random() * 10 + 5,
            h: Math.random() * 5 + 3,
            vx: Math.random() * 6 - 3,
            vy: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 360,
            spin: Math.random() * 10 - 5
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((c, index) => {
            c.y += c.vy;
            c.x += c.vx;
            c.angle += c.spin;
            c.vy += 0.1; // gravity
            
            ctx.save();
            ctx.translate(c.x + c.w/2, c.y + c.h/2);
            ctx.rotate(c.angle * Math.PI / 180);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
            ctx.restore();
            
            // Remove if off screen
            if (c.y > canvas.height) {
                confetti.splice(index, 1);
            }
        });
        
        if (confetti.length > 0) {
            requestAnimationFrame(animate);
        } else {
            // Clean up canvas after animation
            canvas.remove();
        }
    }
    
    animate();
}

// Check for payment completion on page load
window.addEventListener('DOMContentLoaded', handlePaymentComplete);

// Export functions for use in HTML
window.generateAttestationDisplay = generateAttestationDisplay;
window.initializeCopyButtons = initializeCopyButtons;