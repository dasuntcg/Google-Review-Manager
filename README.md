# Google Review Manager

A web-based application to fetch, manage, and distribute Google Reviews to multiple websites via API.

## Features

- **Automated Review Fetching**: Schedule automatic sync with Google Places API
- **Review Management Dashboard**: View, filter, and manage all your Google reviews
- **Selective Distribution**: Choose which reviews to send to each endpoint
- **Multiple Endpoints**: Configure various distribution targets for your reviews
- **Customizable Settings**: Control sync frequency and auto-distribution rules

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), Chakra UI, TypeScript
- **API**: Next.js API Routes with TypeScript
- **Storage**: File-based storage (JSON) for development, compatible with databases in production
- **Deployment**: Optimized for Vercel deployment

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Google Places API Key
- Google Place ID for your business

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/google-review-manager.git
   cd google-review-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   GOOGLE_PLACE_ID=your_google_place_id_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure

```
google-review-manager/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── reviews/          # Reviews-related endpoints
│   │   ├── endpoints/        # Endpoint management
│   │   └── tasks/            # Scheduled tasks
│   ├── reviews/              # Reviews page
│   ├── endpoints/            # Endpoints page
│   ├── settings/             # Settings page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home/Dashboard page
├── components/               # React components
│   ├── dashboard/            # Dashboard components
│   ├── layout/               # Layout components
│   ├── reviews/              # Review-related components
│   ├── endpoints/            # Endpoint-related components
│   └── settings/             # Settings components
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions and types
├── public/                   # Static assets
└── data/                     # Data storage (created at runtime)
```

## API Endpoints

### Reviews

- `GET /api/reviews/fetch` - Fetch new reviews from Google Places API
- `GET /api/reviews/manage` - Get all stored reviews
- `POST /api/reviews/manage` - Save new reviews
- `PUT /api/reviews/manage` - Update review status
- `POST /api/reviews/distribute` - Distribute reviews to endpoints

### Endpoints

- `GET /api/endpoints` - Get all endpoints
- `POST /api/endpoints` - Create a new endpoint
- `PUT /api/endpoints` - Update an endpoint
- `DELETE /api/endpoints` - Delete an endpoint

### Tasks

- `GET /api/tasks/sync-reviews` - Run scheduled sync task

## Development

### Adding a Database

The application currently uses file-based JSON storage for simplicity, but you can easily swap this for a database:

1. Install your database driver (e.g., `npm install pg` for PostgreSQL)
2. Create database connection in `lib/db.ts`
3. Update the API routes to use your database instead of file-based storage
4. Update schema to reflect the types defined in `lib/types.ts`

Example for a PostgreSQL implementation:

```typescript
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
});

export default pool;
```

### Setting Up Google Places API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to "APIs & Services" > "Library"
4. Search for and enable "Places API"
5. Go to "APIs & Services" > "Credentials"
6. Create an API key
7. Restrict the API key to only the Places API
8. Apply IP restrictions if needed for security

### Finding Your Google Place ID

1. Go to the [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Search for your business name and location
3. Copy the Place ID that appears in the results

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Import your repository in Vercel:
   - Sign in to [Vercel](https://vercel.com)
   - Click "Add New" > "Project"
   - Select your repository
   - Configure environment variables:
     ```
     GOOGLE_PLACES_API_KEY=your_api_key_here
     GOOGLE_PLACE_ID=your_google_place_id_here
     ```
   - Click "Deploy"

### Setting Up Scheduled Tasks on Vercel

For automatic review synchronization, use Vercel Cron Jobs:

1. Create a `vercel.json` file in your project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/tasks/sync-reviews",
         "schedule": "0 0 * * *"
       }
     ]
   }
   ```
   This will run the sync task every day at midnight.

2. Deploy to Vercel - the cron job will be automatically configured.

## Configuring for Different Websites

### Setting Up Review Distribution

After deployment, follow these steps to configure review distribution:

1. Open the application and go to the Settings page
2. Enter your Google Place ID
3. Configure sync frequency and auto-distribution rules
4. Go to the Endpoints page and add your distribution targets:
   - Name: A friendly name for the website
   - URL: The API endpoint that will receive the reviews
   - Active: Toggle to enable/disable the endpoint

### Receiving Reviews on Your Websites

For each website that will receive reviews, you need to create an endpoint that accepts POST requests with review data. The endpoint will receive data in this format:

```json
{
  "reviews": [
    {
      "id": "123456789",
      "author_name": "John Doe",
      "rating": 5,
      "text": "Great service!",
      "time": 1626782400,
      "profile_photo_url": "https://example.com/photo.jpg",
      "status": "published",
      "dateAdded": "2023-08-15T12:00:00.000Z"
    }
  ]
}
```

## Customization

### Changing the Theme

The app uses Chakra UI. You can customize the theme in `lib/theme.ts`:

```typescript
// lib/theme.ts
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      // Your custom colors
    },
  },
  // Other theme customizations
});

export default theme;
```

### Adding New Features

Some potential enhancements you might consider:

- User authentication and multi-user support
- Email notifications for new reviews
- Review analytics and reporting
- AI-powered review sentiment analysis
- Multi-language support
- Custom review filtering rules

## Troubleshooting

### Common Issues

- **API Key Not Working**: Ensure your Google API key has the Places API enabled and check for any usage restrictions
- **Reviews Not Syncing**: Verify your Place ID is correct and that you have reviews visible on Google
- **Distribution Failing**: Check that your endpoint URLs are correct and accessible from the application server

### Getting Help

If you encounter any issues or need assistance:

1. Check the console for error messages
2. Verify your environment variables are correctly set
3. Ensure your Google API key has sufficient permissions
4. For API testing, use tools like Postman to make direct requests to your endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Chakra UI](https://chakra-ui.com/)
- Uses the [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)