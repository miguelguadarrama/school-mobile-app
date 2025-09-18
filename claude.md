# Parent-School Communication Mobile App

## Project Overview

This is a React Native mobile application built with Expo that enables parents and guardians to communicate with school staff. The app provides secure authentication and a modern UI for seamless school-parent interactions.

## Tech Stack

### Core Framework

- **Expo 54.0.7** - React Native development platform targeting iOS/Android
- **React Native 0.81.4** with React 19.1.0
- **TypeScript** - Full TypeScript implementation throughout the codebase
- **Expo EAS** - Build and deployment system (development, preview, production environments)

### Authentication & Security

- **Auth0** - Primary authentication provider with:
  - OAuth2 password grant flow
  - Refresh token rotation for enhanced security
  - Expo SecureStore for secure token storage
  - Custom authentication service with automatic token refresh
  - Automatic 401 error handling and token refresh

### Navigation & UI

- **React Navigation v7** - Primary navigation system featuring:
  - Bottom Tab Navigator with custom swipeable implementation
  - Native Stack Navigator for screen transitions
  - PagerView for horizontal swipe navigation between tabs
- **Custom Tab Bar** - Dynamic icon states with PhotoViewer integration

### Styling & Design

- **NativeWind 4.2.0** - Tailwind CSS for React Native styling
- **TailwindCSS 3.4.17** - Utility-first CSS framework
- **Custom Design System** - Defined colors, spacing, shadows in theme system
- **@expo-google-fonts/nunito** - Custom typography (Nunito 400/700 weights)

### State Management & API

- **SWR 2.3.3** - Data fetching library with caching, revalidation, and error handling
- **React Context** - Local state management (Auth, Tab, App contexts)
- **Custom API Service** - Handles communication with NextJS backend
- **Azure-hosted Backend** - REST API with Azure Blob Storage for assets

### Key Libraries & Features

- **Icons**: @expo/vector-icons (Ionicons), Lucide React Native, React Native Vector Icons
- **Markdown**: @ronradtke/react-native-markdown-display for rich content rendering
- **Date Handling**: Day.js for date manipulation
- **Gestures**: React Native Gesture Handler
- **Animations**: React Native Reanimated
- **File System**: Expo FileSystem for local operations
- **Sharing**: Expo Sharing for content sharing

## Project Structure

### Key Directories

```text
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API services and Auth0 integration
│   ├── contexts/       # React Context providers
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── constants/      # App constants and theme
├── assets/             # Images, fonts, and static assets
├── app.config.js       # Expo configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## Backend Integration

- **Separate Repository**: NextJS backend application
- **Azure Hosting**: Backend API hosted on Azure
- **Azure Blob Storage**: For file and asset storage
- **Environment Configuration**: Separate configs for dev/preview/production
- **API Authentication**: Integrated with Auth0 tokens

## Development Workflow

- **Expo Dev Client** - Custom development builds
- **EAS Build** - Production build system
- **Environment Management** - Development, preview, and production environments
- **TypeScript** - Full type safety with custom type definitions

## Key Features

- Secure parent/guardian authentication via Auth0
- Real-time communication between parents and school staff
- Rich content support with markdown rendering
- Cross-platform iOS and Android support
- Offline-capable with SWR caching
- File sharing and attachment support
- Modern, accessible UI with custom design system

## Development Notes

- Uses Expo managed workflow with custom dev client
- Babel configured for NativeWind JSX transformation
- Custom authentication flow with automatic token management
- Swipeable tab navigation with gesture support
- Comprehensive error handling and loading states

## Code Style & Patterns

- **TypeScript First** - All components and services are fully typed
- **Component-Based Architecture** - Reusable components with clear props interfaces
- **Context for State** - React Context for app-wide state management
- **Service Layer** - Abstracted API calls through service classes
- **Error Boundaries** - Proper error handling throughout the app
- **Responsive Design** - Mobile-first design with cross-platform considerations

## Environment Variables

The app uses environment-based configuration for:

- Auth0 domain and client configuration
- API endpoints for different environments
- Azure Blob Storage connection strings
- Feature flags for development/production differences

## Testing Approach

- Component testing with React Native Testing Library
- API service testing with Jest
- E2E testing capabilities through Expo
- Type checking with TypeScript compiler

This architecture provides a scalable, maintainable foundation for parent-school communication with modern React Native development practices.
