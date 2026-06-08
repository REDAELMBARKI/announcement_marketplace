# Announcements Marketplace 🌍🤝

Empowering communities through circular giving and local commerce. Announcements Marketplace is a comprehensive platform designed to bridge the gap between donors, sellers, charities, and buyers, ensuring that every transaction—whether a donation or a sale—creates a positive experience.

---

## 🚀 The Vision

Announcements Marketplace is a versatile ecosystem for both social impact and local trade. By facilitating the listing of items for sale or donation, we provide a transparent and secure platform that encourages a culture of sustainability and community support.

### Key Pillars
- **Versatility:** Seamlessly switch between selling items for profit or donating them for impact.
- **Transparency:** Track the journey of donated items or manage sales with ease.
- **Efficiency:** Streamlined workflows for users to list items and for charities to manage distributions.
- **Community:** A secure marketplace for local giving, buying, and peer-to-peer support.
- **Intelligence:** Leveraging AI to enhance listing quality and platform safety.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React](https://reactjs.org/) (TypeScript)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** CSS3 (Modular & Global)
- **State Management:** React Context API
- **Icons:** Lucide React

### Backend
- **Framework:** [Laravel 12](https://laravel.com/) (PHP 8.2+)
- **Real-time:** [Laravel Reverb](https://reverb.laravel.com/) (WebSockets)
- **Authentication:** [Laravel Sanctum](https://laravel.com/docs/sanctum)
- **AI Integration:** [OpenAI PHP](https://github.com/openai-php/laravel)
- **API Documentation:** Ziggy (Route sharing)

### Infrastructure & Database
- **Database:** SQLite (Optimized for local & rapid development)
- **Containerization:** Docker (Nginx, PHP-FPM)
- **Reverse Proxy:** Nginx

---

## 🏗️ Architecture & Design Patterns

The project follows a robust, enterprise-grade architecture to ensure maintainability and scalability.

### Backend Patterns
- **Action Pattern:** Encapsulates business logic into single-responsibility classes (e.g., `GetHomepageDataAction`).
- **Service Layer:** Houses complex business logic, keeping controllers thin.
- **Repository Pattern:** Decouples the application from the data access layer using interfaces.
- **DTO (Data Transfer Objects):** Ensures type-safe data flow between application layers.
- **Observer Pattern:** Automatically handles side effects like logging engagement or updating counts.
- **Event-Driven:** Uses Laravel Events and Listeners for decoupled, real-time updates.

### Frontend Patterns
- **Component-Based UI:** Highly reusable components organized by domain (Admin, Charity, User).
- **Service-Oriented API:** Centralized API logic in dedicated service files.
- **Type Safety:** Comprehensive TypeScript interfaces for all data structures.

---

## ✨ Core Features

### 🛒 Hybrid Marketplace
A user-friendly interface for browsing, searching, and offering items for **sale** or **donation**. Includes advanced filtering by category, city, price, and tags.

### 📊 Dashboards & Impact
- **Users:** Manage your listings, track sales, and see your "Impact Score" for donations.
- **Charities:** Track distribution metrics, inventory levels, and community reach for donated goods.
- **Admins:** High-level overview of platform health, transaction trends, and moderation.

### 💬 Real-time Communication
Integrated chat system powered by Laravel Reverb, allowing buyers, sellers, and donors to coordinate safely.

### 🤖 AI Assistance
Integrated OpenAI capabilities for content moderation, smart listing suggestions, and automated FAQ support.

---

## 📂 Project Structure

```text
.
├── backend/            # Laravel 12 API
│   ├── app/            # Core logic (Actions, DTOs, Services, Repositories)
│   ├── database/       # Migrations and Seeders
│   └── routes/         # API and Web routes
├── frontend/           # React + Vite Application
│   ├── src/            # Components, Pages, and Services
│   └── public/         # Static assets
├── nginx/              # Nginx configuration
└── compose.yaml        # Docker orchestration
```

---

## 🚦 Getting Started

### Prerequisites
- PHP 8.2+ & Composer
- Node.js & npm
- Docker (optional)

### Setup
1. **Clone the repository**
2. **Backend Setup:**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan serve
   ```
3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📄 License

This project is licensed under the MIT License.
