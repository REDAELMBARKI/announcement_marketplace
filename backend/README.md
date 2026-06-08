# Announcements Marketplace - Backend 🚀

The core API for Announcements Marketplace, a hybrid platform for both donations and local selling, built with Laravel 12.

## 🏗️ Architecture

This backend follows a strict layered architecture to ensure clean code and easy testing, supporting both commerce and social impact workflows:

- **Controllers:** Handle HTTP requests and delegate logic to Actions.
- **Actions:** Encapsulate a single business process (e.g., `StoreProductAction`, `HandleDonationAction`).
- **Services:** Manage complex business logic and orchestrate repositories.
- **Repositories:** Abstract data access using Eloquent models.
- **DTOs:** Standardize data flow between layers.
- **Resources:** Transform models into JSON API responses.

## 🛠️ Tech Stack

- **PHP 8.2+**
- **Laravel 12**
- **Laravel Reverb** (WebSockets for real-time buyer/seller/donor chat)
- **Laravel Sanctum** (Auth)
- **OpenAI PHP** (AI features for smart listings)
- **SQLite** (Database)

## 🚦 Setup

1. Install dependencies:
   ```bash
   composer install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
3. Run migrations and seed data:
   ```bash
   php artisan migrate --seed
   ```
4. Start the server:
   ```bash
   php artisan serve
   ```

## 🧪 Testing

Run the test suite:
```bash
php artisan test
```
