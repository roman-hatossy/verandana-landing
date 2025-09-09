#!/bin/bash
set -e

echo "Installing GAMMA version..."

# 1. Create package.json
cat > package.json << 'PKG'
{
  "name": "verandana-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "zod": "^3.22.4",
    "@vercel/blob": "^0.23.4",
    "resend": "^3.2.0",
    "@upstash/redis": "^1.28.2"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "15.1.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
PKG

# 2. Install dependencies
npm install

# 3. Create directories
mkdir -p app components lib hooks app/api/contact

# 4. Copy all necessary files from gamma version
# (Files content would be too long to include here)
echo "Gamma structure created"

# 5. Start dev server
npm run dev
