# Lexa

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-green.svg)](https://developer.chrome.com/docs/extensions/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Lexa is a browser extension that analyzes and highlights grammatical structures directly in the user's browser. It processes content locally and provides real-time feedback without sending data to external servers.

![Lexa Demo](screenshots/demo.gif)

## Table of Contents

- [Purpose](#purpose)
- [Features](#features)
- [Grammar Rules](#grammar-rules)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Privacy](#privacy)
- [Contributing](#contributing)
- [License](#license)

## Purpose

Lexa was created as a personal project to explore:
- Browser extension architecture (Chrome Manifest V3)
- Real-time DOM manipulation and text analysis
- Pattern matching with regular expressions
- Clean frontend engineering practices
- TypeScript type safety

The extension helps ESL learners and developers understand English grammatical structures in real-world contexts on any webpage.

## Features

- **12 Grammar Tenses Detection**: Covers all major English tenses
- **Real-time Highlighting**: Instant visual feedback as you browse
- **Interactive Tooltips**: Explanations appear on hover
- **Configurable Rules**: Enable/disable specific grammar rules
- **Local Processing**: Zero data sent to external servers
- **Lightweight**: Minimal performance impact
- **Type-safe**: Built entirely with TypeScript

## Grammar Rules

| Tense | Example | Pattern |
|-------|---------|---------|
| Present Simple | "She works hard" | Subject + verb (base form) |
| Past Simple | "They walked home" | Subject + verb (past form) |
| Present Continuous | "I am reading" | Subject + am/is/are + verb-ing |
| Future (Will) | "We will arrive" | Subject + will + base verb |
| Present Perfect | "She has finished" | have/has + past participle |
| Past Perfect | "They had left" | had + past participle |
| Future Perfect | "We will have completed" | will have + past participle |
| Present Perfect Continuous | "I have been waiting" | have/has been + verb-ing |
| Past Perfect Continuous | "She had been studying" | had been + verb-ing |
| Future Perfect Continuous | "They will have been working" | will have been + verb-ing |

## Tech Stack

```json
{
  "Language": "TypeScript 5.9",
  "Framework": "Preact (for popup UI)",
  "Build Tool": "Vite 7",
  "Extension API": "Chrome Extension Manifest V3",
  "Styling": "SCSS",
  "Testing": "Vitest (planned)"
}
```
## Architecture

```cmd
lexa/
├── src/
│   ├── background/          # Service worker (extension lifecycle)
│   │   └── index.ts
│   ├── content/             # Content scripts (page analysis)
│   │   ├── index.ts         # Main content script
│   │   ├── highlighter.ts   # DOM manipulation
│   │   ├── rules/           # Grammar detection rules
│   │   │   ├── presentSimple.ts
│   │   │   ├── pastSimple.ts
│   │   │   └── ...
│   │   └── tooltip.ts       # Hover explanations
│   ├── popup/               # Extension popup UI
│   │   ├── App.tsx          # Preact component
│   │   ├── index.html
│   │   └── styles.scss
│   └── shared/              # Shared utilities
│       ├── grammar.ts       # Types and interfaces
│       ├── verbUtils.ts     # Verb conjugation helpers
│       └── constants.ts     # Rule priorities
├── public/
│   └── icons/               # Extension icons
├── dist/                    # Build output
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
## Rule Priority System
Rules are executed in specific order to prevent overlaps:

1. Perfect Continuous (most specific)
2. Perfect Tenses
3. Continuous Tenses
4. Future
5. Past Simple
6. Present Simple (least specific)

## Installation Development Build
1. Clone the repository

```bash
git clone https://github.com/yourusername/lexa.git
cd lexa
```
2. Install dependencies
```bash
npm install
```
3. Build the extension
```bash
npm run build
```
4. Load in Chrome
    - Open Chrome and navigate to chrome://extensions
    - Enable "Developer Mode" (toggle in top right)
    - Click "Load unpacked"
    - Select the dist folder from the project

## From Chrome Web Store (Coming Soon)
Once published, you'll be able to install directly from the Chrome Web Store.

## Usage
1. After installation, navigate to any webpage
2. Lexa automatically analyzes the page content
3. Grammar structures are highlighted with colored backgrounds
4. Hover over any highlighted text to see the grammatical explanation
5. Click the extension icon to configure which rules are active

## Privacy
Lexa does not collect, store, or transmit any personal data.

- All text processing happens locally in your browser
- No external API calls
- No analytics or tracking
- No data storage
- No remote code execution

## License
This project is licensed under the MIT License - see the LICENSE file for details.