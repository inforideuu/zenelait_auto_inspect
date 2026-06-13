# AutoInspect Backend — Django & REST Framework

A powerful, high-performance, and secure Django backend built for the **AutoInspect** frontend booking system. This application handles the persistent storage of vehicle inspection booking requests, processes validations, and offers a robust admin dashboard for team members to manage schedules, status changes, and customer records.

---

## 🚀 Key Features

*   **RESTful Booking API**: Fully functional endpoints using Django REST Framework for submitting and retrieving inspection bookings.
*   **Fully Configured CORS**: Built-in `django-cors-headers` middleware configured to support seamless requests from your Vite/React frontend.
*   **Rich Django Admin Interface**: Customized, organized admin panel with comprehensive search, filters (status, package, location), and status management.
*   **Interactive API Browser**: Browse, test, and debug API calls directly in the browser using DRF's built-in browsable interface.
*   **SQLite Database**: Pre-configured lightweight database that works out of the box with zero external database setup required.
*   **Automated Tests**: Unit and integration test suite to guarantee the reliability of booking submissions.

---

## 🛠️ Tech Stack

*   **Framework**: [Django](https://www.djangoproject.com/) (v5.x)
*   **API Toolkit**: [Django REST Framework (DRF)](https://www.django-rest-framework.org/)
*   **CORS Management**: [django-cors-headers](https://github.com/adamchainz/django-cors-headers)
*   **Database**: SQLite (built-in)
*   **Language**: Python (v3.10+)

---

## 📁 Project Structure

```text
backend/
├── config/              # Django core configuration directory
│   ├── settings.py      # App configurations, CORS & REST framework setup
│   ├── urls.py          # Main URL router
│   ├── wsgi.py & asgi.py
│   └── __init__.py
├── bookings/            # Bookings application module
│   ├── migrations/      # Database migrations
│   ├── admin.py         # Advanced admin panel dashboard setup
│   ├── models.py        # Database schema for Booking model
│   ├── serializers.py   # Serializers for parsing/validating booking JSON payload
│   ├── urls.py          # DRF router rules for the API
│   ├── views.py         # REST api view handlers (ModelViewSet)
│   ├── tests.py         # Automated test cases
│   └── __init__.py
├── db.sqlite3           # SQLite Database file
├── requirements.txt     # Python dependencies
├── manage.py            # Django command-line interface helper
└── README.md            # This documentation file
```

---

## 🚦 Getting Started

Follow these steps to set up and run the Django backend on your local machine:

### 1. Prerequisites

Ensure you have **Python 3.10+** installed:
```bash
python --version
```

### 2. Create a Virtual Environment

Isolate the dependencies by creating a python virtual environment inside the `backend` folder:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

Install the requirements using `pip`:

```bash
pip install -r requirements.txt
```

### 4. Database Migrations

Apply the standard migrations to configure the database schema:

```bash
python manage.py migrate
```

### 5. Start the Server

Start the Django local development server:

```bash
python manage.py runserver
```

The API will now be running at: **`http://127.0.0.1:8000/`** or **`http://localhost:8000/`**

---

## 🔐 Admin Panel Credentials

A default superuser account has been pre-created for your convenience to access the admin site immediately.

*   **Admin Dashboard URL**: `http://localhost:8000/admin`
*   **Username**: `admin`
*   **Password**: `adminpassword`

> [!TIP]
> You can change the admin password at any time by running:
> ```bash
> python manage.py changepassword admin
> ```

---

## 🔗 API Endpoint Reference

### 1. Create a Booking (Used by Frontend)

*   **URL**: `/api/bookings`
*   **Method**: `POST`
*   **Headers**: `Content-Type: application/json`
*   **Payload Example**:
    ```json
    {
      "full_name": "Hassan Al-Mansoori",
      "whatsapp_number": "+971 50 000 0000",
      "vehicle_model": "2022 BMW M4",
      "city": "Dubai Marina",
      "package": "Standard",
      "notes": "Preferred time: Saturday morning."
    }
    ```
*   **Success Response** (`201 Created`):
    ```json
    {
      "id": 1,
      "full_name": "Hassan Al-Mansoori",
      "whatsapp_number": "+971 50 000 0000",
      "vehicle_model": "2022 BMW M4",
      "city": "Dubai Marina",
      "package": "Standard",
      "notes": "Preferred time: Saturday morning.",
      "status": "Pending",
      "created_at": "2026-05-19T09:37:33Z",
      "updated_at": "2026-05-19T09:37:33Z"
    }
    ```

### 2. List All Bookings

*   **URL**: `/api/bookings`
*   **Method**: `GET`
*   **Success Response** (`200 OK`):
    Returns an array of all booked inspection requests.

---

## 🧪 Running Tests

Validate the application's integrity by running the test suite:

```bash
python manage.py test bookings
```
