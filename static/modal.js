// Branded modal system for attest
window.AttestModal = {
    show: function(title, message, options = {}) {
        // Remove any existing modals
        const existingModal = document.getElementById('attest-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal elements
        const modal = document.createElement('div');
        modal.id = 'attest-modal';
        modal.className = 'attest-modal-overlay';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'attest-modal-content';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'attest-modal-header';
        
        const logoContainer = document.createElement('div');
        logoContainer.style.cssText = 'display: flex; align-items: center; gap: 12px;';
        
        const logo = document.createElement('img');
        logo.src = '/assets/logo/circular-2-ai.svg';
        logo.alt = 'attest';
        logo.className = 'attest-modal-logo';
        
        logoContainer.appendChild(logo);
        
        if (options.headerText !== false) {
            const headerText = document.createElement('span');
            headerText.textContent = options.headerText || 'Thank you!';
            headerText.style.cssText = 'font-size: 18px; font-weight: 600; color: var(--text-primary);';
            logoContainer.appendChild(headerText);
        }
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'attest-modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.close();
        
        modalHeader.appendChild(logoContainer);
        modalHeader.appendChild(closeBtn);
        
        const modalBody = document.createElement('div');
        modalBody.className = 'attest-modal-body';
        
        if (title) {
            const titleEl = document.createElement('h2');
            titleEl.className = 'attest-modal-title';
            titleEl.textContent = title;
            modalBody.appendChild(titleEl);
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = 'attest-modal-message';
        messageEl.innerHTML = message;
        modalBody.appendChild(messageEl);
        
        if (options.buttons) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'attest-modal-buttons';
            
            options.buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = `btn ${btn.className || 'btn-primary'}`;
                button.textContent = btn.text;
                button.onclick = () => {
                    if (btn.onClick) btn.onClick();
                    if (btn.closeModal !== false) this.close();
                };
                buttonContainer.appendChild(button);
            });
            
            modalBody.appendChild(buttonContainer);
        }
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.style.opacity = '1';
        modalContent.style.backgroundColor = 'var(--bg-main)';
        modal.appendChild(modalContent);
        
        // Add styles if not already present
        if (!document.getElementById('attest-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'attest-modal-styles';
            style.textContent = `
                .attest-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    animation: fadeIn 0.2s ease-out;
                }
                
                .attest-modal-content {
                    background: var(--bg-main);
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
                    animation: slideUp 0.3s ease-out;
                    border: 1px solid var(--border-color);
                    position: relative;
                    opacity: 1 !important;
                }
                
                .attest-modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .attest-modal-logo {
                    width: 40px;
                    height: 40px;
                }
                
                .attest-modal-close {
                    background: none;
                    border: none;
                    font-size: 32px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    line-height: 1;
                    padding: 0;
                    margin: -10px -10px -10px 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                
                .attest-modal-close:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                
                .attest-modal-body {
                    padding: 30px;
                    overflow-y: auto;
                    max-height: calc(90vh - 100px);
                }
                
                .attest-modal-title {
                    margin: 0 0 15px 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                
                .attest-modal-message {
                    font-size: 16px;
                    line-height: 1.6;
                    color: var(--text-secondary);
                }
                
                .attest-modal-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                    margin-top: 30px;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @media (max-width: 600px) {
                    .attest-modal-content {
                        width: 95%;
                        margin: 20px;
                    }
                    
                    .attest-modal-body {
                        padding: 20px;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(modal);
        
        // Close on escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.close();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });
    },
    
    close: function() {
        const modal = document.getElementById('attest-modal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.2s ease-out';
            setTimeout(() => modal.remove(), 200);
        }
    },
    
    alert: function(message, title = '') {
        this.show(title, message, {
            buttons: [{
                text: 'OK',
                className: 'btn-primary'
            }]
        });
    },
    
    showSuccess: function(message, title = 'Success') {
        this.show(title, message, {
            headerText: false,  // Don't show header text to avoid duplicate
            buttons: [{
                text: 'OK',
                className: 'btn-primary'
            }]
        });
    },
    
    confirm: function(message, title = '', onConfirm = () => {}, onCancel = () => {}) {
        this.show(title, message, {
            buttons: [
                {
                    text: 'Cancel',
                    className: 'btn-secondary',
                    onClick: onCancel
                },
                {
                    text: 'Confirm',
                    className: 'btn-primary',
                    onClick: onConfirm
                }
            ]
        });
    }
};

// Add fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);