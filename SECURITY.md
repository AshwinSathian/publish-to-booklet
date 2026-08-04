# Security Policy

This action reads a Booklet API key from a workflow secret and sends it to the Booklet API over HTTPS — it never logs or persists it beyond the run (the key is registered with `core.setSecret` so Actions redacts it from logs).

If you find a vulnerability, please report it privately rather than opening a public issue.

**Report to:** ashwinsathyan19@gmail.com

Include what you found, steps to reproduce, and impact if known. This is a solo-maintained project, so there's no bug bounty and no guaranteed SLA, but reports are read and acted on.
