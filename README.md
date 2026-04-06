# 💊 Rx-Norm Taiwan

**Drug Standardization & Smart Pharmacopeia Platform**

> Group 6 — Software Studio, National Tsing Hua University (NTHU)

## Overview

Rx-Norm Taiwan is a web-based platform that unifies Taiwan's NHI drug codes, WHO ATC classifications, and US RxNorm identifiers into a single searchable interface. It helps pharmacists, physicians, and patients quickly look up drug information and check for drug-drug interactions.

## ✨ Features

- **Drug Search** — Search by drug name (English/Chinese), brand name, NHI code, or ATC code with fuzzy matching
- **Drug-Drug Interaction Checker** — Select multiple drugs and instantly view known interactions with severity warnings
- **Prescription OCR Scanner** — Upload a photo of a prescription or drug label for automatic drug identification
- **Cross-Standard Mapping** — Every drug entry links NHI ↔ ATC ↔ RxNorm codes

## 🖥️ Demo Screenshots

| Drug Search | Interaction Check | OCR Scan |
|:-----------:|:-----------------:|:--------:|
| Search and browse drugs | Check DDI warnings | Scan prescriptions |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/rxnorm-taiwan.git

# 2. Navigate to the project folder
cd rxnorm-taiwan

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, CSS-in-JS |
| Backend (planned) | Node.js / Python FastAPI |
| Database (planned) | PostgreSQL, Redis, Elasticsearch |
| OCR (planned) | Tesseract OCR |
| Deployment | Vercel / GitHub Pages |

## 📁 Project Structure

```
rxnorm-taiwan/
├── public/             # Static assets
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── docs/               # Midterm report & documentation
├── index.html          # HTML template
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite configuration
└── README.md
```

## 👥 Team — Group 6

| Member | Role |
|--------|------|
| Member A | PM / Backend Lead |
| Member B | Frontend Lead |
| Member C | Data Engineer |
| Member D | ML / OCR Engineer |
| Member E | QA / Documentation |

## 📄 License

This project is for educational purposes — Software Studio course at NTHU.

## 🙏 Acknowledgments

- Boyo Social Welfare Foundation (mentors)
- Taiwan Health Network Platform (mentors)
- National Tsing Hua University, EECS Department
