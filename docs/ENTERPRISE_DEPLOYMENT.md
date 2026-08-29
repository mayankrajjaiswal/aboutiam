# AboutIAM Enterprise Air-Gapped Deployment Guide

AboutIAM is engineered as a **100% Client-Side, Zero-Backend application**. For high-compliance enterprise environments (such as banking, healthcare, government, and defense), you can run AboutIAM fully air-gapped behind private internal firewalls with absolute security.

## Advantages of Self-Hosting AboutIAM
- **Complete Air-Gap Compatibility:** 0 outbound web requests are initiated by default.
- **Absolute Privacy:** No telemetry, tracking, or logs ever escape the browser context.
- **Enterprise-Wide Distribution:** Distribute identity-security training modules and compliance tools across your entire engineering staff.

## Running with Docker (Recommended)

To build and run AboutIAM locally on port `8080`:

```bash
# Build the Docker image
docker build -t aboutiam:latest .

# Run the container
docker run -d -p 8080:80 --name aboutiam_workspace aboutiam:latest
```

## Running with Docker Compose

Alternatively, spin up the container using Docker Compose:

```bash
docker-compose up -d
```

Access the workspace at: `http://localhost:8080/`
