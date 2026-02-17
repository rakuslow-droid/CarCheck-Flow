# CarCheck Flow 🚗💨

Automated vehicle inspection management and reminders via LINE Messaging API and Google Gemini AI.

## Overview

CarCheck Flow is a modern SaaS prototype designed for Japanese car shops (Merchants). It automates the tedious process of tracking vehicle inspection (車検 - Shaken) dates by allowing customers to simply send a photo of their inspection document via LINE.

### Key Features

- **LINE Webhook Integration**: Receives and processes images directly from customers.
- **AI-Powered Data Extraction**: Uses Google Gemini 1.5 Flash to accurately read Japanese "車検証" (Certificates) and "車検ステッカー" (Stickers).
- **Automated Scheduling**: Automatically extracts expiration dates and logs them to Firestore.
- **Merchant Dashboard**: A professional portal for shop owners to manage their fleet, track upcoming inspections, and monitor LINE engagement.
- **QR Code Onboarding**: Simple "Scan to Register" flow for customers.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **AI Engine**: Google Genkit + Gemini 1.5 Flash
- **Backend**: Firebase (Firestore, Authentication, App Hosting)
- **UI Components**: ShadCN UI + Tailwind CSS
- **Icons**: Lucide React
- **Integration**: LINE Messaging API

## Getting Started

1. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `GEMINI_API_KEY` (if running locally via Genkit)

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Genkit Developer UI**:
   ```bash
   npm run genkit:dev
   ```

## Deployment

This project is optimized for **Firebase App Hosting**. 
- Region: `asia-northeast1` (Tokyo)
- Environment variables should be configured in the Firebase Console under App Hosting settings.

## License

MIT
