# TeeUp Data Architecture

## Overview

TeeUp is a golf tee time booking application built with modern web technologies. The application allows golfers to sign up for available playing dates with a maximum capacity of 8 golfers per day.

## Technology Stack

### Frontend
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks and Zustand
- **Date Handling**: date-fns library

### Backend
- **API**: Next.js API Routes (serverless functions)
- **ORM**: Prisma 6.9.0
- **Database**: PostgreSQL (hosted on Supabase)
- **Hosting**: Vercel

## Database Schema

### Database Type
PostgreSQL database hosted on Supabase with connection pooling via pgbouncer.

### Data Models

#### 1. Golfer Model
Represents a person who can sign up for tee times.

```prisma
model Golfer {
  id           String   @id @default(cuid())  // Unique identifier
  firstName    String                         // Golfer's first name
  lastInitial  String   @db.VarChar(1)       // Last name initial (1 character)
  mobileNumber String?                        // Optional mobile number
  createdAt    DateTime @default(now())       // Timestamp of creation
  signups      Signup[]                       // Related signups
  
  @@unique([firstName, lastInitial])         // Composite unique constraint
  @@map("golfers")                           // Database table name
}
```

**Key Features:**
- Uses CUID for unique identifiers (collision-resistant IDs)
- Combination of firstName and lastInitial must be unique
- Mobile number is optional
- Cascading delete for related signups

#### 2. Signup Model
Represents a golfer's signup for a specific date.

```prisma
model Signup {
  id        String   @id @default(cuid())     // Unique identifier
  golferId  String                            // Foreign key to Golfer
  date      DateTime @db.Date                 // Date of play (no time)
  createdAt DateTime @default(now())          // Timestamp of creation
  
  golfer    Golfer   @relation(...)           // Relation to Golfer
  
  @@unique([golferId, date])                  // Composite unique constraint
  @@map("signups")                            // Database table name
}
```

**Key Features:**
- Links a golfer to a specific date
- Date field stores only the date portion (no time)
- A golfer can only sign up once per date (enforced by unique constraint)
- Cascading delete when golfer is removed

### Database Constraints

1. **Capacity Limit**: Maximum 8 golfers per date (enforced in application logic)
2. **Unique Signups**: A golfer cannot sign up multiple times for the same date
3. **Golfer Limit**: Maximum 50 golfers in the system (enforced in UI)
4. **Date Range**: Signups available for current week + 3 additional weeks

## Data Flow

### 1. Golfer Management
```
User Action → API Route → Prisma ORM → PostgreSQL Database
```

**Create Golfer Flow:**
1. User fills form with firstName, lastInitial, and optional mobileNumber
2. POST request to `/api/golfers`
3. Prisma creates new golfer record
4. Returns created golfer data

**Update Golfer Flow:**
1. User edits golfer information
2. PUT request to `/api/golfers/[id]`
3. Prisma updates golfer record
4. Returns updated golfer data

**Delete Golfer Flow:**
1. User confirms deletion
2. DELETE request to `/api/golfers/[id]`
3. Prisma deletes golfer and all related signups (cascade)
4. Returns success status

### 2. Signup Management

**Create Signup Flow:**
1. User selects dates on booking page
2. POST request to `/api/signups` with golferId and date
3. System validates:
   - Golfer exists
   - Date not already booked by this golfer
   - Date has capacity (< 8 golfers)
4. Prisma creates signup record
5. Returns created signup data

**Delete Signup Flow:**
1. User deselects date on booking page
2. DELETE request to `/api/signups?id=[signupId]`
3. Prisma deletes signup record
4. Returns success status

### 3. Data Retrieval

**Get All Golfers:**
- GET `/api/golfers`
- Returns array of all golfers ordered by firstName

**Get All Signups:**
- GET `/api/signups`
- Returns signups for 4-week period with golfer data
- Filtered by date range (current week + 3 weeks)

## Performance Optimizations

1. **Database Connection Pooling**: Uses Supabase's pgbouncer for efficient connection management
2. **Batch Operations**: Multiple signup changes are batched before sending to server
3. **Debouncing**: 500ms debounce on signup changes to reduce API calls
4. **Optimistic Updates**: UI updates immediately, reverts on error
5. **Offline Support**: Changes saved to localStorage when offline

## Security Considerations

1. **Input Validation**: All inputs validated on server-side
2. **SQL Injection Prevention**: Prisma ORM provides parameterized queries
3. **Unique Constraints**: Database-level constraints prevent duplicate data
4. **Error Handling**: Detailed error logging on server, generic messages to client

## Environment Variables

The application requires the following environment variables:

```bash
DATABASE_URL="postgresql://[connection-string]?pgbouncer=true"
DIRECT_URL="postgresql://[direct-connection-string]"
```

- `DATABASE_URL`: Pooled connection for production use
- `DIRECT_URL`: Direct connection for migrations

## Data Backup and Recovery

- Database hosted on Supabase includes automatic backups
- Point-in-time recovery available through Supabase dashboard
- All data changes are logged with timestamps

## Future Considerations

1. **Audit Trail**: Add a separate table for tracking all changes
2. **Soft Deletes**: Implement soft delete pattern for data recovery
3. **User Authentication**: Add user accounts and permissions
4. **Additional Fields**: Handicap, email, preferences, etc.
5. **Notifications**: SMS/Email notifications for bookings 