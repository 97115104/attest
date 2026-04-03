# Contributing to attest

Thank you for your interest in contributing to attest! We welcome contributions from the community and are excited to work with you.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Focus on constructive criticism and positive feedback
- Respect differing viewpoints and experiences
- Accept responsibility and apologize when mistakes are made

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment details (browser, OS, etc.)
- Any relevant error messages or console output

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- A clear and descriptive title
- Detailed explanation of the proposed feature
- Use cases and benefits
- Possible implementation approach
- Mockups or examples if applicable

### Contributing Code

1. **Find an Issue**: Look for issues labeled `good first issue` or `help wanted`
2. **Comment**: Let us know you're working on it
3. **Fork**: Create your own fork of the repository
4. **Branch**: Create a feature branch (`git checkout -b feature/amazing-feature`)
5. **Code**: Make your changes
6. **Test**: Ensure everything works
7. **Commit**: Use clear commit messages
8. **Push**: Push to your fork
9. **PR**: Open a Pull Request

## Development Setup

### Prerequisites

- Git
- A modern web browser
- A text editor (VS Code recommended)
- Python 3.x or Node.js (for local server)
- Optional: Vercel CLI for deployment testing

### Local Development

```bash
# Clone the repository
git clone https://github.com/97115104/attest.git
cd attest

# Start a local server
python -m http.server 8000
# or
npx serve
# or
vercel dev

# Open in browser
open http://localhost:8000
```

### Environment Variables (Optional)

For full functionality, create a `.env.local` file:

```env
# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@attest.97115104.com
EMAIL_NAME=attest

# Payment Processing (optional)
STRIPE_SECRET_KEY=sk_test_...

# Database (optional)
REDIS_URL=redis://...
```

## Pull Request Process

1. **Update Documentation**: Ensure README.md and other docs reflect your changes
2. **Test Thoroughly**: Test across different browsers and devices
3. **Follow Style Guide**: Maintain consistent code style
4. **Write Clear Commits**: Use descriptive commit messages
5. **Update CHANGELOG**: Add your changes to the changelog if significant
6. **Request Review**: Tag maintainers for review

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers
- [ ] All tests pass
- [ ] PR title is clear and descriptive

## Coding Standards

### JavaScript

- Use ES6+ features
- Prefer `const` and `let` over `var`
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Handle errors gracefully
- Avoid global variables

```javascript
// Good
const createAttestation = async (contentName, model = 'gpt-4') => {
  try {
    const response = await fetch('/api/create', { /* ... */ });
    return response.json();
  } catch (error) {
    console.error('Failed to create attestation:', error);
    throw error;
  }
};

// Bad
function makeAttest(n) {
  r = fetch('/api/create');
  return r;
}
```

### HTML/CSS

- Use semantic HTML5 elements
- Follow BEM naming convention for CSS classes
- Ensure accessibility (ARIA labels, alt texts)
- Mobile-first responsive design
- Use CSS variables for theming

```css
/* Good */
.attestation-card {
  --card-padding: 1rem;
  padding: var(--card-padding);
}

.attestation-card__title {
  font-size: 1.5rem;
}

/* Bad */
.card1 {
  padding: 16px;
}
```

### File Organization

```
attest/
├── index.html          # Homepage
├── create/            # Feature directories
├── verify/
├── api/               # API endpoints
├── static/            # JavaScript files
│   ├── *.js          # Feature-specific JS
│   └── libs/         # External libraries
├── assets/           # Images, badges, etc.
│   ├── badges/
│   └── logo/
├── docs/             # Documentation
└── styles/           # CSS files
```

## Testing Guidelines

### Manual Testing

Before submitting a PR, test:

1. **Core Functionality**
   - Create attestation
   - Verify attestation
   - Badge rendering
   - Copy functions

2. **Cross-Browser**
   - Chrome/Edge
   - Firefox
   - Safari
   - Mobile browsers

3. **Responsive Design**
   - Desktop (1920px, 1366px)
   - Tablet (768px)
   - Mobile (375px, 414px)

4. **Edge Cases**
   - No JavaScript
   - Slow connections
   - Large content
   - Special characters

### Automated Testing (Future)

We plan to add automated testing. Contributions welcome!

## Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Include parameter types and descriptions
- Document return values
- Add usage examples

```javascript
/**
 * Creates an attestation for AI-generated content
 * @param {string} contentName - Human-readable name of the content
 * @param {Object} options - Configuration options
 * @param {string} options.model - AI model used (default: 'gpt-4')
 * @param {string} options.role - AI role: 'generated', 'assisted', 'edited'
 * @returns {Promise<Object>} The attestation object
 * @example
 * const attestation = await createAttestation('My Article', {
 *   model: 'claude-3-opus',
 *   role: 'assisted'
 * });
 */
```

### User Documentation

- Update README.md for new features
- Add examples to the examples directory
- Create guides for complex features
- Keep documentation concise and clear

## Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Email**: info@attest.97115104.com for general inquiries

### Ways to Contribute

- **Code**: Fix bugs, add features
- **Documentation**: Improve guides, fix typos
- **Design**: Create badges, improve UI
- **Testing**: Report bugs, test PRs
- **Ideas**: Suggest features, use cases
- **Spread the Word**: Share the project

### Recognition

Contributors are recognized in:
- GitHub contributors page
- README.md acknowledgments
- Release notes

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or reach out to the maintainers. We're here to help!

---

Thank you for contributing to attest! 🎉