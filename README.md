# SupplierHub — Open Source Repository

> **Hybrid Haversine-SAW and Generative AI for B2B MSME Partner Discovery Mobile Application**
>


---

## Abstract

SupplierHub is a mobile application designed to streamline the business partner discovery process for Micro, Small, and Medium Enterprises (MSMEs) in Indonesia. The system integrates a **Haversine-SAW** (Simple Additive Weighting) hybrid algorithm for geospatial multi-criteria decision-making with **Google Gemini 2.0** generative AI for automated B2B proposal generation, deployed on a **React Native** (Expo) frontend and **Node.js** REST API backend.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│               📱 MOBILE APP (Frontend)               │
│  React Native (TypeScript) + Expo SDK 54            │
│  ├── Google Places Autocomplete (Location Search)   │
│  ├── Haversine + SAW Algorithm (Client-side)        │
│  └── Firebase Auth + Firestore (User Data)          │
├─────────────────────────────────────────────────────┤
│               ⚙️  BACKEND SERVER                     │
│  Node.js + Express.js REST API                      │
│  ├── POST /api/recommendations                      │
│  │   └── Google Places API → Haversine → SAW        │
│  └── POST /api/generate-proposal                    │
│       └── Google Gemini 2.0 Flash (NLG)             │
├─────────────────────────────────────────────────────┤
│               ☁️  CLOUD SERVICES                     │
│  Google Places API (New) · Gemini AI · Firebase     │
└─────────────────────────────────────────────────────┘
```

## Repository Structure

```
Supplier Mobile App/
├── SupplierMobileApp-RN/     # Mobile app (React Native / Expo)
│   ├── src/
│   │   ├── screens/          # UI screens (Auth + App)
│   │   ├── context/          # AppContext (state management)
│   │   ├── hooks/            # Custom hooks (useProducts)
│   │   ├── lib/              # Firebase configuration
│   │   ├── data/             # Mock data for offline mode
│   │   └── utils/            # Haversine & SAW algorithms
│   ├── .env.example          # ⬅ Template environment variables
│   └── package.json
├── backend/                  # Node.js REST API server
│   ├── index.js              # API endpoints + algorithms
│   ├── .env.example          # ⬅ Template environment variables
│   └── package.json
├── data/                     # 📊 Open research data (CSV)
│   ├── sus_survey_results.csv
│   ├── saw_computation_sample.csv
│   ├── blackbox_testing_results.csv
│   └── README.md
└── README.md                 # This file
```

## Key Algorithms

### 1. Haversine Formula (Geospatial Distance)

Calculates the great-circle distance between two coordinate points on Earth's surface:

```
a = sin²(Δlat/2) + cos(lat₁) · cos(lat₂) · sin²(Δlon/2)
c = 2 · atan2(√a, √(1−a))
d = R · c  (where R = 6,371 km)
```

Implementation: [`SupplierMobileApp-RN/src/utils/algorithms.ts`](SupplierMobileApp-RN/src/utils/algorithms.ts) and [`backend/index.js`](backend/index.js)

### 2. SAW (Simple Additive Weighting)

Multi-criteria decision-making method for partner ranking:

| Criteria | Weight | Type |
|----------|--------|------|
| C1 — Distance (Haversine) | 0.6 (60%) | Cost (lower is better) |
| C2 — Rating (Google Places) | 0.4 (40%) | Benefit (higher is better) |

Normalization:
- **Cost criterion:** `r_ij = min(C_j) / x_ij`
- **Benefit criterion:** `r_ij = x_ij / max(C_j)`
- **Final score:** `V_i = Σ(W_j × r_ij) × 100`

### 3. Generative AI (Google Gemini 2.0)

Automated B2B proposal generation using parametric prompt injection — supplier profile, partner metadata, and product catalog are injected into a structured prompt template for natural language generation.

## Setup & Reproduction

### Prerequisites

- Node.js ≥ 18.x
- npm or yarn
- Expo CLI (`npx expo`)
- Android/iOS emulator or physical device
- API keys (see below)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/SupplierHub.git
cd SupplierHub
```

### Step 2: Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your API keys:
#   GOOGLE_PLACES_API_KEY=your_key_here
#   GEMINI_API_KEY=your_key_here
```

**Mobile App:**
```bash
cd SupplierMobileApp-RN
cp .env.example .env
# Edit .env and add your API key:
#   EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
```

### Step 3: Install Dependencies & Run

```bash
# Backend
cd backend
npm install
npm run dev        # Server at http://localhost:3000

# Mobile App (in a separate terminal)
cd SupplierMobileApp-RN
npm install
npx expo start     # Scan QR code with Expo Go
```

> **Note:** The application includes mock data fallback for offline/demo mode when API keys are not configured.

## Evaluation Results

### System Usability Scale (SUS) — N=24

| Metric | Value |
|--------|-------|
| SUS Score | **84.40** |
| Grade | **B** (Excellent) |
| Acceptability | **Acceptable** |

### Black-Box Testing — 15 Scenarios

| Segment | Test Cases | Pass Rate |
|---------|------------|-----------|
| A: Authentication | 4 | 100% |
| B: Algorithm & Geospatial | 4 | 100% |
| C: AI/LLM Integration | 3 | 100% |
| D: CRUD & General | 4 | 100% |
| **Total** | **15** | **100%** |

Full datasets available in the [`data/`](data/) directory.

## Data Availability Statement

The source code and evaluation datasets supporting the findings of this study are openly available in this GitHub repository. Raw survey data (SUS, N=24), SAW computation outputs, and black-box testing results are provided in CSV format under the `data/` directory.

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Mobile Framework | React Native (Expo) | SDK 54 |
| Language | TypeScript | 5.9 |
| Backend | Node.js + Express.js | 5.x |
| Database | Firebase Firestore | - |
| Authentication | Firebase Auth | - |
| Maps & Location | Google Places API (New) | v1 |
| Generative AI | Google Gemini 2.0 Flash | - |
| State Management | React Context + AsyncStorage | - |

## License

This project is provided for **academic and research purposes**. Source code is available under the [MIT License](LICENSE). Research datasets in the `data/` directory are provided under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Citation

If you use this software or data in your research, please cite:

```
@inproceedings{supplierhub2026,
  title={SupplierHub: Hybrid Haversine-SAW and Generative AI for B2B MSME Partner Discovery},
  booktitle={Procedia Computer Science — 11th ICCSCI},
  year={2026},
  publisher={Elsevier}
}
```

## Acknowledgements

- [React Native](https://reactnative.dev/) — MIT License
- [Expo](https://expo.dev/) — MIT License
- [Firebase](https://firebase.google.com/) — Google
- [Google Gemini AI](https://ai.google.dev/) — Google
- [Unsplash](https://unsplash.com/) — Photo assets (Unsplash License)
