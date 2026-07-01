# Contributing to AboutIAM

We are thrilled that you are interested in contributing to **AboutIAM**! This is an open-source, community-driven interactive hub dedicated to making Identity and Access Management clear, visual, and secure for everyone.

By contributing, you help developers build secure integrations, help architects make informed infrastructure choices, and help beginners understand identity concepts.

---

## 🗺️ How Can I Contribute?

### 1. Adding Learning Modules
- Our educational content is structured into **6 Guided Tracks** (see `GEMINI.md`).
- If you find a topic that is missing or needs a better real-world analogy, feel free to submit a pull request!

### 2. Creating or Improving Playgrounds
- All playgrounds are client-side and interactive (built with React 19, TypeScript, and WASM/Zustand).
- You can contribute by fixing protocol simulator bugs, adding new OAuth flow visuals, enhancing cryptographic packet inspectors, or creating new sandboxes (like SCIM or Decentralized Identity).

### 3. Improving UI/UX & Themes
- AboutIAM supports both **Light & Dark modes** with a highly responsive, mobile-first design.
- Help us refine visual contrast, add polished Framer Motion animations, or optimize SVG diagrams for better responsive viewports.

---

## 🛠️ Development Setup

AboutIAM runs entirely client-side with zero backend dependencies. 

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/aboutiam.git
   cd aboutiam
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Run tests:**
   ```bash
   npm run test
   ```

---

## 🤝 Pull Request Guidelines

1. **Keep it Surgical:** Ensure your PR is focused, resolving a specific issue or adding a single feature. Do not bunch unrelated changes.
2. **Double-Vetted Responsive Theme:** If you modify CSS/UI, verify it renders perfectly across both **Light & Dark modes** and scales fluidly down to mobile screens ($< 768\text{px}$).
3. **Include Tests:** If you are adding logic, calculators, or custom helper utilities, add corresponding unit tests (Vitest).
4. **Write Clean Code:** Adhere to existing TypeScript conventions, use explicit types, and document code where necessary.

Thank you for being part of the **AboutIAM** mission!
