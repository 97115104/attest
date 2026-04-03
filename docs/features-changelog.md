# attest Features & Changelog

## Latest Features (August 2025)

### Premium Short URLs
- **Permanent Short URLs**: Create short URLs that never expire
- **One-time Payment**: $20 for lifetime access
- **API Access**: Programmatic URL shortening with API key
- **Automatic Receipts**: Professional email receipts with invoices

### Payment Processing
- **Stripe Integration**: Secure payment processing
- **California Tax Calculation**: Automatic sales tax for CA residents
- **ZIP Code Only**: Simplified checkout - no full address required
- **Invoice Generation**: Automatic invoice numbers and receipts

### Email Features
- **Professional Receipts**: Beautiful HTML email templates
- **API Key Delivery**: Secure delivery of API keys via email
- **Invoice Details**: Complete breakdown with tax information
- **McBooBoo LLC**: Billing descriptor information included

### AI Model Updates
- **Claude 4.1 Opus**: Latest Anthropic model added
- **Claude 3.5 Sonnet**: Current production model
- **GPT-5 Placeholder**: Ready for upcoming OpenAI release
- **100+ Models**: Comprehensive coverage of all major AI providers

### User Experience Improvements
- **Back Button Protection**: Prevents duplicate payments/emails
- **Modal Blur Effects**: Enhanced visual design for popups
- **Required ZIP Code**: Ensures proper tax calculation
- **Page Refresh on Cancel**: Clean state management

### Developer Features
- **Vercel Deployment**: Optimized for Vercel platform
- **Environment Variables**: Easy configuration for email/payments
- **API Endpoints**: RESTful API for all operations
- **CI/CD Documentation**: Complete automation guides

## Version History

### v2.1.0 (August 2025)
- Added premium short URL feature with payments
- Implemented California sales tax calculation
- Created professional email receipt system
- Updated AI models list with latest releases
- Enhanced modal system with blur effects
- Added back button payment protection
- Comprehensive CI/CD documentation

### v2.0.0 (July 2025)
- Major protocol update to version 2.0
- Added support for 100+ AI models
- Implemented client-side attestation creation
- Created badge rendering system
- Added digital signature support
- Launched static website on GitHub Pages

### v1.0.0 (June 2025)
- Initial release
- Basic attestation creation
- Simple badge generation
- Proof of concept

## Upcoming Features

### Planned for v2.2.0
- [ ] Browser extension for one-click attestations
- [ ] WordPress plugin with Gutenberg blocks
- [ ] npm package for Node.js projects
- [ ] Python SDK for automation
- [ ] Batch attestation creation
- [ ] Enhanced signature methods (PGP, DID)

### Under Consideration
- IPFS integration for permanent storage
- ENS support for human-readable IDs
- WebAuthn for hardware key signatures
- Multi-language interface
- Advanced analytics dashboard
- Team accounts with shared API keys

## Breaking Changes

### v2.0.0 → v2.1.0
- No breaking changes
- All v2.0 attestations remain valid
- API maintains backward compatibility

### v1.0.0 → v2.0.0
- Schema version changed from 1.0 to 2.0
- `content_hash` now optional (was required)
- Added `prompt` and `prompt_hash` fields
- Changed signature format structure

## Migration Guide

### Upgrading to Premium Features
1. Visit any attestation creation page
2. Attempt to create a short URL
3. Enter email and ZIP code when prompted
4. Complete one-time payment
5. API key is automatically saved and emailed

### API Key Management
```javascript
// Check for saved API key
const apiKey = localStorage.getItem('attest_ink_api_key');

// Use API key for short URLs
const response = await fetch('/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dataUrl: attestationDataUrl,
    apiKey: apiKey
  })
});
```

## Configuration

### Environment Variables (Vercel)
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@attest.97115104.com
EMAIL_NAME=attest

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
REDIS_URL=redis://...
```

### Deployment Settings
- **Framework Preset**: Other
- **Build Command**: (none - static site)
- **Output Directory**: `.`
- **Install Command**: `npm install`

## Support

- **Documentation**: https://attest.97115104.com/docs
- **GitHub Issues**: https://github.com/97115104/attest/issues
- **Email**: support@attest.97115104.com
- **API Status**: https://status.attest.97115104.com

---

Last updated: August 2025