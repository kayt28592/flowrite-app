# FLOWRITE Architecture 2.0 (Premium SaaS)

## 1. Folder Structure

```
src/
├── api/             # API services and data fetching (React Query)
│   ├── api.js       # Base API configuration
│   ├── auth.js      # Auth-related endpoints (Login/Register)
│   ├── submissions.js # Submissions API
│   ├── customers.js # Customers API
│   ├── items.js     # Items API
│   └── dockets.js   # Dockets API
├── components/      # React components
│   ├── ui/          # Reusable UI components (Buttons, Inputs, Cards)
│   ├── layout/      # Layout components (Sidebar, TopBar, DashboardLayout)
│   ├── forms/       # Form components (SubmissionForm, CustomerForm)
│   └── shared/      # Shared components (Modals, Tables, Charts)
├── hooks/           # Custom React hooks
│   ├── useAuth.js   # Authentication hook (Zustand replacement?)
│   ├── useTheme.js  # Theme management (Dark Mode)
│   └── useSort.js   # Data sorting logic
├── pages/           # Application pages
│   ├── admin/       # Admin-specific pages (Dashboard, Settings)
│   ├── public/      # Public-facing pages (Landing, Login, Register)
│   └── employee/    # Employee-specific pages (Submissions, Tasks)
├── stores/          # Zustand stores for global state
│   ├── useAuthStore.js # Auth state
│   └── useUIStore.js   # UI state (Sidebar open/close, Modals)
├── utils/           # Helper functions and utilities
│   ├── format.js    # Formatting utilities (Date, Currency)
│   └── api-error.js # API error handling
├── App.jsx          # Main application component with routing
├── index.css        # Global styles (Tailwind CSS)
└── main.jsx         # Application entry point
```

## 2. Tech Stack Setup

### Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Modern, scalable icon set.
- **Framer Motion**: Animation library for smooth transitions.
- **Class Variance Authority (CVA)**: For creating reusable component variants.
- **clsx / tailwind-merge**: For combining conditional styles cleanly.

### State Management
- **Zustand**: Lightweight global state management (replaces complex Context/Redux).
- **React Query**: For server state management (caching, loading, error handling).

### Forms
- **React Hook Form**: Performant form handling.
- **Zod**: Schema validation for safe data entry.

## 3. Implementation Steps

1.  **Foundation**: Update `tailwind.config.js` and `index.css`.
2.  **Core UI**: Build reusable components (`Button`, `Card`, `Input`, `Select`, `Modal`).
3.  **Layout**: Create `DashboardLayout` with responsive Sidebar.
4.  **Pages**: Refactor pages one by one to use new components and layout.
5.  **Data**: Refactor API calls to use React Query hooks.
