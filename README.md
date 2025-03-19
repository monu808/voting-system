# Secure Voter Verification System

A modern web application for secure voter verification using Google technologies. This system helps streamline the voting verification process by automating document verification and voter authentication.

## Features

- Secure user authentication with Firebase
- Google Cloud Vision API integration for document verification
- Google Maps API integration for polling station management
- Real-time voter verification status updates
- Admin dashboard for managing polling stations and verifications
- Responsive Material-UI based interface

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase account and project
- Google Cloud Platform account with enabled APIs:
  - Cloud Vision API
  - Maps JavaScript API
  - Places API

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/voting-system.git
cd voting-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/      # React contexts (Auth, etc.)
├── pages/         # Page components
├── services/      # API and service integrations
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Firebase for authentication and database services
- Google Cloud Platform for Vision and Maps APIs
- Material-UI for the component library 