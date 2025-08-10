# Insta Reel Testing

A React application with authentication system for testing Instagram reels.

## Features

- **Authentication System**: Login/logout functionality with token-based authentication
- **Protected Routes**: Dashboard is only accessible to authenticated users
- **Automatic Redirects**: Users are redirected to appropriate pages based on authentication status
- **Token Management**: Automatic token verification and storage

## Authentication Flow

1. **Initial Load**: The app checks if a valid token exists in localStorage
2. **Not Authenticated**: User is redirected to `/login` page
3. **Login Success**: User is redirected to `/dashboard` page
4. **Dashboard Access**: Only authenticated users can access the dashboard
5. **Logout**: User is logged out and redirected to `/login`

## API Endpoints

The application uses the following API endpoints (configured in `src/utils.ts`):

- `POST /api/auth/login` - User login
- `GET /api/auth/check-login` - Verify authentication status

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── App.tsx              # Main app component with routing
├── pages/
│   ├── login.tsx        # Login page component
│   └── dashboard.tsx    # Dashboard page component
├── utils.ts             # API utility functions
└── types.ts             # TypeScript type definitions
```

## Technologies Used

- React 19
- TypeScript
- React Router DOM
- Axios for API calls
- Tailwind CSS for styling
