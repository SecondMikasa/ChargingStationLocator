# Requirements Document

## Introduction

The EV Battery Monitoring and Smart Charging Station Recommender System is a responsive web application that helps electric vehicle owners monitor their battery status and locate nearby charging stations. The system consists of a public user dashboard for battery monitoring and station discovery, and an admin panel for managing charging station data. The application will be built using Next.js with Tailwind CSS and will integrate with mapping services to provide real-time location-based recommendations.

## Requirements

### Requirement 1

**User Story:** As a new user, I want to create an account and register my EV device, so that I can track my specific vehicle's battery status.

#### Acceptance Criteria

1. WHEN I access the registration page THEN the system SHALL provide fields for name, email, and password
2. WHEN I submit valid registration data THEN the system SHALL create a new user account
3. WHEN registration is successful THEN the system SHALL redirect me to the device registration page
4. WHEN I enter a unique vehicle ID THEN the system SHALL link it to my account
5. WHEN device registration is complete THEN the system SHALL redirect me to the dashboard
6. WHEN I return to the site THEN the system SHALL provide a login page with email and password fields
7. WHEN I log in successfully THEN the system SHALL redirect me to my personalized dashboard

### Requirement 2

**User Story:** As a logged-in EV owner, I want to monitor my battery voltage in real-time, so that I can be alerted when my battery is running low and needs charging.

#### Acceptance Criteria

1. WHEN I access the dashboard THEN the system SHALL display my current battery voltage fetched from /api/voltage for my registered vehicle
2. WHEN my battery voltage is below 48V THEN the system SHALL display an alert banner with the message "⚠ Battery low! Find charging stations"
3. WHEN the low battery alert is displayed THEN the system SHALL provide a "Find Charging Stations" button that navigates to the stations page
4. WHEN the dashboard loads THEN the system SHALL welcome me by name and display "Smart EV Battery Monitor"
5. WHEN I have multiple devices THEN the system SHALL allow me to switch between them or show data for my active device

### Requirement 3

**User Story:** As a logged-in EV owner, I want to find nearby charging stations with relevant information, so that I can choose the most convenient option for charging my vehicle.

#### Acceptance Criteria

1. WHEN I access the charging stations page THEN the system SHALL request my location using HTML5 Geolocation
2. WHEN my location is obtained THEN the system SHALL fetch nearby stations from /api/stations/nearby?lat=X&lng=Y
3. WHEN stations are loaded THEN the system SHALL display both a list view and map view of charging stations
4. WHEN displaying station information THEN the system SHALL show station name, price per kWh, distance from user, and queue length
5. WHEN viewing the stations list THEN the system SHALL provide sorting options by distance, price, and queue length
6. WHEN I select a station THEN the system SHALL provide a "Navigate" button that opens Google Maps directions
7. WHEN stations are displayed on the map THEN the system SHALL show markers with popup information including station name, price, and queue

### Requirement 4

**User Story:** As a logged-in EV owner, I want to view my battery voltage history, so that I can track my battery performance over time.

#### Acceptance Criteria

1. WHEN I access the voltage history page THEN the system SHALL fetch historical data from /api/voltage-history for my registered vehicle
2. WHEN historical data is loaded THEN the system SHALL display voltage readings in either table or chart format
3. WHEN displaying the chart THEN the system SHALL use appropriate charting library (Recharts or Chart.js)
4. WHEN I have multiple devices THEN the system SHALL allow me to view history for each device separately

### Requirement 5

**User Story:** As a system administrator, I want to manage charging station data through an admin panel, so that I can keep the station information accurate and up-to-date.

#### Acceptance Criteria

1. WHEN I access the admin panel THEN the system SHALL require authentication with hardcoded credentials
2. WHEN authentication is successful THEN the system SHALL redirect to the admin dashboard
3. WHEN viewing the admin dashboard THEN the system SHALL display a table of all charging stations
4. WHEN viewing station entries THEN the system SHALL provide Edit and Delete action buttons for each station
5. WHEN managing stations THEN the system SHALL provide an "Add Station" button that opens the add station form

### Requirement 6

**User Story:** As a system administrator, I want to add new charging stations with location data, so that users can discover and navigate to these new locations.

#### Acceptance Criteria

1. WHEN I access the add station form THEN the system SHALL provide input fields for station name, price per kWh, and queue length
2. WHEN entering location data THEN the system SHALL provide two options: manual latitude/longitude entry OR interactive map pin placement
3. WHEN using the map option THEN the system SHALL auto-fill latitude and longitude coordinates when a pin is dropped
4. WHEN I submit the form THEN the system SHALL send data to POST /api/admin/add-station
5. WHEN submission is successful THEN the system SHALL display a success toast and redirect to the station list
6. WHEN submission fails THEN the system SHALL display appropriate error messages

