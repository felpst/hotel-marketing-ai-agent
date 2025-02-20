# Hotel Marketing Campaign Generator Backend

This is the backend service for the Hotel Marketing Campaign Generator, built with Node.js, Express, and LangGraph.js.

## Features

- Multi-step campaign generation workflow using LangGraph.js
- RESTful API endpoints for campaign generation
- Real-time campaign status updates via Server-Sent Events (SSE)
- Structured output validation using Zod schemas
- Environment-based configuration
- Error handling and logging middleware

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- OpenAI API key
- Tavily API key
- LangSmith API key (optional, for observability)

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   TAVILY_API_KEY=your_tavily_api_key
   LANGSMITH_API_KEY=your_langsmith_api_key
   PORT=3001
   NODE_ENV=development
   ```

## Project Structure

```
backend/
├── src/
│   ├── api/          # API route handlers
│   ├── config/       # Configuration files
│   ├── controllers/  # Business logic
│   ├── graph/        # LangGraph workflow definitions
│   ├── middleware/   # Express middleware
│   ├── routes/       # Route definitions
│   ├── app.ts        # Express app setup
│   ├── index.ts      # Entry point
│   └── server.ts     # Server configuration
├── logs/            # Application logs
└── package.json
```

## Available Scripts

- `npm run dev`: Start the development server with hot-reload
- `npm run build`: Build the TypeScript project
- `npm start`: Start the production server
- `npm run lint`: Run ESLint
- `npm test`: Run tests

## API Endpoints

### POST /api/generate-campaign
Generate a new marketing campaign for a hotel.

**Request Body:**
```json
{
  "hotelName": "string",
  "hotelUrl": "string"
}
```

**Response:**
```json
{
  "campaign": {
    "keywords": ["string"],
    "audiences": ["string"],
    "adCopies": [{
      "headline": "string",
      "description": "string"
    }],
    "metrics": {
      "recommendedBudget": "number"
    }
  }
}
```

### GET /api/campaign-status/:id
Get real-time updates about campaign generation progress (SSE endpoint).

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set up environment variables in your deployment platform

3. Start the server:
   ```bash
   npm start
   ```

## Monitoring

- Application logs are stored in the `logs/` directory
- Use LangSmith dashboard for workflow monitoring (if configured)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT 