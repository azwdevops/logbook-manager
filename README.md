# Logbook Manager

## Overview

Logbook Manager is a Django and React-based application designed to help carriers manage driver logs, trips, and route planning efficiently. The application provides real-time tracking of driver activities, automatic route detection, and trip assignment functionalities.

## Features

- **User Roles:**
  - **System Admin:** Adds carriers and assigns carrier admins.
  - **Carrier Admin:** Manages drivers, assigns drivers/trucks to trips, and views logs.
  - **Drivers:** View logbooks, trip summaries, and routes on the map.
- **Route Management:**
  - Integrated OpenStreetMap API for route visualization.
  - Location search with auto-detect current location.
- **Trip and Logbook Management:**
  - View trip summaries and logbooks.
  - Assign only available drivers/trucks to trips.
- **Activity Timer:**
  - Tracks various driver activities such as:
    - Driving
    - Off Duty
    - Sleeper Berth
    - On Duty (Not Driving)
    - Stops

## Tech Stack

- **Frontend:** React, Material UI
- **Backend:** Django, Django REST Framework
- **Database:** PostgreSQL
- **Mapping API:** OpenStreetMap API

## Project Structure

```
logbook-manager/
├── client/        # React frontend
├── server/        # Django backend
├── README.md      # Documentation
```

## Setup Instructions

### Prerequisites

Ensure you have the following installed:

- Node.js (v16+)
- Python (v3.9+)
- PostgreSQL
- Git

### Backend Setup (Django)

```sh
cd server
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Follow prompts to create admin user
python manage.py runserver
```

### Frontend Setup (React)

```sh
cd client
npm install
npm start
```

### Environment Variables

Create a `.env` file in both `server/` and `client/` with the necessary API keys and database configurations.

### Running the Application

- Start the Django backend: `python manage.py runserver`
- Start the React frontend: `npm start`

## Usage

1. **Login as System Admin:** Create carrier accounts and assign carrier admins.
2. **Carrier Admin Dashboard:** Add drivers, assign trips, and manage logbooks.
3. **Driver Dashboard:** View trip summaries, logbook entries, and assigned routes.
4. **Real-time Activity Tracking:** Monitor driver statuses using the timer.

## Contributing

1. Fork the repository
2. Create a new branch (`feature-xyz`)
3. Commit changes and push to your branch
4. Open a Pull Request

## License

This project is licensed under the MIT License.
