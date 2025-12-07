# Expense Tracker

A modern expense tracking application built with React, Vite, and Tailwind CSS.

## Prerequisites

- Node.js (v16 or higher)
- npm

## Getting Started

1.  **Install Dependencies**
    Run this command to install all necessary packages:
    ```bash
    npm install
    ```

2.  **Run Development Server**
    To start the app locally:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

3.  **Build for Production**
    To create a production-ready build:
    ```bash
    npm run build
    ```
    The built files will be in the `dist` directory.

## Features

- **Multi-Currency Support**: Track expenses in OMR, USD, and EGP.
- **Dashboard**: View total expenses and recent transactions.
- **Reports**: Visualize spending by category with charts.
- **Local Storage**: Data persists in your browser.

## Server Management

### Port Information
By default, the application runs on **port 5173**.
- URL: `http://localhost:5173`

### Stopping the Server
- **Terminal**: Press `Ctrl + C` in the terminal window where the server is running.
- **Force Kill**: If the port is stuck, run:
  ```bash
  lsof -t -i:5173 | xargs kill -9
  ```

### Starting the Server
If the server is stopped, you can start it again with:
```bash
npm run dev
```


<!-- publishing to prod by using
Supabase (Cloud Database): This is where your DATA lives (your expenses, categories, user accounts). Think of it like a giant Excel sheet in the cloud that is secure and accessible from anywhere.
Netlify (Host Server): This is where your WEBSITE lives (the HTML, CSS, and JavaScript code). It serves the actual webpage to your browser. -->
