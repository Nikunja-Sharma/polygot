# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Do NOT

- Open a public GitHub issue
- Disclose the vulnerability publicly before it's fixed

### Do

1. **Email**: Send details to the maintainers privately
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Resolution Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2 weeks
  - Low: Next release

### After Resolution

- We will credit you in the release notes (unless you prefer anonymity)
- We may ask you to verify the fix

## Security Best Practices

When running AliveStack:

1. **Don't expose ports publicly** without proper authentication
2. **Use resource limits** (already configured in docker-compose.yml)
3. **Keep Docker updated** to the latest stable version
4. **Review chaos operations** before running in production-like environments

## Scope

This security policy applies to:
- All services in the AliveStack repository
- Docker configurations
- Build scripts and CI/CD pipelines

Thank you for helping keep AliveStack secure!
