# Quantity Measurement Web App

A web-based application for converting, comparing, and performing arithmetic operations with various units of measurement. The app provides an intuitive interface for handling length, weight, temperature, and volume conversions.

## Overview

This application is built with vanilla JavaScript, Bootstrap CSS framework, and a JSON-based backend server. It allows users to seamlessly convert between different measurement units, compare quantities, and perform arithmetic calculations.

## Features

- **Unit Conversion**: Convert between units within the same measurement type with instant results
- **Unit Comparison**: Compare two quantities in different units to determine which is larger
- **Arithmetic Operations**: Perform addition, subtraction, multiplication, and division on quantities with unit conversions
- **Supported Measurement Types**:
  - Length: Kilometer, Meter, Centimeter
  - Weight: Ton, Kilogram, Gram
  - Temperature: Celsius, Fahrenheit, Kelvin
  - Volume: Liter, Milliliter, Gallon
- **Conversion History**: View all conversions performed in the current session with timestamps
- **Responsive Design**: Clean, modern interface using Bootstrap 5 with dark theme

## Project Structure

```
QuantityMeasurementWebApp/
├── index.html          - Main application template with UI layout
├── css/
│   └── style.css       - Custom styling and theme
├── script/
│   ├── script.js       - Main application logic and event handling
│   └── api.js          - API client for backend communication
├── server/
│   └── db.json         - Database with units, conversions, and history
└── README.md           - Project documentation
```

## File Descriptions

### index.html
- Contains the DOM structure for the web application
- Includes Bootstrap CDN for responsive grid layout
- Features three main sections: Hero banner, Feature cards, and Converter card
- Action tabs for switching between conversion modes

### css/style.css
- Professional dark blue theme (#00153e) with light contrasts
- Responsive feature cards with hover animations
- Styled form elements (dropdowns, buttons, inputs)
- Custom result panel and history list styling
- Mobile-friendly design adjustments

### script/script.js
- Manages application state (measurement type, action mode, selected units)
- Handles DOM events and tab switching
- Controls unit dropdown population
- Routes user actions (conversion, comparison, arithmetic)
- Manages history rendering and display

### script/api.js
- Provides API functions for backend communication
- Functions: getUnits(), getConversion(), saveHistory(), getHistory()
- Base URL: http://localhost:3000
- Includes error handling for failed requests

### server/db.json
- Stores 12 unit definitions across 4 measurement types
- Contains conversion factors between unit pairs
- Maintains history records with timestamps

## How to Use

1. **Start the Backend Server**:
   - Ensure db.json is available in the server directory
   - Use JSON Server or similar tool to serve the API on port 3000

2. **Open the Application**:
   - Open index.html in a web browser
   - The app will load the default Length measurement type

3. **Select Measurement Type**:
   - Click on a feature card (Length, Weight, Temperature, or Volume)
   - Unit dropdowns will update for the selected type

4. **Choose an Action**:
   - **Conversion**: Enter a value, select units, and get instant conversion
   - **Comparison**: Enter two values with different units to compare quantities
   - **Arithmetic**: Select an operation and perform calculations between two quantities

5. **View History**:
   - All operations are automatically saved
   - View the history section to see past calculations with timestamps

## Technical Details

- **Frontend**: Vanilla JavaScript (ES6 modules), Bootstrap 5, HTML5
- **Backend**: JSON Server (serves db.json)
- **API Communication**: Fetch API with error handling
- **State Management**: Simple JavaScript object-based state
- **UI Framework**: Bootstrap 5.3.8 CDN

