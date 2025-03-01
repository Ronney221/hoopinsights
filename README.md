This project is licensed under the MIT License.
LIVE ON : [https://hoopinsights.vercel.app/](https://hoopinsights.vercel.app/) 

# HoopInsights - Basketball Stats Tracker

HoopInsights is a web application for tracking basketball statistics while watching YouTube videos. It allows users to record player statistics in real-time, save games for later analysis, and review detailed performance metrics.

## Features

- Record basketball stats in real-time while watching YouTube videos
- Save games to MongoDB for future reference
- View comprehensive player statistics and analytics
- Interactive timestamps to jump to specific moments in the game
- User authentication with Firebase Auth

## Deployment

The application is deployed on Vercel at [https://hoopinsights.vercel.app/](https://hoopinsights.vercel.app/).

### Environment Variables

The following environment variables are required for deployment:

#### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

#### Deployment Configuration
```
NODE_ENV=production
```

### API Configuration

The API endpoints automatically adapt based on the environment:
- In development, they point to `http://localhost:5000/api`
- In production, they point to `https://hoopinsights.vercel.app/api`

This is configured in `src/config/apiConfig.js`.

### Backend Setup

The backend is connected to a MongoDB database and runs on the same Vercel deployment. The server code is in the `server` directory.

## Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with the required environment variables
4. Start the development server with `npm run dev`

## Tech Stack

- Frontend:
  - React
  - Tailwind CSS
  - DaisyUI
  - Firebase Authentication
  
- Backend:
  - Node.js
  - Express
  - MongoDB
  - Vercel Serverless Functions

## License

