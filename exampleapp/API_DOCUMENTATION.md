# MeetingFlow API Documentation

This document describes all the backend API endpoints available in the MeetingFlow application.

## Base URL

All API endpoints are prefixed with `/api`

## Response Format

All API responses follow this structure:

```typescript
{
  success: boolean;
  data?: T;           // Present on successful requests
  error?: string;     // Present on failed requests
  message?: string;   // Optional message
}
```

---

## Meetings API

### Get All Meetings

**Endpoint:** `GET /api/meetings`

**Query Parameters:**

- `q` (optional): Search query to filter meetings by title/description
- `status` (optional): Filter by meeting status (Confirmed, Completed, Cancelled, Tentative)
- `startDate` (optional): Filter meetings after this date (ISO string)
- `endDate` (optional): Filter meetings before this date (ISO string)

**Response:**

```typescript
{
  success: true,
  data: Meeting[]
}
```

**Example:**

```bash
GET /api/meetings?status=Confirmed
GET /api/meetings?q=standup
```

---

### Get Single Meeting

**Endpoint:** `GET /api/meetings/:id`

**Response:**

```typescript
{
  success: true,
  data: Meeting
}
```

---

### Create Meeting

**Endpoint:** `POST /api/meetings`

**Body:**

```typescript
{
  title: string;          // Required
  time: string;           // Required (ISO datetime string)
  duration: number;       // Required (in minutes)
  attendees?: number;
  status?: "Confirmed" | "Completed" | "Cancelled" | "Tentative";
  description?: string;
  location?: string;
  organizer?: string;
  hasNotes?: boolean;
  hasAgenda?: boolean;
}
```

**Response:**

```typescript
{
  success: true,
  data: Meeting,
  message: "Meeting created successfully"
}
```

---

### Update Meeting

**Endpoint:** `PATCH /api/meetings/:id`

**Body:** Any partial Meeting fields

**Response:**

```typescript
{
  success: true,
  data: Meeting,
  message: "Meeting updated successfully"
}
```

---

### Delete Meeting

**Endpoint:** `DELETE /api/meetings/:id`

**Response:**

```typescript
{
  success: true,
  message: "Meeting deleted successfully"
}
```

---

## Dashboard API

### Get Dashboard Statistics

**Endpoint:** `GET /api/dashboard/stats`

**Response:**

```typescript
{
  success: true,
  data: {
    meetingsThisWeek: {
      value: number;
      change: number;
      changeLabel: string;
    };
    timeInMeetings: {
      value: number;      // in hours
      change: number;
      changeLabel: string;
    };
    declinedMeetings: {
      value: number;
      change: number;
      changeLabel: string;
    };
    optimizations: {
      value: number;
      changeLabel: string;
    };
  }
}
```

---

### Get Meeting Trends

**Endpoint:** `GET /api/dashboard/trends`

**Response:**

```typescript
{
  success: true,
  data: Array<{
    week: string;
    meetings: number;
    hours: number;
  }>
}
```

---

### Get Recent Meetings

**Endpoint:** `GET /api/dashboard/recent`

**Response:**

```typescript
{
  success: true,
  data: Meeting[]  // Last 5 completed meetings
}
```

---

## Analytics API

### Get Analytics Data

**Endpoint:** `GET /api/analytics`

**Response:**

```typescript
{
  success: true,
  data: {
    timeByType: Array<{
      label: string;
      percent: number;
      hours: number;
    }>;
    meetingHealth: {
      withAgendas: number;
      withAgendasTrend: number;
      decisionEffectiveness: number;
    };
    insights: Array<{
      type: "info" | "warning" | "success";
      title: string;
      description: string;
    }>;
  }
}
```

---

## Calendar API

### Get Calendar Events

**Endpoint:** `GET /api/calendar`

**Query Parameters:**

- `month` (optional): Month number (0-11, defaults to current month)
- `year` (optional): Year (defaults to current year)

**Response:**

```typescript
{
  success: true,
  data: Array<{
    id: string;
    title: string;
    date: string;       // ISO date string
    time: string;       // Formatted time
    duration: string;   // Formatted duration
    meetingId?: string;
  }>
}
```

**Example:**

```bash
GET /api/calendar?month=10&year=2024
```

---

## Summaries API

### Get All Summaries

