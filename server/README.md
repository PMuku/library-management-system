# Node.js + Express Server (Backend)

A simple and lightweight Express server.

## Features

- RESTful API setup with Express
- Hot reloading with `nodemon` (in development)
- Basic middleware support (e.g., logging, JSON parsing)


## Installation

```bash
# Clone the repository
git clone https://github.com/OpexRah/library-management-system.git
cd library-management-system/server

# Install dependencies
npm install
```

## Available Scripts

### Run in development mode with hot reload

```bash
npm run dev
```

> Make sure `nodemon` is installed if running in development mode.


## Environment Variables

Create a `.env` file in the root directory (example file included):

```
PORT=8000
MONGO_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```
