# Postman CSE Demo – Reusable API Testing + Automation

## What this is
A small “Customer Success Engineering” style demo:
- A Postman Collection with repeatable tests and structure
- A Node.js automation script that calls the same API and writes output
- A CI workflow that runs Newman + the Node script on every push

## Why it matters
This mirrors how a CSE scales solutions:
solve once → templatize → automate → reuse across customers.

## How to run locally

### 1) Install
```bash
npm install