**Endpoint:** `GET /api/summaries`

**Response:**

```typescript
{
  success: true,
  data: MeetingSummary[]
}
```

---

### Get Single Summary

**Endpoint:** `GET /api/summaries/:id`

**Response:**

```typescript
{
  success: true,
  data: MeetingSummary
}
```

---

### Get Summary by Meeting ID

**Endpoint:** `GET /api/summaries/meeting/:meetingId`

**Response:**

```typescript
{
  success: true,
  data: MeetingSummary
}
```

---

### Generate Summary

**Endpoint:** `POST /api/summaries`

**Body:**

```typescript
{
  meetingId: string;     // Required
  meeting: string;       // Required (meeting title)
  date: string;          // Required
  attendees?: number;
  keyPoints?: string[];
  fullSummary?: string;
}
```

**Response:**

```typescript
{
  success: true,
  data: MeetingSummary,
  message: "Summary generated successfully"
}
```

---

## Settings API

### Get User Settings

**Endpoint:** `GET /api/settings`

**Response:**

```typescript
{
  success: true,
  data: {
    account: {
      email: string;
      name: string;
    };
    notifications: {
      emailDigest: "Daily" | "Weekly" | "Never";
      meetingReminders: boolean;
      summaryNotifications: boolean;
    };
    team: {
      teamMembers: number;
      workspace: string;
      role: string;
    };
    preferences: {
      timeZone: string;
      theme: "Light" | "Dark" | "System";
      language: string;
    };
  }
}
```

---

### Update User Settings

**Endpoint:** `PATCH /api/settings`

**Body:** Partial UserSettings object

**Response:**

```typescript
{
  success: true,
  data: UserSettings,
  message: "Settings updated successfully"
}
```

---

## Data Types

### Meeting

```typescript
interface Meeting {
  id: string;
  title: string;
  attendees: number;
  time: string; // ISO datetime string
  duration: number; // in minutes
  status: "Confirmed" | "Completed" | "Cancelled" | "Tentative";
  description?: string;
  location?: string;
  organizer?: string;
  hasNotes: boolean;
  hasAgenda: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### MeetingSummary

```typescript
interface MeetingSummary {
  id: string;
  meetingId: string;
  meeting: string;
  date: string;
  attendees: number;
  keyPoints: string[];
  fullSummary: string;
  generatedAt: string;
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:

```typescript
{
  success: false,
  error: "Error message describing what went wrong"
}
```

---

## Frontend Integration

### Using the API Client

The app provides a convenient API client in `lib/api-client.ts`:

```typescript
import { api } from "@/lib/api-client";

// Get all meetings
const response = await api.getMeetings();

// Create a meeting
const response = await api.createMeeting({
  title: "Team Sync",
  time: new Date().toISOString(),
  duration: 30,
});

// Update a meeting
const response = await api.updateMeeting("meeting-id", {
  status: "Completed",
});
```

### Using React Hooks

The app provides custom React hooks in `lib/hooks.ts`:

```typescript
import { useMeetings, useDashboardStats } from "@/lib/hooks";

function MyComponent() {
  const { meetings, loading, error, createMeeting } = useMeetings();
  const { stats } = useDashboardStats();

  // Use the data in your component
}
```

---

## Database

The current implementation uses an in-memory data store (`lib/db.ts`). To connect to a real database:

1. Install your database client (e.g., Prisma, Drizzle)
2. Replace the functions in `lib/db.ts` with actual database queries
3. The API routes don't need to change - they use the db abstraction layer

Example with Prisma:

```typescript
// lib/db.ts
import { prisma } from "./prisma";

export const db = {
  meetings: {
    getAll: async () => prisma.meeting.findMany(),
    // ... other methods
  },
};
```

---

## Development

### Running the Dev Server

```bash
cd exampleapp
npm run dev
```

The API will be available at `http://localhost:3000/api`

### Testing API Endpoints

You can test endpoints using curl:

```bash
# Get all meetings
curl http://localhost:3000/api/meetings

# Create a meeting
curl -X POST http://localhost:3000/api/meetings \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Meeting","time":"2024-11-10T14:00:00Z","duration":30}'

# Get dashboard stats
curl http://localhost:3000/api/dashboard/stats
```

Or use tools like Postman, Insomnia, or Thunder Client.
