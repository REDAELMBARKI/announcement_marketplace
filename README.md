## LetUsDonate.uk

A smart clothes donation platform that helps donors, charity staff, and administrators manage clothing collection, approval, categorisation, and sustainability insights.

This project was developed for a university project and demonstrates modern full-stack development using React + Vite, Laravel, and SQLite.

===============================================================================

## Features

-- Donors can log and view their donations .

-- Charity staff can approve/decline donations and manage inventory.

-- Administrators oversee accounts, analytics, and sustainability metrics.

-- Dashboards tailored to each role.

-- Analytics: CO₂ saving, charities supported

-- AI chatbot

-- Responsive design (desktop + mobile).

===============================================================================

## Tech Stack

-- Frontend: React.js + Vite

-- Backend: PHP + Laravel

-- Database: SQLite

-- Version Control: Git + GitHub

-- Tools: VS Code + Prettier (npx prettier . --write)

-- Methodology: Agile (Scrum)

===============================================================================

## Set Up

-- Open Visual Studio Code

-- git clone https://github.com/dyzzie0/LetUsDonate.uk2

Frontend (React)

-- cd frontend
-- npm install
-- npm run dev
-- open [localhost:](http://localhost:5173/)

Backend (Laravel)

-- cd backend
-- composer install
-- cp .env.example .env
-- php artisan key:generate
-- php artisan serve

Configure SQLite in .env:

-- DB_DATABASE=sqlite/Clothing_Donations.db
-- DB_USERNAME=root
-- DB_PASSWORD=

===============================================================================

## Project Structure

LetUsDonate.uk/
│
├── let-us-donate-uk/ # React frontend
│ └── dist/ # Build output copied to Laravel
│
└── backend/ # Laravel backend (API)
├── public/ # Hosts React build files
├── routes/ # API + web routes
└── app/ # Controllers, Models, etc.

===============================================================================

## Developers

-- @dyzzie0
-- @Theo-Asamp
-- @ZarkaHussain
-- @lk34567

===============================================================================
