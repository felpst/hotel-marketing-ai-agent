# Hotel Marketing Campaign Generator UI

A modern Next.js application for generating and managing hotel marketing campaigns, built with Next.js 14, React, and Tailwind CSS.

## Features

- Modern, responsive UI built with Next.js and Tailwind CSS
- Real-time campaign generation progress updates
- Interactive dashboard for campaign management
- Form validation and error handling
- Server-side rendering for optimal performance
- Mobile-first design approach

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Backend service running (see backend README)

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd hotel-marketing-ui
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

## Project Structure

```
hotel-marketing-ui/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # Reusable React components
│   └── services/      # API service functions
├── public/           # Static assets
└── package.json
```

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the production application
- `npm start`: Start the production server
- `npm run lint`: Run ESLint
- `npm run test`: Run tests

## Key Components

### Campaign Form
- Input validation for hotel details
- Real-time feedback
- Progress indicators

### Campaign Dashboard
- Display generated keywords
- Show ad copy variations
- Audience segment visualization
- Budget recommendations

### Real-time Updates
- WebSocket/SSE integration for live progress
- Status indicators
- Error handling

## Styling

The project uses Tailwind CSS for styling with a custom configuration:

- Custom color palette
- Responsive breakpoints
- Typography system
- Component variants

## Development

### Adding New Components

1. Create component in `src/components`
2. Add styles using Tailwind classes
3. Import and use in pages

### API Integration

The `src/services` directory contains API client functions:

```typescript
// Example API call
const generateCampaign = async (data) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate-campaign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};
```

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to your preferred platform (e.g., Vercel):
   ```bash
   vercel deploy
   ```

## Best Practices

- Use TypeScript for type safety
- Follow Next.js best practices
- Implement proper error boundaries
- Use React hooks effectively
- Maintain consistent code style

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