### Requirement 7

**User Story** As a registered system administrator, I want to securely add, manage, and own charging stations under my identity, so that I can contribute to the network while maintaining accountability and control over my stations.

### **Acceptance Criteria**

1. WHEN I log in as an admin, THEN the system SHALL authenticate me using secure credentials and associate all actions with my admin profile. 
2. WHEN I access the admin dashboard, THEN the system SHALL display only the charging stations assigned to me, ensuring data ownership and isolation from other admins. 
3. WHEN I click "Add Station", THEN the system SHALL render the `add-station-form.tsx` component from `/components/admin`, pre-configured for multi-admin use. 
4. WHEN I fill out the add station form, THEN the system SHALL require: station name, price per kWh, queue length, and location (manual lat/lng OR interactive map pin). 
5. WHEN I use the interactive map, THEN the system SHALL allow me to drop a pin and auto-populate latitude and longitude fields upon placement. 
6. WHEN I submit the form, THEN the system SHALL send a `POST` request to `/api/admin/add-station` with my `adminId` included to establish ownership. 
7. WHEN the station is added successfully, THEN the system SHALL persist the station with my `adminId` as owner, display a success toast ("✅ Station added successfully under your account"), and redirect to my station list. 
8. WHEN submission fails, THEN the system SHALL display clear error messages and preserve form input for correction. 
9. WHEN I view the station list, THEN every station I added SHALL be visibly tagged with my name or admin ID and show an "Owned by You" indicator. 

### Requirement 8

**User Story:** As a user of the application, I want a responsive and modern interface that works on all devices, so that I can access the system from my phone, tablet, or desktop.

#### Acceptance Criteria

1. WHEN accessing the application on any device THEN the system SHALL display a responsive layout using Tailwind CSS
2. WHEN using the interface THEN the system SHALL provide modern UI components using Shadcn/UI
3. WHEN interacting with the system THEN the system SHALL display appropriate icons for battery, EV, energy, and map markers
4. WHEN operations complete THEN the system SHALL show toast alerts for success/failure states
5. WHEN navigating between pages THEN the system SHALL provide smooth page transitions and loading states
6. WHEN using mobile devices THEN the system SHALL maintain full functionality and usability

### Requirement 9

**User Story:** As a system administrator, I demand a robust multi-admin architecture where I can not only add and manage my own charging stations but also analyze their performance—because every station I deploy reflects my responsibility and service quality.

### **Acceptance Criteria**
1. WHEN an admin logs in, THEN the backend SHALL verify their identity and return only stations linked to their `adminId`, enforcing strict data access control. 
2. WHEN an admin accesses the dashboard, THEN the system SHALL display a personalized view of their stations, including real-time metrics: average daily usage, peak hours, feedback, and uptime. 
3. WHEN an admin views a specific station, THEN the system SHALL provide a detailed analytics panel showing utilization trends, performance, and estimated revenue (if applicable). 
4. WHEN an admin adds a station, THEN they MUST do so exclusively through the reusable `add-station-form.tsx` component located in `/components/admin`, ensuring consistent UX and logic across the admin panel. 
5. WHEN a station is created, THEN the database SHALL store the `adminId` as a foreign key, establishing immutable ownership (unless modified by a super-admin). 
6. WHEN multiple admins exist, THEN each SHALL operate in isolation—able to edit or delete only their own stations, with the UI clearly reflecting ownership (e.g., "My Stations" section). 
7. WHEN an admin is deactivated, THEN the system SHALL either reassign or archive their stations based on organizational policy. 
8. WHEN viewing stations globally (e.g., super-admin view), THEN the system MAY show all stations across admins, BUT regular admins SHALL only see and interact with their own. 

### Requirement 10

**User Story:** As a user, I want to see charging stations displayed on an interactive map, so that I can visualize their locations and make informed decisions about which station to visit.

#### Acceptance Criteria

1. WHEN viewing charging stations THEN the system SHALL display them on a real map using Mapbox or Leaflet
2. WHEN stations are plotted THEN the system SHALL use distinct markers for each charging station
3. WHEN I click on a marker THEN the system SHALL display a popup with station details including name, price, and queue information
4. WHEN viewing the map THEN the system SHALL support standard map interactions like zoom, pan, and marker selection
5. WHEN displaying multiple stations THEN the system SHALL ensure all markers are visible and accessible