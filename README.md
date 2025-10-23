# EL-Bayader — Vite + React + TypeScript + Tailwind

Instructions to run locally:

1. Install dependencies

   npm install

2. Start dev server

   npm run dev

Notes:
- This project includes Tailwind configuration with the bakery color tokens.
- Place your images in `src/assets/` with the filenames listed in that folder.
- The UI uses small Magic-UI-like wrappers implemented in `src/components/ui`.

To quickly populate sample images for the homepage, run the helper PowerShell script:

From project root (PowerShell):

   .\scripts\download-images.ps1

This downloads royalty-free placeholder images from Unsplash into `src/assets/`.
