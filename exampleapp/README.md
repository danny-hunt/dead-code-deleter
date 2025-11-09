# MeetingFlow

A modern meeting management dashboard built with Next.js, TypeScript, and shadcn/ui. MeetingFlow helps you track, analyze, and optimize your meeting schedule to reclaim your time.

## Features

- 📊 **Dashboard** - Overview of meeting statistics, trends, and quick actions
- 📅 **Calendar** - Visual calendar with meeting schedule management
- 📝 **Meetings** - Full CRUD operations for meetings with search and filtering
- 📈 **Analytics** - Insights into meeting patterns and optimization recommendations
- 🤖 **AI Summaries** - Auto-generated meeting summaries with key points
- ⚙️ **Settings** - User preferences, notifications, and team management

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI Components:** shadcn/ui with Radix UI
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Date Handling:** date-fns

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The app will start with mock data that's stored in memory. All CRUD operations work but data will reset on server restart.

## Project Structure

```
exampleapp/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── meetings/     # Meeting CRUD endpoints
│   │   ├── dashboard/    # Dashboard data endpoints
│   │   ├── analytics/    # Analytics endpoints
│   │   ├── calendar/     # Calendar events endpoint
│   │   ├── summaries/    # Meeting summaries endpoints
│   │   └── settings/     # User settings endpoints
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page component
│   └── globals.css       # Global styles
├── components/
│   ├── pages/            # Page components (Dashboard, Meetings, etc.)
│   ├── ui/               # Reusable UI components
│   ├── header.tsx        # App header
│   ├── sidebar.tsx       # Navigation sidebar
│   └── ...               # Other components
├── lib/
│   ├── types.ts          # TypeScript type definitions
│   ├── db.ts             # Database abstraction layer
│   ├── api-client.ts     # API client for frontend
│   ├── hooks.ts          # Custom React hooks
│   └── utils.ts          # Utility functions
└── API_DOCUMENTATION.md  # Complete API documentation
```

## Backend API

The application includes a fully functional REST API with the following endpoints:

- **Meetings API** - Full CRUD operations for meetings
- **Dashboard API** - Statistics, trends, and recent meetings
- **Analytics API** - Meeting patterns and insights
- **Calendar API** - Calendar events by month
- **Summaries API** - AI-generated meeting summaries
- **Settings API** - User preferences and configuration

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Using the API

#### API Client

```typescript
import { api } from "@/lib/api-client";

// Get all meetings
const response = await api.getMeetings();

// Create a meeting
await api.createMeeting({
  title: "Team Sync",
  time: new Date().toISOString(),
  duration: 30,
});
```

#### React Hooks

```typescript
import { useMeetings, useDashboardStats } from "@/lib/hooks";

function MyComponent() {
  const { meetings, loading, error, createMeeting } = useMeetings();

  // All data fetching and mutations handled automatically
}
```

## Database

The current implementation uses an **in-memory data store** for simplicity. To connect to a real database:

1. Install your preferred database client:
   - Prisma: `npm install prisma @prisma/client`
   - Drizzle: `npm install drizzle-orm`
2. Update `lib/db.ts` to use your database client instead of the in-memory store

3. The API routes don't need changes - they use the database abstraction layer

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **Add new API endpoint:** Create a new route in `app/api/`
2. **Add new page:** Create a component in `components/pages/`
3. **Add new hook:** Add to `lib/hooks.ts`
4. **Add new types:** Update `lib/types.ts`

## Key Features Implementation

### Real-time Data Updates

All components use React hooks that automatically refresh data after mutations (create, update, delete).

### Type Safety

Full TypeScript coverage with comprehensive type definitions in `lib/types.ts`.

### Error Handling

Consistent error handling across all API routes with user-friendly error messages.

### Loading States

All data-fetching components show loading states for better UX.

### Search & Filter

Meetings page includes search functionality and status filtering.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com/new)
3. Deploy with one click

### Other Platforms

Build the app:

```bash
npm run build
```

Then deploy the `.next` folder to any Node.js hosting platform.

## License

MIT
