# SprintFlow — Sprint Task & Hours Tracker

A full-stack sprint tracker: create custom-length sprints, add daily tasks,
log hours against them, and see weekly progress as a segmented ring (one arc
per day of the sprint). Multiple team members can sign up and log in.

- **Frontend:** React + Vite
- **Backend:** Spring Boot (Java 17) + Spring Security (JWT) + JPA
- **Database:** PostgreSQL (designed for a hosted, browser-based instance like [Neon](https://neon.tech))

## Requirements

- **Java 17+** ([Adoptium Temurin](https://adoptium.net) is a good free distribution)
- **Maven** (or use the included setup below if you don't have it)
- **Node.js 20.19+ or 22.12+**
- A PostgreSQL database — either hosted (Neon/Supabase, no install) or local

---

## 1. Set up your PostgreSQL database (Neon — no local install)

1. Go to **https://neon.tech** → sign up (GitHub login works)
2. Click **Create a project** → name it `sprintflow`
3. On the project dashboard, find **Connection string** — it looks like:
   ```
   postgresql://neondb_owner:AbCdEf123@ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. From that string, note down:
   - **Host:** `ep-cool-name-12345.ap-southeast-1.aws.neon.tech`
   - **Database name:** `neondb` (or whatever's after the last `/`)
   - **Username:** `neondb_owner`
   - **Password:** the part after the colon before `@`

You'll use these in Step 2 below. Neon's dashboard also has a **SQL Editor** tab if you ever want to query the database directly in your browser.

## 2. Configure and run the backend

Open a terminal:

```bash
cd sprintflow/backend
```

Set these environment variables (replace with your actual Neon values):

**PowerShell:**
```powershell
$env:DB_URL = "jdbc:postgresql://ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
$env:DB_USER = "neondb_owner"
$env:DB_PASSWORD = "AbCdEf123"
$env:JWT_SECRET = "a-long-random-string-at-least-32-characters-change-this"
$env:CORS_ORIGIN = "http://localhost:5173"
```

**macOS/Linux:**
```bash
export DB_URL="jdbc:postgresql://ep-cool-name-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
export DB_USER="neondb_owner"
export DB_PASSWORD="AbCdEf123"
export JWT_SECRET="a-long-random-string-at-least-32-characters-change-this"
export CORS_ORIGIN="http://localhost:5173"
```

Then run:

```bash
mvn spring-boot:run
```

First run will create all tables automatically (via `ddl-auto: update`). You should see:
```
Tomcat started on port 8080
```

**Don't have Maven installed?** If `mvn` isn't recognized, either:
- Install it from https://maven.apache.org/download.cgi, or
- Use the Maven Wrapper if present (`./mvnw spring-boot:run` / `mvnw.cmd spring-boot:run`), or
- Open the project in **IntelliJ IDEA** (free Community edition) or **VS Code with the Java extension pack** — both bundle Maven and can run it with one click

## 3. Run the frontend

Open a **second** terminal:

```bash
cd sprintflow/frontend
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

## 4. Use the app

1. **Register** — the first account created automatically becomes ADMIN, everyone else is a MEMBER
2. **Create a sprint** — give it a name and a custom start/end date range
3. **Add tasks** — pick a date within the sprint and an estimated number of hours
4. **Log hours** — as you work, add hours against each task
5. **Update status** — To do → In progress → Done (or Blocked)
6. Watch the **progress ring** fill in, segment by segment, one arc per day of the sprint

---

## Project structure

```
sprintflow/
├── backend/
│   └── src/main/java/com/sprintflow/
│       ├── model/         # User, Sprint, Task, Role, TaskStatus
│       ├── repository/    # Spring Data JPA repositories
│       ├── dto/            # Request/response objects
│       ├── service/        # Business logic
│       ├── controller/     # REST endpoints
│       ├── security/       # JWT generation + auth filter
│       └── config/         # Spring Security + CORS + error handling
└── frontend/
    └── src/
        ├── pages/           # Login, Register, Dashboard, SprintBoard
        ├── components/      # Layout, ProgressRing, ProtectedRoute
        ├── context/         # AuthContext (JWT + current user)
        └── api/client.js    # fetch wrapper with auth header
```

## API reference

| Method | Route                        | Auth required | Description                     |
|--------|-------------------------------|----------------|-----------------------------------|
| POST   | `/api/auth/register`          | No             | Create an account                 |
| POST   | `/api/auth/login`             | No             | Log in, returns a JWT             |
| GET    | `/api/sprints`                | Yes            | List all sprints with progress    |
| POST   | `/api/sprints`                | Yes            | Create a sprint                   |
| GET    | `/api/sprints/{id}`           | Yes            | Get one sprint                    |
| GET    | `/api/tasks?sprintId=`        | Yes            | List tasks for a sprint           |
| POST   | `/api/tasks`                  | Yes            | Create a task                      |
| PATCH  | `/api/tasks/{id}`             | Yes            | Update a task (status, hours, etc)|
| POST   | `/api/tasks/{id}/log-hours`   | Yes            | Add logged hours to a task        |
| DELETE | `/api/tasks/{id}`             | Yes            | Delete a task                      |

All authenticated requests need `Authorization: Bearer <token>`.

## Deploying to production

The same pattern as before works here too:
- **Backend:** deploy to Render as a "Web Service" — set **Build Command** to `cd backend && mvn clean package -DskipTests`, **Start Command** to `java -jar backend/target/sprintflow-backend-1.0.0.jar`, and set the `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGIN` environment variables in Render's dashboard (pointing `CORS_ORIGIN` at your deployed frontend URL).
- **Frontend:** deploy to Render/Vercel/Netlify as a static site — set the build command to `npm install && npm run build`, publish directory `dist`, and update the API base URL if the frontend and backend aren't on the same domain.

## A note on this build

The React frontend was fully installed, built, and dev-server tested. The Spring Boot backend could not be compiled in this sandbox (no access to Maven Central), so run `mvn spring-boot:run` locally as your first build/test of that half — if you hit a compile error, paste it back and it can be fixed directly.
