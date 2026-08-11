---
name: Nested frontend packages
description: This repository keeps the runnable Vite app and its package manifest under frontend/.
---

Language packages for the web app must be installed with the frontend package as the working directory or prefix. Installing from the repository root can create unrelated root manifest and lockfile changes.

**Why:** The imported repository contains a separate Laravel backend and React frontend, and the root package files are not the Vite app's dependency boundary.

**How to apply:** Before changing frontend dependencies, inspect the package manifest location and install using `npm --prefix frontend` or an equivalent frontend working directory.