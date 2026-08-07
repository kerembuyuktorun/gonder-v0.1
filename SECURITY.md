# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| 0.x     | :x:                |

## Known Security Issues

### xlsx Dependency (DataTable-Kit)

**Status:** Known  
**Severity:** High  
**Advisory:** [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6)

The `xlsx` library used for Excel import/export in DataTable-Kit has known security vulnerabilities:
- Prototype Pollution
- Regular Expression Denial of Service (ReDoS)

**Impact:** This affects the Excel import/export functionality in DataTable-Kit. The vulnerabilities are only exploitable when processing untrusted Excel files.

**Mitigation:**
1. **Server-side validation**: Always validate and sanitize Excel files on the server before processing
2. **Size limits**: Implement file size limits (recommended: < 10MB)
3. **Trusted sources only**: Only accept Excel files from trusted sources
4. **Optional feature**: Excel import/export is an optional feature - disable if not needed

**Alternative Solutions:**
- We are monitoring for alternative Excel libraries without these vulnerabilities
- Consider using CSV format for data import/export as a safer alternative
- For production use with untrusted files, implement strict server-side validation

**Timeline:**
- Issue identified: March 10, 2026
- No fix available from upstream (`xlsx` library)
- We are evaluating alternatives and will update in future releases

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Open a Public Issue

Security vulnerabilities should not be disclosed publicly until a fix is available.

### 2. Email Us Directly

Send details to: **security@arftech.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Varies by severity (critical issues prioritized)

### 4. Disclosure Policy

We follow coordinated disclosure:
1. We acknowledge receipt within 48 hours
2. We investigate and develop a fix
3. We release a patch
4. We publicly disclose the vulnerability after the fix is deployed
5. We credit the reporter (unless they prefer to remain anonymous)

## Security Best Practices

When using ARF UI Kit:

### Auth-Kit
- ✅ Always use HTTPS in production
- ✅ Store tokens securely (HttpOnly cookies recommended over localStorage)
- ✅ Implement CSRF protection
- ✅ Validate all user inputs
- ✅ Use environment variables for sensitive data
- ❌ Never expose API keys in client code
- ❌ Never trust user input without validation

### DataTable-Kit
- ✅ Sanitize data before rendering
- ✅ Implement server-side pagination for large datasets
- ✅ Validate Excel files before import
- ✅ Limit file upload sizes
- ❌ Never execute code from Excel file macros
- ❌ Never trust user-uploaded files without validation

### Form-Kit
- ✅ Always use Zod validation
- ✅ Sanitize user inputs
- ✅ Implement rate limiting on submit endpoints
- ✅ Use CSRF tokens
- ❌ Never trust client-side validation alone
- ❌ Never store sensitive data in form state

### Errors-Kit
- ❌ Never expose sensitive error details to users
- ❌ Never log sensitive data (passwords, tokens, etc.)
- ✅ Log errors server-side for debugging
- ✅ Show generic error messages to users

### Layout-Kit
- ✅ Sanitize user-generated content in navigation
- ✅ Implement proper access control
- ❌ Never expose admin routes without authentication

## Security Updates

Subscribe to security updates:
- GitHub Security Advisories: [Watch Repository](https://github.com/hascanb/arf-superapp-frontend/security/advisories)
- npm Security Advisories: Automated with `npm audit`
- Email Notifications: security@arftech.com

## Dependency Updates

We regularly update dependencies to patch security vulnerabilities:
- **Critical:** Within 24 hours
- **High:** Within 7 days
- **Medium:** Within 30 days
- **Low:** Next minor release

Run `npm audit` to check for known vulnerabilities in your installation.

## Security Contacts

- **Security Team:** security@arftech.com
- **General Support:** support@arftech.com
- **GitHub Issues:** https://github.com/hascanb/arf-superapp-frontend/issues (non-security issues only)

---

**Last Updated:** March 11, 2026
