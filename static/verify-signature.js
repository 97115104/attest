/**
 * Signature verification functions for attest
 */

async function verifySignature(attestation, results) {
    if (!attestation.signature) {
        results.push('<span class="status-invalid">❌ No signature found</span>');
        return;
    }
    
    if (attestation.signature.type === 'local') {
        results.push('<span class="status-pending">🔐 Local signature detected</span>');
        results.push(`<div style="margin: 10px 0;">
            <input type="password" id="verify-password" placeholder="Enter signing password" style="width: 200px;">
            <button onclick="verifyLocalSignature(currentAttestation)" class="btn btn-secondary" style="margin-left: 10px;">Verify Password</button>
            <div id="local-verify-result" style="margin-top: 10px;"></div>
        </div>`);
        return;
    } else if (attestation.signature.type !== 'ethereum') {
        results.push('<span class="status-invalid">❌ Unsupported signature type</span>');
        return;
    }
    
    // Ethereum signature verification
    try {
        // Recreate the message that was signed
        const message = attestation.signature.message || JSON.stringify({
            content_hash: attestation.content_hash,
            model: attestation.model,
            timestamp: attestation.timestamp
        });

        // Recover the signer address
        const recoveredAddress = ethers.utils.verifyMessage(message, attestation.signature.value);
        
        if (recoveredAddress.toLowerCase() === attestation.signature.signer.toLowerCase()) {
            results.push(`<span class="status-valid">✓ Valid Ethereum signature from ${attestation.signature.signer}</span>`);
        } else {
            results.push(`<span class="status-invalid">❌ Invalid signature (expected ${attestation.signature.signer}, got ${recoveredAddress})</span>`);
        }
    } catch (error) {
        results.push('<span class="status-invalid">❌ Failed to verify signature: ' + error.message + '</span>');
    }
}

async function verifyLocalSignature(attestation) {
    const password = document.getElementById('verify-password').value;
    if (!password) {
        alert('Please enter the signing password');
        return;
    }
    
    const resultDiv = document.getElementById('local-verify-result');
    
    try {
        // Recreate the signing process
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        // Derive signing key
        const salt = enc.encode('attest.v1.' + attestation.id);
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'HMAC', hash: 'SHA-256', length: 256 },
            false,
            ['sign']
        );
        
        // Sign the message
        const signature = await crypto.subtle.sign(
            'HMAC',
            key,
            enc.encode(attestation.signature.message)
        );
        
        // Convert to hex
        const sigArray = Array.from(new Uint8Array(signature));
        const calculatedSig = '0x' + sigArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Verify signer ID
        const signerData = enc.encode('attest.signer.' + password);
        const signerHash = await crypto.subtle.digest('SHA-256', signerData);
        const signerArray = Array.from(new Uint8Array(signerHash));
        const calculatedSigner = '0x' + signerArray.slice(0, 20).map(b => b.toString(16).padStart(2, '0')).join('');
        
        if (calculatedSig === attestation.signature.value && calculatedSigner === attestation.signature.signer) {
            resultDiv.innerHTML = '<span class="status-valid">✓ Password verified! Signature is authentic.</span>';
        } else {
            resultDiv.innerHTML = '<span class="status-invalid">❌ Incorrect password or tampered signature</span>';
        }
    } catch (error) {
        resultDiv.innerHTML = '<span class="status-invalid">❌ Verification error: ' + error.message + '</span>';
    }
}