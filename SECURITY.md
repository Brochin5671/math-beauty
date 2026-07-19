# Security policy

## Reporting a vulnerability

Email maximbrochin@gmail.com with the details, or open a private
[GitHub Security Advisory](https://github.com/Brochin5671/math-beauty/security/advisories/new).
Please do not open a public issue for security reports. We aim to acknowledge
reports within a few business days.

## Hardening

Response security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, Permissions-Policy) are set at the edge in `public/_headers`.
Code and dependencies are scanned in CI with gitleaks (secrets), Semgrep (SAST)
and Trivy (CVEs), and Dependabot opens weekly dependency-update PRs.
