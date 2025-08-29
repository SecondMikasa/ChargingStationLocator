# Implementation Plan

- [x] 1. Set up project foundation and core types





  - Create TypeScript interfaces for User, UserDevice, BatteryVoltage, and ChargingStation
  - Set up Zod validation schemas for authentication and data validation
  - Create utility functions for session management and authentication
  - _Requirements: 1.1, 1.2, 2.1_

- [x] 2. Set up NextAuth.js authentication system



  - [x] 2.1 Install and configure NextAuth.js


    - Install next-auth package and configure environment variables
    - Create NextAuth configuration with Credentials provider
    - Set up JWT and session configuration with role support
    - _Requirements: 1.1, 1.6, 1.7_


  - [x] 2.2 Create NextAuth API route and configuration

    - Implement /api/auth/[...nextauth]/route.ts with credentials provider
    - Add password verification using bcrypt for secure authentication
    - Configure session callbacks to include user ID and role
    - _Requirements: 1.6, 1.7_

  - [x] 2.3 Create user registration API endpoint


    - Implement POST /api/auth/register for new user creation
    - Add email validation, duplicate checking, and password hashing
    - Store user data in mock database with proper role assignment
    - _Requirements: 1.1, 1.2_

- [x] 3. Build NextAuth.js UI components and session management



  - [x] 3.1 Set up NextAuth session provider


    - Wrap app with NextAuth SessionProvider in layout
    - Configure client-side session management
    - Add TypeScript declarations for extended session types
    - _Requirements: 1.7, 2.1_

  - [x] 3.2 Create registration form component















    - Build SignUpForm with name, email, password, and confirm password fields
    - Add form validation using React Hook Form and Zod
    - Integrate with custom registration API and auto-signin after registration
    - _Requirements: 1.1, 1.2_

  - [x] 3.3 Create signin form component

    - Build SignInForm using NextAuth signIn function
    - Add form validation and error handling for authentication
    - Implement redirect logic after successful signin
    - _Requirements: 1.6, 1.7_

- [x] 4. Implement device registration system





  - [x] 4.1 Create device registration API endpoint


    - Implement POST /api/user/devices for linking vehicle IDs
    - Add vehicle ID validation and uniqueness checking
    - Store user-device mapping in mock database
    - _Requirements: 1.4, 1.5_

  - [x] 4.2 Create device registration form component


    - Build DeviceRegistrationForm with vehicle ID and device name fields
    - Add ESP32 ID format validation (ESP32-XXX pattern)
    - Implement success feedback and navigation to dashboard
    - _Requirements: 1.4, 1.5_

- [x] 5. Build user dashboard and battery monitoring




  - [x] 5.1 Create voltage reporting API endpoint for ESP32 devices


    - Implement POST /api/voltage-report for ESP32 voltage data submission
    - Add vehicle ID validation and voltage range checking
    - Store voltage readings with automatic percentage calculation and status determination
    - _Requirements: 2.1, 8.1_


  - [x] 5.2 Create voltage API endpoint with NextAuth session validation

    - Implement GET /api/voltage with vehicleId parameter support
    - Add NextAuth session validation using getServerSession
    - Return user-specific voltage data based on registered devices
    - _Requirements: 2.1, 2.5_

  - [x] 5.3 Create voltage display component


    - Build VoltageDisplay component showing current battery voltage and percentage
    - Add visual indicators for normal/low/critical battery status
    - Include battery icon with dynamic color coding
    - _Requirements: 2.1, 2.4_

  - [x] 5.4 Create low battery alert component


    - Build LowBatteryAlert component for voltage below 48V threshold
    - Add prominent "Find Charging Stations" call-to-action button
    - Implement conditional rendering based on battery status
    - _Requirements: 2.2, 2.3_

  - [x] 5.5 Create user dashboard page


    - Build protected dashboard page with user welcome message
    - Integrate VoltageDisplay and LowBatteryAlert components
    - Add navigation to charging stations and voltage history
    - _Requirements: 2.4, 2.5_

