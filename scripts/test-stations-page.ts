/**
 * Test script for verifying client-side functionality of the stations page
 * 
 * This script is meant to be run in a browser environment to test:
 * 1. Map loading correctly after hydration
 * 2. Geolocation functionality
 * 3. Navigation and other window-dependent features
 * 
 * Usage:
 * 1. Start the development server: npm run dev
 * 2. Open the browser console on the stations page
 * 3. Copy and paste this script into the console
 */

(function() {
  console.log('Starting stations page test...');
  
  // Test 1: Verify map component is loaded
  const mapElement = document.querySelector('.leaflet-container');
  console.log('Map component loaded:', !!mapElement);
  
  // Test 2: Verify map tiles are loaded
  const mapTiles = document.querySelectorAll('.leaflet-tile');
  console.log('Map tiles loaded:', mapTiles.length > 0);
  
  // Test 3: Verify markers are present (if stations are loaded)
  const markers = document.querySelectorAll('.leaflet-marker-icon');
  console.log('Map markers present:', markers.length);
  
  // Test 4: Test window access
  try {
    const currentUrl = window.location.href;
    console.log('Window access successful:', currentUrl);
  } catch (error) {
    console.error('Window access failed:', error);
  }
  
  // Test 5: Test navigator access
  try {
    const userAgent = navigator.userAgent;
    console.log('Navigator access successful:', userAgent);
  } catch (error) {
    console.error('Navigator access failed:', error);
  }
  
  // Test 6: Test geolocation API (if available)
  if (navigator.geolocation) {
    console.log('Geolocation API available');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation successful:', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation error:', error.message);
      }
    );
  } else {
    console.warn('Geolocation API not available');
  }
  
  console.log('Stations page test complete');
})();