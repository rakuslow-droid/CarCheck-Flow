# **App Name**: CarCheck Flow

## Core Features:

- Merchant Registration: Allows car shops to register via LINE, storing merchant data (merchantId, displayName, lineAccessToken, createdAt) in Firestore.
- LINE Message Handling: Receives messages (images/text) from LINE via webhook and triggers appropriate actions.
- Vehicle Data Processing: Uses Gemini API to extract date information from vehicle inspection certificate images uploaded via LINE and updates the 'vehicles' collection in Firestore.  The Gemini tool will automatically interpret the inspection stickers.
- Firestore Integration: Utilizes Firestore to store merchant and vehicle/inspection data.
- Firebase Authentication: Enables Firebase Authentication for car shop web management login.
- Vehicle Image Storage: Stores uploaded vehicle inspection certificate images in a dedicated Firebase Storage bucket (vehicle-docs).
- Web Management Interface: Allows car shops to log in, view, and manage merchant and vehicle data through a web interface.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) to convey trust and professionalism, reminiscent of automotive engineering.
- Background color: Very light blue-gray (#F0F4F9), near white, for a clean and modern look.
- Accent color: Electric blue (#748ffc) for interactive elements and important calls to action.
- Body font: 'PT Sans', a humanist sans-serif for readability and a touch of warmth.
- Headline font: 'Space Grotesk', a proportional sans-serif, adding a modern and technical feel that aligns with automotive technology.
- Use clean, simple icons representing vehicles, documents, dates, and communication.
- Maintain a clean, intuitive layout with clear information hierarchy.
- Subtle animations to guide the user through key workflows such as data loading, form submission, and LINE interactions.