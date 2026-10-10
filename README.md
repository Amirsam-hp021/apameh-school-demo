# Apameh English Academy: School Management Demo

A frontend-only demo of a management system for an English language school.
It runs entirely in the browser with **mock data** and **no backend**, in
**English and Farsi** (full right-to-left layout when Farsi is selected).

> Demo version. Sample data only.

## Run it

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check:i18n` | Verify every translation key used in the code exists in both `en.json` and `fa.json` |

## Demo accounts

There are no passwords. Click **Enter Demo** on the landing page, then pick a role.
You can also switch roles at any time from the user menu (top corner): **Demo: switch role**.

| Role | Name | What to look at |
|---|---|---|
| Super Admin | Maryam Karimi | Dashboard and revenue chart, Users, Classes, Payments (try **Pay**), Announcements, Audit Logs, Settings, Backups |
| Teacher | David Miller | Teaches *General English A1* and *General English A2*. Open a class for the Students, Materials, Assignments, Attendance, Grades and Forum tabs. **Grading** shows submissions to review. |
| Student | Sara Ahmadi | Enrolled in *General English A1* and *IELTS Prep B2*. Has an upcoming deadline, a late submission, a graded assignment and unread notifications. |
| Parent | Hamid Ahmadi | Parent of Sara Ahmadi. Read-only view of her grades, attendance and deadlines. |

Things worth trying in the demo:

- Switch to **فارسی**: the whole layout flips to RTL, the font changes to Vazirmatn, numbers use Persian digits and dates use the Persian (Solar Hijri) calendar.
- As the teacher, open **Grading → any submission** and type a score: the weighted final grade updates live.
- As the student, submit a file to *IELTS Writing Task 1* (past due, late allowed) to see the late warning, or pick a file that is too large or the wrong type to see validation.
- As the admin, use **Payments → Pay** to walk through the simulated payment flow.
- Use the global search in the top bar (for example "ielts" or "sara").
- Resize the window: the sidebar becomes a drawer and tables scroll sideways on phones.

All changes live in memory only. **Reloading the page resets the data and signs you out**, as required (no localStorage or sessionStorage).

## Tech stack

React 18 (Vite) · Tailwind CSS · React Router v6 · i18next + react-i18next · React Big Calendar · Recharts · lucide-react

## Project structure

```
src/
  api/             Mock API layer. The ONLY place that touches data.
    client.js      respond()/fail() helpers that simulate network latency
    db.js          In-memory copy of the mock data + shared lookups
    *.js           One module per resource (users, classes, payments, ...)
    index.js       Exposes everything as `api.<module>.<function>`
  data/mock.js     All sample data
  context/         AuthContext (demo login + role switch), LanguageContext (EN/FA + RTL),
                   ToastContext, NotificationContext (unread count)
  i18n/            en.json, fa.json and i18next setup
  components/      Layout, Sidebar, Topbar, Card, Table, Modal, Badge, ProgressBar,
                   EmptyState, Skeleton, LanguageSwitcher, GlobalSearch, ForumBoard, ...
  hooks/           useAsync (loading/error state for API calls), useDebounce
  pages/           public/, admin/, teacher/, student/, parent/, shared/
  routes/          ProtectedRoute (role check), navigation config per role
  utils/           Formatting (locale-aware numbers/dates), grade formula, file validation, schedules
scripts/
  check-i18n.mjs   Translation completeness check
```

## Connecting the real backend

Pages never import mock data. They only call functions from `src/api`, and every
function returns a Promise:

```js
import { api } from '../api';
const { items, total } = await api.users.list({ search, role, page, pageSize });
```

To connect the backend, re-implement each module in `src/api/` with Axios calls
**using the same function names, arguments and return shapes**. For example:

```js
// src/api/users.js
import http from './http'; // an Axios instance with baseURL and auth headers
export const list = (params) => http.get('/users', { params }).then((r) => r.data);
```

Then delete `src/api/db.js` and `src/data/mock.js`. No page needs to change.

Notes for the backend:

- Paginated lists return `{ items, total, page, pageSize }` (`users.list`, `audit.list`).
- Related records are embedded the way pages expect them, e.g. a submission includes `student`, `assignment` and `class` summaries. See each module for the exact shape.
- People have `nameEn` and `nameFa`. Content that should appear in both languages (announcements, notifications, assignment titles) uses `{ en, fa }` objects; a plain string also works.
- Dates are ISO 8601 strings. Attendance dates are `YYYY-MM-DD`.
- The weighted grade formula lives in `src/utils/grades.js` (missing components are left out and the remaining weights re-normalised, shown as "projected"). The backend should compute grades the same way so the numbers match.

## Mock features that are UI only

These parts look and behave real in the demo but are simulated. The backend
will need to implement them:

**Authentication and access**
- Real login (passwords, OTP or SSO), sessions/tokens, logout and password reset. The demo signs in by role with no credentials and forgets the session on reload.
- Server-side role and ownership checks for every endpoint (the demo only guards routes in the browser).
- The **Demo: switch role** menu should be removed in production.

**Data persistence**
- Everything: users, grades, attendance, assignments, submissions, forum posts, announcements, notification read state. The demo keeps changes in memory until reload.
- Admin **Settings** are editable but intentionally never saved.

**Files**
- Material uploads (the progress bar is simulated; only the file name, type and size are kept).
- Student assignment submissions (no file is actually uploaded).
- Server-side validation of file type and size (the browser checks are a convenience only), storage, and ideally virus scanning.
- File preview/download for materials, submissions, the bulk-import template and backups (all show a "demo" message).

**Payments**
- The **Pay** flow does not contact a gateway: the user picks success or failure. The backend needs real gateway integration (redirect, callback/IPN verification, receipts).
- Manual **Verify** of pending payments, and automatic expiry of unpaid invoices.

**Admin tools**
- **Bulk import** of users from CSV/XLSX (the file is accepted but not processed).
- **Backups**: create, download, restore and the automatic daily schedule are all simulated.
- **Audit logs** are static sample entries; the backend must record real actions with user and IP.
- Classes and weekly schedules are read-only sample data. There is no UI yet to create classes, enrol students, assign teachers or link parents to children.

**Notifications and messaging**
- Generating notifications (new grade, deadline reminders, new material, forum replies, announcements) and delivering them (in-app, email or SMS). The demo list is static apart from read/unread.
- Announcement delivery to the chosen audience.

**Logic that must live on the server**
- Late-submission detection, closing assignments after the due date, and blocking submissions when late work is not allowed.
- Weighted grade calculation using the weights from Settings.
- Global search, scoped to what each role may see.
- Dashboard aggregates (revenue per month, payment totals, attendance rates).
