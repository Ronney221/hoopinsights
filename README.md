# Shotify - Basketball Stats Tracker

LIVE ON: [https://shotify.org](https://shotify.org)

Shotify is a web application for tracking basketball statistics while watching YouTube videos. It allows users to record player statistics in real-time, save games for later analysis, and review detailed performance metrics. Built with React, FastAPI, and modern web technologies.

## Features

- Real-time stats tracking while watching basketball videos
- Advanced analytics and performance metrics
- Season tracking and progress monitoring
- Export stats in multiple formats
- Beautiful, responsive UI with dark mode support

## Deployment

The application is deployed at [https://shotify.org](https://shotify.org).

## Development

### Frontend
- React with Vite
- TailwindCSS for styling
- DaisyUI components
- Firebase Authentication

### Backend
- FastAPI
- MongoDB for data storage
- Firebase Admin SDK

### Environment Variables

The application uses environment variables for configuration:

Frontend (`.env`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Backend (`.env`):
```env
MONGODB_URI=your_mongodb_uri
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

### API Endpoints

The application uses two sets of API endpoints:
- In development, they point to `http://localhost:3001/api`
- In production, they point to `https://shotify.org/api`

## License

MIT License

