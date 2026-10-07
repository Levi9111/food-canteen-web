# BAF RTS Food Canteen Web Application

A mission-critical tactical web ledger for the **Bangladesh Air Force Recruits Training School (BAF RTS)** Food Canteen System. Built with **React 19**, **Vite**, **TypeScript**, **@tanstack/react-query**, and **Vanilla CSS** styling tokens.

---

## 🛩️ Military & Operational Overview

The web application provides full feature parity with the RTS Mobile Flutter application, designed to manage high-volume daily messing and financial accounts for recruits and permanent staff (P-Staff) personnel.

### Key Tactical Features (Mobile Parity)

1. **High Contrast Duty Interface**: Full dark and light theme toggle with HSL military tokens tailored for rapid nighttime or bright sunlight entries.
2. **Price-Only Rapid Expense Entry**: Zero unnecessary food item or particulars inputs during daily ledger updates—pure financial price logging.
3. **Built-in Expression Calculator**: Additive evaluation modal (e.g. `55+20+50` = `125৳`) auto-populating expense dialogs without external apps.
4. **Empty Search Quick Enrollment**: Instant `+ ADD PARTICULAR` trigger when searching unknown BD No / Name.
5. **Random Payment Deposits & Net Effective Bill**: Itemized payments deducted from gross expenses with pre-dues carry-forward (`Gross + PreDue - Payments = Effective Due`).
6. **Strict Domain Terminology**: Zero references to "items consumed"—exclusively financial ledger entries, prices, and receipts.
7. **Direct High-Resolution PDF Downloads**: Native direct downloads (`doc.save()`) using jsPDF without launching browser print dialogs.
8. **Recruits Intake Batches in Database**: Full lifecycle management of training entries (e.g., Entry 54, 55).
9. **Barrack Squadrons & Rooms in Database**: Allocation for Sadruddin, Liakot Ali, Nurul Haque, Mansur Ali, and customizable rooms.
10. **Strict Military Operator Governance**:
    - Roles restricted strictly to **NCOIC** and **JCOIC**.
    - Maximum occupancy rule: Dual limit (1 NCOIC & 1 JCOIC max, HTTP 409 rejection on duplicate).
    - Mutual counterpart-only revocation: NCOIC removes JCOIC, JCOIC removes NCOIC; self-revocation strictly blocked.
11. **P-Staff Public Self-Service Portal**: Direct lookup by BD No allowing staff to view their ledger and statement.
12. **Copiable Admin Payment Channels**: Instant one-click copy buttons for NCOIC bKash, Trust Bank Base Branch A/C, and WhatsApp hotline.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript (Strict)
- **Bundler**: Vite 8
- **Server State & Caching**: `@tanstack/react-query`
- **Icons**: `lucide-react`
- **PDF Generation**: `jspdf` + `jspdf-autotable`
- **HTTP Client**: `axios` with JWT Bearer interceptor
- **Styling**: Vanilla CSS Design System (`src/index.css`)

---

## 🚀 Running Locally

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

## 📂 Architecture & Directory Layout

```
food-canteen-web/
├── public/                 # BAF crest and logos
├── src/
│   ├── api/                # Axios client & REST services
│   ├── components/
│   │   ├── Header.tsx                     # Masthead with duty indicator
│   │   ├── AdminContactModal.tsx          # Copiable payment credentials
│   │   ├── CalculatorModal.tsx            # Built-in math calculator
│   │   ├── RecruitsCanteen/
│   │   │   ├── DailyRoomGrid.tsx          # Barrack room cards & modal
│   │   │   └── MonthlyMatrixView.tsx      # 31-day horizontal matrix
│   │   ├── PStaffCanteen/
│   │   │   ├── StaffDailyEntry.tsx        # BD search & expense entry
│   │   │   ├── AddParticularModal.tsx     # Quick personnel enrollment
│   │   │   ├── PaymentDepositModal.tsx    # Random payment modal
│   │   │   └── StaffStatementView.tsx     # Itemized statement view
│   │   ├── MonthlyAudit/
│   │   │   └── AuditDashboard.tsx         # Consolidated audit breakdown
│   │   ├── Settings/
│   │   │   ├── OperatorAuthManagement.tsx # Military NCOIC/JCOIC rules
│   │   │   └── StructureManagement.tsx    # Batches, squadrons, rooms
│   │   └── PublicPortal/
│   │       └── StaffPublicLookup.tsx      # Public BD No self-service
│   ├── constants/          # Ranks, squadrons, rooms, admin contacts
│   ├── hooks/              # TanStack Query custom hooks
│   ├── tests/              # Automated domain unit tests
│   ├── types/              # Domain interfaces and military types
│   ├── utils/              # Modular PDF engines & rule validators
│   ├── App.tsx             # Main application layout & 8 navigation tabs
│   ├── index.css           # Vanilla CSS military design system
│   └── main.tsx            # React application entry point
```
