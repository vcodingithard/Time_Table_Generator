# SmartSched AI

SmartSched AI is an intelligent timetable generation platform for educational institutions. It combines a MERN-stack backend with AI-assisted scheduling logic to help administrators create, manage, and optimize class schedules with less manual effort.

## Overview

The platform is designed for colleges and universities that need to manage:
- faculty availability and teaching load
- room and lab allocation
- course and class structure
- timetable constraints such as breaks and slot timings
- AI-generated timetables with conflict awareness

The core idea is simple: collect structured institute data, feed it into an AI scheduling workflow, and produce a timetable that respects practical constraints while remaining easy to review and manage.

## Theory Behind the Solution

This project uses a rule-driven and AI-assisted scheduling approach:

1. Data Modeling
   - Institutions define classes, courses, faculty, rooms, and timetable metadata.
   - Each course and faculty member is linked to the relevant academic context.

2. Constraint Handling
   - The system uses structured inputs such as:
     - days and slots per day
     - break timings
     - room capacities and types
     - faculty workload limits
   - These constraints form the backbone of the scheduling problem.

3. AI Generation
   - The timetable generation service builds a prompt containing all relevant resources and restrictions.
   - The AI model proposes a schedule and returns structured timetable data.
   - The backend validates and sanitizes the response before saving it.

4. Subscription & Usage Control
   - Paid plans control AI generation credits.
   - Each successful generation updates usage data and subscription limits.

## Tech Stack

### Frontend
- React
- Vite
- React Router DOM
- Tailwind CSS
- Framer Motion
- Lucide React
- Cashfree JS SDK

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Axios
- Cashfree Payment API

### AI Integration
- OpenRouter / LLM-based scheduling generation
- Structured prompt engineering for timetable generation

## Cashfree Payment Implementation

The application includes a complete subscription and payment flow powered by Cashfree.

### What is implemented
- payment order creation from the backend
- frontend checkout using the Cashfree JS SDK
- payment status verification after redirection
- webhook handling for successful payment confirmation
- subscription activation and validity extension after successful payment

### Flow
1. A user selects a subscription plan from the dashboard.
2. The backend creates a Cashfree payment order.
3. The frontend initializes Cashfree checkout with the returned payment session ID.
4. The user completes the payment.
5. Cashfree redirects the user back to the payment status page.
6. The backend verifies payment status and activates the plan through subscription updates.

### Environment Variables
The backend expects these environment variables:
- PORT
- MONGO_URI
- JWT_SECRET
- FRONTEND_URL
- NODE_ENV
- CF_APP_ID
- CF_SECRET_KEY
- CASHFREE_NOTIFY_URL

## Features

- secure institute authentication and authorization
- management screens for classes, courses, faculty, rooms, and metadata
- AI-driven timetable generation
- responsive dashboard and management interface
- subscription-based AI usage control
- payment status monitoring and webhooks

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- npm or pnpm

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```text
backend/
  controllers/
  models/
  routes/
  services/
  utils/

frontend/
  src/
    components/
    pages/
    api/
    context/
```

## Notes

This project is a strong example of combining structured operational data, AI generation, and real-world business flows like subscriptions and payments into a single practical application.
