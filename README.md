# 🎓 CampusShare Platform

> **A secure, peer-to-peer rental marketplace tailored for university communities.**

**CampusShare** is a modern full-stack web application designed to facilitate resource sharing among students. It provides a trusted environment where verified users can list items for rent, browse available inventory, and manage bookings seamlessly within their campus network.

## ✨ Key Features

- **🔐 Domain-Restricted Authentication**
  - Secure sign-in via Google OAuth (powered by NextAuth.js).
  - Access limited to specific university email domains (configurable via environment variables).
  - Comprehensive Role-Based Access Control (RBAC) ensuring secure user and admin roles.

- **📦 robust Item Management**
  - Intuitive interface for creating, editing, and deleting rental listings.
  - "Day-of-week" availability scheduling to manage when items are free.
  - Detailed item descriptions and status tracking.

- **📅 Smart Booking Workflow**
  - Full request lifecycle: **Pending → Accepted/Rejected**.
  - Real-time conflict detection prevents double bookings.
  - Automated status updates keep both owners and borrowers informed.

- **🔔 Integrated Notification System**
  - In-app alerts for new booking requests and status changes.
  - Centralized dashboard for managing incoming and outgoing requests.

- **📱 Modern & Responsive UI**
  - Built with **Next.js 16 (App Router)** and **Tailwind CSS**.
  - Mobile-first design featuring an app-like bottom navigation bar.
  - Polished components using **shadcn/ui** for a premium look and feel.

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (React 19) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) / [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/)) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (Google Provider) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) |
| **Validation** | [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/) |
| **Testing** | [Playwright](https://playwright.dev/) (End-to-End) |

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A Google Cloud Console project (for OAuth credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/campus-share-platform.git
   cd campus-share-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   # Database (Default: SQLite for dev, PostgreSQL for prod)
   DATABASE_URL="file:./dev.db"

   # Authentication (NextAuth.js)
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Access Control
   ALLOWED_DOMAIN="university.edu" # Restrict login to this domain
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📂 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router pages & layouts
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions & configuration
│   ├── types/               # TypeScript type definitions
│   └── middleware.ts        # Auth & Route protection
├── prisma/                  # Database schema & migrations
├── public/                  # Static assets
└── tests/                   # Playwright E2E tests
```

## 🧪 Running Tests

This project uses **Playwright** for end-to-end testing to ensure platform stability.

```bash
# Run all tests headlessly
npx playwright test

# Run tests in UI mode
npx playwright test --ui
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Built with ❤️ by Vamshi Krishna && Upendra
