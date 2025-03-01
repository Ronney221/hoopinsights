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

## Database Maintenance

### Data Isolation

The application uses compound indexes in MongoDB to ensure proper data isolation between users:

- Each user can have their own copy of a YouTube video with unique stats
- Videos are uniquely identified by both `youtubeId` AND `createdBy` (Firebase user ID)
- Each video entry also has an `internalId` that is globally unique across all users
- Stats are associated with the internal video ID AND the user who created them

This ensures that when multiple users track stats for the same YouTube video, their data remains completely separate.

### Alternative V2 API (New Collections)

If you encounter persistent MongoDB index constraint issues with the default collections, the application provides alternative V2 API endpoints that use completely new collections:

1. The V2 API endpoints (`/api/statsv2/...`) use new database collections (`videos_new` and `stats_new`) that have the correct index structure from the start.
2. These collections use a user-specific ID format that maintains the connection to the original YouTube videos:
   - The `originalYoutubeId` field stores the actual YouTube video ID for direct reference
   - The `youtubeId` field uses a consistent format: `originalYoutubeId__userId` (using double underscore as separator)
   - The `internalId` field is used for stats references and follows the format: `vid_userId_originalYoutubeId_shortRandom`
3. This approach provides several benefits:
   - Avoids the MongoDB unique index constraint issue
   - Creates predictable IDs that maintain the link to the original videos
   - Ensures each user's videos remain properly isolated
   - Makes debugging and data management much easier

To use the V2 API in your client code, update your imports to use `STATS_V2_ENDPOINTS` instead of `STATS_ENDPOINTS`:

```javascript
// Instead of:
import { STATS_ENDPOINTS } from '../config/apiConfig';

// Use:
import { STATS_V2_ENDPOINTS } from '../config/apiConfig';

// Then use it like:
const response = await fetch(STATS_V2_ENDPOINTS.SAVE_GAME, {
  method: 'POST',
  headers: await createApiHeaders(user),
  body: JSON.stringify(gameData)
});
```

The V2 API is fully compatible with the original API but uses separate collections with an improved ID structure to ensure proper data isolation and video identification.

#### Migrating to the V2 Collections

To migrate existing data from the original collections to the new V2 collections, run:

```bash
# From the project root
node server/scripts/migrateToNewCollections.js
```

This script will:
1. Copy all videos from the original collection to the `videos_new` collection
2. Generate the new user-specific ID format for each video
3. Copy all associated stats to the `stats_new` collection and link them to the new video IDs
4. Verify the migration was successful

The script is non-destructive and will not delete any data from the original collections.

### Fixing Database Index Issues

If you encounter errors with duplicate `youtubeId` constraints when different users try to save the same YouTube video, run the database schema fix script:

```bash
# From the project root
node server/scripts/fixDatabaseSchema.js
```

This script:
1. Drops all non-essential indexes from the Video collection
2. Recreates the correct indexes with proper user isolation
3. Ensures there is no unique constraint on youtubeId alone
4. Verifies the database now has the correct index structure

#### Last Resort: Reset Video Collection

In rare cases where index issues persist, you can completely reset the Video collection (**WARNING: this will delete all video data**):

```bash
# From the project root
node server/scripts/resetVideoCollection.js
```

This script will prompt for confirmation before deleting all videos. It will then recreate the collection with the proper index structure.

### Database Health Checks

To monitor the health of your database and identify potential issues, run the database maintenance script:

```bash
# From the project root
node server/scripts/maintainDatabase.js
```

This script performs read-only operations to generate a comprehensive report including:

1. Database statistics (total videos, stats, users, etc.)
2. Index verification to ensure proper data isolation
3. Detection of potential duplicate videos or stats
4. Identification of orphaned stats (stats without corresponding videos)

The script is non-destructive and doesn't modify any data, making it safe to run at any time.

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

