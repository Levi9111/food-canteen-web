# BAF RTS Food Canteen Web Application

[![Web CI](https://github.com/Levi9111/food-canteen-web/actions/workflows/web_ci.yml/badge.svg)](https://github.com/Levi9111/food-canteen-web/actions/workflows/web_ci.yml)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)
![License](https://img.shields.io/badge/License-Proprietary-red.svg)

Tactical web ledger and financial management portal for the **Bangladesh Air Force Recruits Training School (BAF RTS)** Food Canteen System. Built with **React 19**, **Vite**, **TypeScript**, **@tanstack/react-query**, and military **Vanilla CSS** tokens.

---

## 🛩️ Military & Operational Overview

Provides feature parity with the RTS Mobile Flutter application, designed to manage high-volume daily messing and financial accounts for recruits and permanent staff (P-Staff) personnel.

### Key Capabilities

1. **Dedicated Settings Architecture & Sub-Pages**:
   - **Unified Settings Hub**: Centralized configuration cockpit providing dedicated navigation tiles into specialized sub-screens.
   - **Squadron & Barracks Directory**: Standalone page for managing recruit intake batches, inspecting tactical squadrons, and configuring dynamic room allocations.
   - **Duty Personnel Appointments**: Standalone page for managing active duty personnel, rank assignments, and access control.
2. **Dynamic Squadron Management & Historical Ledger Cascade**:
   - **Squadron Renaming with Cascade**: Renaming a squadron (e.g. Sadruddin -> Bir Sreshtho Matiur Rahman) automatically updates all historical recruit expense entries, pre-dues, and closing statements across all intake batches without data loss.
   - **Dynamic Barrack Room Allocation**: Safe room additions and deletions with duplicate prevention and minimum allocation enforcement.
3. **Strict Military Safeguards & Action Warnings**:
   - Reusable `StrictWarningModal` displaying high-consequence operational impact analyses.
   - Mandatory typed confirmation tokens (`CONFIRM`, `DELETE`, `RELIEVE`) preventing accidental deletions or renames.
   - Strict privilege delegation warnings when enrolling operators and immediate credential invalidation upon relieving duty personnel.
4. **Permanent Staff (P-Staff) 31-Day Monthly Matrix**:
   - Comprehensive office/branch filtered monthly ledger with all 31 days.
   - **Direct PDF Download**: High-resolution landscape A3/A4 audit matrix downloaded directly to device (`doc.save()`) with official 4-tier signature blocks.
   - **Flawless Dark Mode Support**: High-contrast input controls, date/month pickers, and table surfaces with zero invisible text or blinding white boxes.
5. **Upgraded Tactical Cockpit Calculator**:
   - Aerospace cockpit bezel design with OLED display, live mathematical formula, and luminous amber totals.
   - Rapid sales preset chips (`+10`, `+20`, `+50`, `+100`) and tactile squircle keys.
6. **Recruit Training Squadron (RTS) Canteen**:
   - Flight & Room grid daily entry and monthly matrix ledger with direct PDF download.
7. **Staff Self-Service Portal**:
   - BD Number lookup allowing personnel to verify their ledger balance, previous dues, and payment records.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (Strict)
- **Bundler**: Vite 8
- **Server State & Caching**: `@tanstack/react-query`
- **Icons**: `lucide-react`
- **PDF Generation**: `jspdf` + `jspdf-autotable`
- **Styling**: Vanilla CSS Design System (`src/index.css`)

---

## 🚀 Local Development & Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run static checks (Oxlint)
npm run lint

# Run automated domain unit tests
npm test

# Build production bundle
npm run build
```

---

## 👥 Duty Personnel

- **NCOIC**: Cpl Shanjid Ahmad (`BD/472770`) - Trade: E&I Fitter
- **Supervision**: Recruit Training Squadron (RTS), Bangladesh Air Force
