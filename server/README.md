# Six Social App Backend

Backend service for Six - a social revolution in how we connect. This service provides APIs for anonymous posting, chat functionality, user management, and AI-assisted features.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

#### Register
- **POST** `/api/auth/register`
- Body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

#### Login
- **POST** `/api/auth/login`
- Body:
```json
{
  "email": "string",
  "password": "string"
}
```

### Posts

#### Create Post
- **POST** `/api/posts`
- Auth: Required
- Body:
```json
{
  "content": "string",
  "type": "hangout|urgent|help",
  "connectionScope": "first|second|third",
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude],
    "description": "string"
  },
  "expiresIn": "number (hours)",
  "maxReplies": "number (default: 3, max: 6)",
  "maxAccepts": "number (default: 1, max: 6)"
}
```

#### Get Posts Feed
- **GET** `/api/posts`
- Auth: Required
- Query Parameters:
  - `type`: "hangout|urgent|help"
  - `connectionScope`: "first|second|third"
  - `latitude`: number
  - `longitude`: number
  - `radius`: number (meters, default: 10000)

#### React to Post
- **POST** `/api/posts/:id/react`
- Auth: Required

#### Update Reply Status
- **PUT** `/api/posts/:postId/reply/:userId`
- Auth: Required
- Body:
```json
{
  "status": "accepted|rejected"
}
```

### Chats

#### Create Chat
- **POST** `/api/chats`
- Auth: Required
- Body:
```json
{
  "participants": ["userId1", "userId2"],
  "conversationType": "direct|group",
  "conversationName": "string (required for group)"
}
```

#### Get User's Chats
- **GET** `/api/chats`
- Auth: Required

#### Get Chat Messages
- **GET** `/api/chats/:chatId/messages`
- Auth: Required

#### Send Message
- **POST** `/api/chats/:chatId/messages`
- Auth: Required
- Body:
```json
{
  "content": "string"
}
```

#### Mark Messages as Read
- **POST** `/api/chats/:chatId/read`
- Auth: Required

### Users

#### Get Profile
- **GET** `/api/users/profile`
- **GET** `/api/users/profile/:userId`
- Auth: Required

#### Update Profile
- **PUT** `/api/users/profile`
- Auth: Required
- Body:
```json
{
  "bio": "string",
  "photos": ["string"],
  "interests": ["string"],
  "location": {
    "type": "Point",
    "coordinates": [longitude, latitude],
    "description": "string"
  }
}
```

#### Get Network
- **GET** `/api/users/network`
- Auth: Required
- Query Parameters:
  - `degree`: "first|second|third" (default: "first")

### AI Features

#### Generate Post Prompt
- **GET** `/api/ai/prompts`
- Auth: Required
- Query Parameters:
  - `location`: string (required)
  - `interests`: string[] (optional)

#### Generate Bio
- **POST** `/api/ai/bio`
- Auth: Required
- Body:
```json
{
  "keywords": ["string"]
}
```

## Error Handling

All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [] // Validation errors if applicable
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Development

### Project Structure
```
server/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── types/         # TypeScript type definitions
│   ├── app.ts         # Express app setup
│   └── index.ts       # Server entry point
├── package.json
└── tsconfig.json
```

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm test`: Run tests
