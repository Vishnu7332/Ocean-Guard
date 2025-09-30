# OceanGuard

## Overview
OceanGuard is a production-ready coastal hazard reporting and monitoring platform built with React, TypeScript, Supabase, and Google Maps. The application enables coastal communities to report ocean hazards in real-time, view hazard locations on interactive maps, and analyze social media sentiment about coastal threats.

## Project Architecture
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5.4
- **Backend/Auth**: Supabase (PostgreSQL database + real-time auth)
- **Maps**: Google Maps API with React Google Maps
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Internationalization**: i18next (English, Hindi, Tamil)
- **PWA**: Vite PWA Plugin with service worker support
- **State Management**: React hooks + Supabase real-time subscriptions

## Project Structure
```
src/
  ├── components/              # React components
  │   ├── AuthModal.tsx       # Supabase auth modal (email/phone OTP)
  │   ├── Dashboard.tsx       # Real-time hazard dashboard
  │   ├── HazardMap.tsx       # Google Maps with hazard markers
  │   ├── HazardReporting.tsx # GPS + camera hazard reporting
  │   ├── Header.tsx          # App header with language switcher
  │   ├── Sidebar.tsx         # Navigation sidebar
  │   ├── SocialAnalytics.tsx # Social media sentiment analysis
  │   └── UserManagement.tsx  # User role management
  ├── hooks/                   # Custom React hooks
  │   └── useAuth.ts          # Supabase authentication hook
  ├── i18n/                    # Internationalization
  │   └── config.ts           # i18next configuration (EN/HI/TA)
  ├── lib/                     # Utilities
  │   └── supabase.ts         # Supabase client configuration
  ├── App.tsx                 # Main application component
  ├── main.tsx                # Entry point with PWA registration
  └── index.css               # Global Tailwind styles
```

## Recent Changes (September 30, 2025)
- **Supabase Integration**: Complete setup with real-time authentication (email/phone OTP)
- **Google Maps**: Integrated with hazard location markers and real-time updates
- **PWA Support**: Added service worker registration for offline capabilities
- **Multi-language**: Implemented i18next with English, Hindi, and Tamil translations
- **Demo Mode**: App runs gracefully when Supabase not configured (provides demo user)
- **Error Handling**: Defensive programming for missing API keys and environment variables
- **Database Schema**: Provided complete SQL schema for Supabase setup

## Configuration Requirements

### Required Environment Variables
To enable full functionality, configure these environment variables in Replit Secrets:

1. **VITE_SUPABASE_URL**: Your Supabase project URL
2. **VITE_SUPABASE_ANON_KEY**: Your Supabase anonymous key
3. **VITE_GOOGLE_MAPS_API_KEY**: Google Maps JavaScript API key

### Database Setup
Execute the SQL schema in `supabase-schema.sql` in your Supabase SQL editor to create required tables:
- `hazard_reports`: Store hazard reports with location data
- `social_analytics`: Track social media mentions and sentiment
- Enable Row Level Security (RLS) policies as defined in the schema

See `SETUP_INSTRUCTIONS.md` for detailed configuration steps.

## Development
- **Dev Server**: `npm run dev` - Runs on port 5000
- **Build**: `npm run build` - Builds for production
- **Preview**: `npm run preview` - Preview production build

## Demo Mode
When Supabase is not configured, the app runs in demo mode:
- Demo user is automatically created
- Amber banner displays configuration instructions
- All UI components are accessible
- Features that require Supabase show appropriate messaging

## Features
### Core Functionality
- **Real-time Authentication**: Email and phone number (OTP) via Supabase
- **Hazard Reporting**: GPS location capture, camera integration, severity classification
- **Interactive Map**: Google Maps with real-time hazard markers, color-coded by severity
- **Dashboard**: Live statistics, recent reports, real-time updates
- **Social Analytics**: Social media sentiment analysis and trending topics
- **User Management**: Role-based access (citizen, official, analyst)
- **Multi-language**: English, Hindi, and Tamil support
- **PWA**: Offline support with service worker caching

### Security
- Supabase Row Level Security (RLS) policies
- Secure authentication flows
- Environment-based configuration

## Deployment
The app is configured for Replit Autoscale deployment:
- Stateless frontend architecture
- Build optimizations enabled
- PWA caching for performance

## User Preferences
- Production-ready application using Supabase for backend
- Real-time updates without page refresh
- Designed for coastal communities in India
- Fully responsive design