- [x] 6. Implement voltage history tracking





  - [x] 6.1 Create voltage history API endpoint


    - Implement GET /api/voltage-history with NextAuth session validation
    - Add support for different time periods (day/week/month)
    - Return user-specific historical voltage data with proper filtering
    - _Requirements: 4.1, 4.4_

  - [x] 6.2 Create voltage history chart component


    - Build VoltageChart component using Recharts library
    - Add interactive time-series visualization
    - Implement responsive chart design and tooltip functionality
    - _Requirements: 4.2, 4.3_

  - [x] 6.3 Create voltage history page


    - Build protected voltage history page with chart integration
    - Add time period selection and device switching for multiple devices
    - Implement loading states and error handling
    - _Requirements: 4.1, 4.4_

- [x] 7. Build charging station discovery system








  - [x] 7.1 Create stations API endpoint




    - Implement GET /api/stations/nearby with location parameters
    - Add distance calculation and sorting functionality
    - Return station data with user location context
    - _Requirements: 3.1, 3.2_


  - [x] 7.2 Create station list component

    - Build StationList component with sorting and filtering
    - Add distance, price, and queue length display
    - Implement "Navigate" button with Google Maps integration
    - _Requirements: 3.3, 3.4, 3.6_

  - [x] 7.3 Create station map component






    - Build StationMap component using Mapbox or Leaflet
    - Add custom markers for charging stations
    - Implement popup information windows with station details
    - _Requirements: 3.7, 9.1, 9.2, 9.3_



  - [x] 7.4 Create charging stations page






    - Build stations page with geolocation request
    - Integrate StationList and StationMap components
    - Add loading states and location permission handling
    - _Requirements: 3.1, 3.2, 3.5_

- [-] 8. Implement admin panel functionality


  - [x] 8.1 Implement admin role-based access control


    - Add admin role checking using NextAuth session
    - Create admin route protection middleware
    - Set up admin user in mock database with 'admin' role
    - _Requirements: 5.1, 5.2_



  - [x] 8.2 Create admin station management API








    - Implement POST /api/admin/stations for adding new stations
    - Add PUT and DELETE endpoints for station updates and removal
    - Include validation and error handling for station data
    - _Requirements: 6.4, 6.5_

  - [x] 8.3 Create admin dashboard components




    - Build StationTable component with edit and delete actions
    - Create AddStationForm with location picker functionality
    - Add LocationPicker component with interactive map
    - _Requirements: 5.3, 5.4, 6.1, 6.2, 6.3_

  - [x] 8.4 Create admin pages with role-based access




    - Create admin dashboard with role-based route protection
    - Build station management table with admin session validation
    - Build add station page with admin authentication checks
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 9. Add responsive design and navigation





  - [x] 9.1 Create navigation components with NextAuth integration


    - Build main Navigation component using NextAuth useSession hook
    - Create UserNav component with profile dropdown and NextAuth signOut
    - Add MobileNav component for responsive mobile navigation
    - _Requirements: 7.1, 7.2, 7.3_


  - [x] 9.2 Add toast notifications and UI polish

    - Integrate Sonner for success/error toast notifications
    - Add loading spinners and skeleton components
    - Implement proper error boundaries and fallback UI
    - _Requirements: 7.4, 7.5_

- [ ] 10. Set up mock data and testing infrastructure












  - [ ] 10.1 Create comprehensive mock data
    - Build mock database with users, devices, stations, and voltage readings
    - Add realistic test data with valid coordinates and relationships
    - Implement mock API responses for all endpoints
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ] 10.2 Add development utilities
    - Create API client functions for consistent data fetching
    - Add geolocation utilities with fallback handling
    - Implement development seed data and reset functionality
    - _Requirements: 8.4, 8.5_

- [ ] 11. Integration of multiple admins support



  - [ ] 11.1 Admin UI with station ownership indicators 
    - On the admin station table, ensure each station displays the admin’s name or "Owned by You" badge
    - Confirm `AddStationForm` from `components/admin` is reusable and correctly associates new stations with the logged-in admin
    - Validate success toasts appear after station addition ("✅ Station added successfully under your account")
    - _Requirements: 7.1, 7.5, 9.3_
     
  - [ ] 11.2 Test multi-admin station management and ownership 
    - Log in as Admin A and add a new charging station via /admin/stations/add
    - Confirm station is created with adminId set to Admin A’s user ID
    - Verify station appears in Admin A’s dashboard and station list
    - Log out and log in as Admin B
    - Confirm Admin B cannot see Admin A’s station in their dashboard
    - Admin B adds their own station and confirms it is isolated to their account
    - Attempt for Admin B to edit or delete Admin A’s station — expect 403 Forbidden
    - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3_
     