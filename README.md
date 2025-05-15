# Guillaume Deleeuw Portfolio Website

This repository contains both the static frontend and Node.js backend for visitor logging.

## Structure

- `public/`
  - `index.html`
  - `visitors.html`
  - `styles.css`
  - `assets/guillaume-deleeuw-cv.pdf`
  - `favicon.ico`
- `server.js` — Express server logging visits to `visitors.json`.
- `visitors.json` — Auto-generated JSON log.
- `package.json` — Node.js dependencies.

## Setup on Raspberry Pi

1. Install Node.js (v14+):
   ```
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. Clone repo and install:
   ```
   git clone <repo-url>
   cd <repo-folder>
   npm install
   ```
3. Ensure `public/` contains all static files.
4. Start the server:
   ```
   npm start
   ```
5. Configure NGINX to proxy port 3000 → 80.

Your site will be available at `http://<pi-ip>/`, visitor logs at `/visitors.html`.  
