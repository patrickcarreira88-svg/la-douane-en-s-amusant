# LMS Douane

## Overview
LMS Douane is a Learning Management System for Swiss customs training. It provides interactive exercises, video content, flashcards, quizzes, and scenario-based learning for customs professionals.

## Project Structure
- `server.js` - Express server serving static files and API endpoints
- `index.html` - Main frontend entry point
- `js/` - Frontend JavaScript (app.js, storage.js, VideoPlayer.js, etc.)
- `css/` - Stylesheets
- `data/` - JSON data files for chapters and exercises
- `assets/` - Images and videos
- `authoring/` - Content creation tools
- `src/modules/` - Exercise loader/validator modules

## Tech Stack
- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data**: JSON files (no database)

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/chapitres` - Get all chapters
- `GET /api/exercises/:type` - Get exercises by type (qcm, dragdrop, flashcards, etc.)

## Running the Application
The server runs on port 5000, bound to 0.0.0.0 for Replit compatibility.

```bash
npm start
```

## Dependencies
- express: ^4.18.2
- cors: ^2.8.5
