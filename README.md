# CampusShare Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

> **A secure, peer-to-peer rental marketplace tailored for university communities.**

---

## 📖 Architecture Overview

**How it Works**

CampusShare is built as a monolithic Full-Stack application using the **Next.js App Router**. It leverages a serverless-friendly architecture where:
1.  **Frontend**: React components (Client & Server) render the UI using **Tailwind CSS** for styling and **shadcn/ui** for accessible primitives.
2.  **Backend**: Next.js API Routes (`/api/*`) handle business logic, interfacing with the database via **Prisma ORM**.
3.  **Authentication**: **NextAuth.js** manages secure sessions, utilizing Google OAuth and restricting access to specific university email domains.
4.  **Database**: Data is persisted in **PostgreSQL** (production) or **SQLite** (development), managed through Prisma schema definitions.

---

## 🛠️ Tech Stack

### Core
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
-   **Runtime**: [Node.js](https://nodejs.org/)

### Backend & Database
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Database**: PostgreSQL / SQLite
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/)

### Frontend & UI
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)

### Utilities & Testing
-   **Validation**: [Zod](https://zod.dev/)
-   **Forms**: [React Hook Form](https://react-hook-form.com/)
-   **Testing**: [Playwright](https://playwright.dev/)

---

## 🚀 Quick Start

Follow these instructions to set up the project locally.

### Prerequisites
-   Node.js 18.17 or later
-   npm, yarn, or pnpm
-   Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Start-Up-Glitch/campus-share-platform.git
    cd campus-share-platform
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="super-secret-secret"
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"
    ALLOWED_DOMAIN="university.edu"
    ```

4.  **Initialize Database**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

---

## 💡 Usage Examples

### Running Development Server
Start the local development server with hot-reloading:
```bash
npm run dev
```

### Building for Production
Create an optimized production build:
```bash
npm run build
npm start
```

### Database Management
Open the Prisma Studio GUI to inspect and manage database records:
```bash
npx prisma studio
```

---

## 📂 Project Structure

```
├── src/
│   ├── app/                 # App Router pages & API routes
│   │   ├── api/             # Backend API endpoints
│   │   ├── (auth)/          # Authentication pages
│   │   └── dashboard/       # Protected user dashboard
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI primitives
│   │   └── layout/          # Layout components (Nav, Footer)
│   ├── lib/                 # Utilities (DB connection, Auth config)
│   └── types/               # TypeScript definitions
├── prisma/                  # Database schema & migrations
├── public/                  # Static assets (images, fonts)
└── tests/                   # E2E tests with Playwright
```

---

## 🔌 API Reference

Key endpoints available in the application:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/items` | List all available rental items | ❌ |
| `POST` | `/api/items` | Create a new rental listing | ✅ |
| `POST` | `/api/bookings` | Request to book an item | ✅ |
| `GET` | `/api/bookings` | Fetch user's incoming/outgoing bookings | ✅ |
| `GET` | `/api/notifications` | Retrieve user notifications | ✅ |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by Vamshi Krishna && Upendra
