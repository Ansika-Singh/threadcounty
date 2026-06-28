# ThreadCounty Python Backend

FastAPI backend for ThreadCounty with Supabase integration.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env     # fill in Supabase credentials
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | `/api/v1/auth` | Sign up, login, forgot password, logout |
| Users | `/api/v1/users` | Profile CRUD, account deletion |
| Uploads | `/api/v1/uploads` | Fabric image upload and management |
| Reports | `/api/v1/reports` | AI analysis reports (mock engine) |
| Dashboard | `/api/v1/dashboard` | User dashboard stats and activity |
| Admin | `/api/v1/admin` | User/report management and analytics |
| Contact | `/api/v1/contact` | Contact form submissions |

Interactive docs: `http://localhost:8000/docs`

## Deploy

Deploy to **Railway**, **Render**, or any Python host. Set environment variables from `.env.example`.
