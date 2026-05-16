# 📅 PlanIt — Calendar & Task PWA

A beautiful, iOS-inspired Progressive Web App for managing daily tasks and upcoming plans. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no dependencies.

> **Live Demo:** `https://YOUR-USERNAME.github.io/planit/`

---

## ✨ Features

- **Home Tab** — See today's tasks and a 7-day upcoming preview at a glance
- **Calendar Tab** — Browse any month, tap a date to add or view tasks
- **All Tasks Tab** — Master list of every task sorted chronologically
- **Offline Support** — Works without internet via Service Worker caching
- **Installable PWA** — Add to Home Screen on iOS/Android for a native app feel
- **Dark Mode UI** — Glassmorphism design with ambient glow effects
- **Task Management** — Add, complete, and delete tasks per date
- **Persistent Storage** — Tasks saved to localStorage, survive page refreshes

---

## 📸 Screenshots

> *(Add screenshots of your app here after deploying)*

---

## 🚀 Getting Started

### Run Locally

Because this is a PWA with a Service Worker, it must be served over HTTP (not opened as a plain file). Use any static server:

```bash
# Using Python (built-in)
python3 -m http.server 8080

# Using Node.js (npx)
npx serve .

# Using VS Code
# Install the "Live Server" extension and click "Go Live"
```

Then open `http://localhost:8080` in your browser.

### Project Structure

```
planit/
├── index.html      # App shell & markup
├── styles.css      # All styles (design system, components)
├── app.js          # App logic, rendering, state management
├── manifest.json   # PWA manifest (name, icons, display mode)
└── sw.js           # Service Worker (caching & offline support)
```

---

## 🌐 Deploying to GitHub Pages

1. **Create a new GitHub repository** — name it `planit` and set it to Public

2. **Upload all 5 files** to the root of the repository

3. **Enable GitHub Pages:**
   - Go to **Settings → Pages**
   - Source: `Deploy from a branch`
   - Branch: `main` / Folder: `/ (root)`
   - Click **Save**

4. **Visit your live app** at:
   ```
   https://YOUR-USERNAME.github.io/planit/
   ```

> ⏱ It may take up to 60 seconds for the site to go live after saving.

---

## 📱 Install as a Native App

### iPhone / iPad (Safari)
1. Open your GitHub Pages URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add** — PlanIt appears on your home screen like a native app

### Android (Chrome)
1. Open the URL in **Chrome**
2. Tap the **⋮ menu → Add to Home screen**
3. Tap **Install**

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (Custom Properties, Grid, Flexbox, Backdrop Filter) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | [Figtree](https://fonts.google.com/specimen/Figtree) via Google Fonts |
| PWA | Web App Manifest + Service Worker API |
| Storage | localStorage |
| Hosting | GitHub Pages |

---

## 🔧 Customization

**Change the accent color** — edit `--primary` in `styles.css`:
```css
:root {
  --primary: #007AFF; /* swap this to any color */
}
```

**Change app name** — update `manifest.json` and the `<title>` in `index.html`

**Extend offline cache** — add more asset paths to the `ASSETS` array in `sw.js`

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Made with ❤️ using vanilla web technologies*
