# Announcements Marketplace - Frontend 🎨

The interactive user interface for Announcements Marketplace, a hybrid platform for local selling and circular giving, built with React and TypeScript.

## 🏗️ Structure

The frontend is organized by domain and feature to support both commerce and donation workflows:

- **src/assets/components:** Domain-specific UI components (Admin, Charity, User, Marketplace).
- **src/components:** Shared UI components and complex modules like the Impact & Sales Dashboard.
- **src/context:** Global state management using React Context (e.g., Theme).
- **src/services:** API communication layer.
- **src/types:** TypeScript interfaces and type definitions.
- **src/css:** Feature-specific styling.

## 🛠️ Tech Stack

- **React 18+**
- **TypeScript**
- **Vite** (Build tool)
- **Lucide React** (Icons)
- **CSS3** (Modular styling)

## 🚦 Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## ✨ Key Interfaces

- **Hybrid Marketplace:** Comprehensive discovery for items to buy or receive as donations.
- **Impact & Sales Dashboard:** Data visualization for both social contributions and local trade.
- **Chat Interface:** Real-time coordination between buyers, sellers, and donors.
- **Admin/Charity Portals:** Role-specific management tools for marketplace health and donation distribution.
