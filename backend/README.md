# Tree Plantation Backend

Backend server for the Tree Plantation application built with Node.js and Express.

## Project Structure

```
backend/
├── controllers/       # Business logic for each feature
├── routes/           # API endpoint definitions
├── models/           # Data schemas (User, Plant, Schedule, Settings)
├── middleware/       # Express middleware (auth, validation, errors)
├── config/           # Configuration files (database, JWT, server)
├── utils/            # Helper functions, logger, constants
├── server.js         # Main server file
├── package.json      # Dependencies
└── .env              # Environment variables
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `POST /logout` - User logout
- `GET /me` - Get current user

### Plants (`/api/plants`)
- `GET /` - Get all plants
- `GET /:id` - Get plant by ID
- `POST /` - Create new plant
- `PUT /:id` - Update plant
- `DELETE /:id` - Delete plant
- `POST /:id/water` - Mark plant as watered
- `GET /search?q=query` - Search plants

### Schedule (`/api/schedules`)
- `GET /` - Get all schedules
- `GET /:id` - Get schedule by ID
- `POST /` - Create new schedule
- `PUT /:id` - Update schedule
- `DELETE /:id` - Delete schedule
- `POST /:id/complete` - Mark task as complete
- `GET /upcoming?days=7` - Get upcoming schedules

### Settings (`/api/settings`)
- `GET /` - Get user settings
- `PUT /` - Update settings
- `GET /notifications` - Get notification preferences
- `PUT /notifications` - Update notification preferences
- `POST /change-password` - Change password
- `GET /user-info` - Get user profile
- `PUT /user-info` - Update user profile

## Environment Variables

See `.env` file for all required environment variables:
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `JWT_SECRET` - JWT secret key
- `CORS_ORIGIN` - CORS origin URL
- `WEATHER_API_KEY` - Weather API key

## Technologies

- **Express.js** - Web framework
- **MongoDB/Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## Notes

**Weather Data:** Weather information is fetched real-time from an external API (OpenWeather) directly in the frontend and is not stored in the backend. The frontend handles all weather-related operations including suggestions and caching.

## Health Check

Server health can be checked at:
```
GET http://localhost:5000/health
```

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Development

- Use `npm run dev` for development with auto-reload
- Check logs in console for debugging
- All environment variables must be set in `.env` before running
