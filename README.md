# KidneyCare - Frontend

This is the frontend for KidneyCare, a web application for kidney disease prediction and kidney cancer detection.

## Description

The frontend is a React application that provides a user-friendly interface for users to interact with the KidneyCare platform. It allows users to:

- Create an account and log in
- Predict the likelihood of chronic kidney disease based on various health parameters.
- Upload CT scan images for kidney cancer detection.
- View their prediction and detection history.

## Features

- **User Authentication:** Secure user registration and login.
- **Kidney Disease Prediction:** A form to input health metrics and get a prediction.
- **Kidney Cancer Detection:** Upload CT scan images and get a classification (Normal or Tumor).
- **Dashboard:** View and manage past predictions and detections.
- **Responsive Design:** Works on all devices.

## Getting Started

### Prerequisites

- Node.js and npm (or yarn)

### Installation

1. Clone the repository.
2. Navigate to the `kidney-cancer-frontend` directory:
   ```sh
   cd kidney-cancer-frontend
   ```
3. Install the dependencies:
   ```sh
   npm install
   ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## Dependencies

- **axios:** For making HTTP requests to the backend.
- **react:** A JavaScript library for building user interfaces.
- **react-dom:** For rendering React components in the DOM.
- **react-router-dom:** For routing in the React application.
- **react-scripts:** Scripts and configurations used by Create React App.
- **tailwindcss:** A utility-first CSS framework for styling.
- **js-cookie:** A simple, lightweight JavaScript API for handling browser cookies.
- **react-hot-toast:** For showing toast notifications.
- **web-vitals:** For measuring web vitals.
