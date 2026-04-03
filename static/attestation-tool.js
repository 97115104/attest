/**
 * attest Attestation Tool
 * Core logic for creating and verifying AI content attestations
 */

(function(window) {
    'use strict';

    // Attestation schema version
    const SCHEMA_VERSION = '2.0';

    // Utility functions
    const utils = {
        // Generate SHA-256 hash of content
        async sha256(content) {
            const encoder = new TextEncoder();
            const data = encoder.encode(content);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },

        // Generate unique ID
        generateId() {
            const timestamp = new Date().toISOString().split('T')[0];
            const random = Math.random().toString(36).substring(2, 8);
            return `${timestamp}-${random}`;
        },

        // Format timestamp
        formatTimestamp(date = new Date()) {
            return date.toISOString();
        },

        // Validate attestation schema
        validateSchema(attestation) {
            if (!attestation || typeof attestation !== 'object') {
                return { valid: false, error: 'Invalid attestation object' };
            }

            // Check required fields for v2
            if (attestation.version && attestation.version.startsWith('2')) {
                const required = ['version', 'content_hash', 'model', 'timestamp'];
                for (const field of required) {
                    if (!attestation[field]) {
                        return { valid: false, error: `Missing required field: ${field}` };
                    }
                }
            }

            return { valid: true };
        },

        // Download JSON file
        downloadJSON(data, filename) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        // Copy to clipboard
        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            }
        }
    };

    // Attestation Creator
    class AttestationCreator {
        constructor() {
            this.form = document.getElementById('attestation-form');
            this.resultSection = document.getElementById('result-section');
            this.currentAttestation = null;
            
            if (this.form) {
                this.initializeForm();
            }
        }

        initializeForm() {
            this.form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.createAttestation();
            });

            // Save draft functionality
            const saveDraftBtn = document.getElementById('save-draft');
            if (saveDraftBtn) {
                saveDraftBtn.addEventListener('click', () => this.saveDraft());
            }

            // Load draft if exists
            this.loadDraft();

            // Live preview updates
            const inputs = this.form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.updatePreview());
            });

            // Result section handlers
            this.initializeResultHandlers();
        }

        async createAttestation() {
            const formData = new FormData(this.form);
            
            // Get content and calculate hash
            const content = formData.get('content');
            const contentHash = await utils.sha256(content);

            // Get model info
            let model = formData.get('model');
            if (model === 'other') {
                model = formData.get('model-other');
            }

            // Build attestation object
            const attestation = {
                version: SCHEMA_VERSION,
                id: utils.generateId(),
                content_hash: contentHash,
                model: model,
                role: formData.get('role'),
                timestamp: utils.formatTimestamp(),
                author: formData.get('author') || undefined,
                platform: 'attest.97115104.com',
                badge_style: formData.get('badge-style') || 'default'
            };

            // Handle prompt
            const prompt = formData.get('prompt');
            if (prompt) {
                if (formData.get('prompt-private')) {
                    attestation.prompt_hash = await utils.sha256(prompt);
                } else {
                    attestation.prompt = prompt;
                }
            }

            // Handle signature (placeholder for now)
            const signatureMethod = formData.get('signature-method');
            if (signatureMethod !== 'none') {
                attestation.signature = await this.signContent(attestation, signatureMethod);
            }

            this.currentAttestation = attestation;
            this.showResults();
        }

        async signContent(attestation, method) {
            // Placeholder for signature implementation
            // In a real implementation, this would integrate with Web3 or PGP
            return {
                type: method,
                value: 'signature_placeholder',
                signer: 'signer_placeholder'
            };
        }

        updatePreview() {
            const preview = document.getElementById('attestation-preview');
            if (!preview) return;

            const formData = new FormData(this.form);
            const previewData = {
                version: SCHEMA_VERSION,
                content_hash: 'sha256:' + '0'.repeat(64),
                model: formData.get('model') || 'gpt-4',
                role: formData.get('role') || 'generated',
                timestamp: utils.formatTimestamp(),
                author: formData.get('author') || undefined
            };

            preview.textContent = JSON.stringify(previewData, null, 2);
        }


        initializeResultHandlers() {
            // Download JSON
            const downloadBtn = document.getElementById('download-json');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    const filename = `attest-${this.currentAttestation.id}.json`;
                    utils.downloadJSON(this.currentAttestation, filename);
                });
            }

            // Copy embed code
            const copyEmbedBtn = document.getElementById('copy-embed');
            if (copyEmbedBtn) {
                copyEmbedBtn.addEventListener('click', async () => {
                    const embedCode = document.getElementById('embed-code-preview').textContent;
                    await utils.copyToClipboard(embedCode);
                    copyEmbedBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyEmbedBtn.textContent = '=� Copy Embed Code';
                    }, 2000);
                });
            }

            // Create PR
            const createPRBtn = document.getElementById('create-pr');
            if (createPRBtn) {
                createPRBtn.addEventListener('click', () => {
                    this.showPRInstructions();
                });
            }

            // Create another
            const createAnotherBtn = document.getElementById('create-another');
            if (createAnotherBtn) {
                createAnotherBtn.addEventListener('click', () => {
                    this.form.style.display = 'block';
                    this.resultSection.style.display = 'none';
                    this.form.reset();
                    this.updatePreview();
                });
            }
        }

        showPRInstructions() {
            const instructions = `
To submit your attestation to the attest repository:

1. Fork the repository: https://github.com/97115104/attest
2. Create a new file in: attestations/v2/${this.currentAttestation.id}.json
3. Paste your attestation JSON
4. Create a pull request

Or use the GitHub CLI:
gh repo fork 97115104/attest
git checkout -b add-attestation-${this.currentAttestation.id}
# Add your file
git commit -m "Add attestation ${this.currentAttestation.id}"
gh pr create
            `;
            alert(instructions);
        }

        saveDraft() {
            const formData = new FormData(this.form);
            const draft = {};
            for (const [key, value] of formData.entries()) {
                draft[key] = value;
            }
            localStorage.setItem('attest-draft', JSON.stringify(draft));
            
            const btn = document.getElementById('save-draft');
            btn.textContent = 'Draft Saved!';
            setTimeout(() => {
                btn.textContent = 'Save Draft';
            }, 2000);
        }

        loadDraft() {
            const draft = localStorage.getItem('attest-draft');
            if (!draft) return;

            const data = JSON.parse(draft);
            Object.entries(data).forEach(([key, value]) => {
                const input = this.form.elements[key];
                if (input) {
                    input.value = value;
                }
            });

            this.updatePreview();
        }
    }

    // Attestation Verifier
    class AttestationVerifier {
        constructor() {
            this.currentAttestation = null;
            this.attestationUrl = null;
        }

        async verifyFromUrl(url) {
            this.attestationUrl = url;
            
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.status}`);
                }

                const attestation = await response.json();
                await this.verifyAttestation(attestation);
            } catch (error) {
                this.showError(`Failed to fetch attestation: ${error.message}`);
            }
        }

        async verifyAttestation(attestation) {
            this.currentAttestation = attestation;

            // Validate schema
            const validation = utils.validateSchema(attestation);
            if (!validation.valid) {
                this.showError(validation.error);
                return;
            }

            // Show results
            this.showResults();
        }

        showResults() {
            const attestation = this.currentAttestation;

            // Hide other sections
            document.getElementById('input-section').style.display = 'none';
            document.getElementById('loading-section').style.display = 'none';
            document.getElementById('error-section').style.display = 'none';
            document.getElementById('results-section').style.display = 'block';

            // Update verification status
            const statusBadge = document.getElementById('status-badge');
            statusBadge.innerHTML = '<span class="status-success"> Valid Attestation</span>';

            // Update details
            document.getElementById('detail-version').textContent = attestation.version || '1.0';
            document.getElementById('detail-timestamp').textContent = 
                new Date(attestation.timestamp || attestation.created_at).toLocaleString();
            document.getElementById('detail-model').textContent = attestation.model || attestation.ai_model || '-';
            document.getElementById('detail-role').textContent = attestation.role || attestation.ai_role || '-';
            document.getElementById('detail-author').textContent = attestation.author || '-';
            document.getElementById('detail-platform').textContent = attestation.platform || '-';

            // Update content hash
            document.getElementById('content-hash').textContent = 
                attestation.content_hash || attestation.sha256 || '-';

            // Handle signature section
            const signatureSection = document.getElementById('signature-section');
            if (attestation.signature) {
                signatureSection.style.display = 'block';
                document.getElementById('signature-type').textContent = attestation.signature.type;
                document.getElementById('signature-signer').textContent = attestation.signature.signer;
            } else {
                signatureSection.style.display = 'none';
            }

            // Build timeline
            this.buildTimeline();

            // Show raw JSON
            document.getElementById('raw-json').textContent = 
                JSON.stringify(attestation, null, 2);

            // Setup action handlers
            this.setupActionHandlers();
        }

        buildTimeline() {
            const timeline = document.getElementById('timeline');
            timeline.innerHTML = '';

            const attestation = this.currentAttestation;
            const events = [];

            // Created event
            events.push({
                time: attestation.timestamp || attestation.created_at,
                event: 'Attestation created',
                icon: '<�'
            });

            // Model used
            if (attestation.model) {
                events.push({
                    time: attestation.timestamp || attestation.created_at,
                    event: `AI model: ${attestation.model}`,
                    icon: '>'
                });
            }

            // Signature
            if (attestation.signature) {
                events.push({
                    time: attestation.timestamp || attestation.created_at,
                    event: 'Digitally signed',
                    icon: '='
                });
            }

            // Render timeline
            events.forEach(event => {
                const item = document.createElement('div');
                item.className = 'timeline-item';
                item.innerHTML = `
                    <span class="timeline-icon">${event.icon}</span>
                    <div class="timeline-content">
                        <div class="timeline-event">${event.event}</div>
                        <div class="timeline-time">${new Date(event.time).toLocaleString()}</div>
                    </div>
                `;
                timeline.appendChild(item);
            });
        }

        setupActionHandlers() {
            // Content verification
            const verifyContentBtn = document.getElementById('verify-content');
            if (verifyContentBtn) {
                verifyContentBtn.addEventListener('click', () => {
                    document.getElementById('content-file').click();
                });
            }

            const contentFileInput = document.getElementById('content-file');
            if (contentFileInput) {
                contentFileInput.addEventListener('change', async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        await this.verifyContentHash(file);
                    }
                });
            }

            // Download attestation
            const downloadBtn = document.getElementById('download-attestation');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', () => {
                    const filename = `attestation-${this.currentAttestation.id || 'download'}.json`;
                    utils.downloadJSON(this.currentAttestation, filename);
                });
            }

            // Share link
            const shareBtn = document.getElementById('share-verification');
            if (shareBtn) {
                shareBtn.addEventListener('click', async () => {
                    const url = `${window.location.origin}/view/?url=${encodeURIComponent(this.attestationUrl)}`;
                    await utils.copyToClipboard(url);
                    shareBtn.textContent = 'Link Copied!';
                    setTimeout(() => {
                        shareBtn.textContent = 'Share Verification Link';
                    }, 2000);
                });
            }
        }

        async verifyContentHash(file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                const calculatedHash = await utils.sha256(content);
                const expectedHash = this.currentAttestation.content_hash || this.currentAttestation.sha256;

                const verificationDiv = document.getElementById('content-verification');
                if (calculatedHash === expectedHash) {
                    verificationDiv.innerHTML = `
                        <span class="status-icon"></span>
                        <span class="status-text">Content hash verified!</span>
                    `;
                } else {
                    verificationDiv.innerHTML = `
                        <span class="status-icon">L</span>
                        <span class="status-text">Content hash mismatch</span>
                    `;
                }
            };
            reader.readAsText(file);
        }

        showError(message) {
            document.getElementById('input-section').style.display = 'none';
            document.getElementById('loading-section').style.display = 'none';
            document.getElementById('results-section').style.display = 'none';
            document.getElementById('error-section').style.display = 'block';
            document.getElementById('error-message').textContent = message;
        }
    }

    // Initialize based on current page
    window.addEventListener('DOMContentLoaded', () => {
        // Check if we're on the creator page
        if (document.getElementById('attestation-form')) {
            window.attestationCreator = new AttestationCreator();
        }

        // Check if we're on the verifier page
        if (document.getElementById('url-form')) {
            window.attestationVerifier = new AttestationVerifier();
            
            // Expose functions for the page
            window.verifyFromUrl = (url) => window.attestationVerifier.verifyFromUrl(url);
            window.verifyAttestation = (attestation) => window.attestationVerifier.verifyAttestation(attestation);
        }
    });

    // Export utilities
    window.AttestationTool = {
        utils: utils,
        Creator: AttestationCreator,
        Verifier: AttestationVerifier
    };

})(window);