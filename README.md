# Jacory Wiley — Personal Site

Personal website for Jacory Wiley. Built with React, Firebase, and deployed on Netlify.

## Tech Stack

- **React** (Create React App) — single-page app
- **Firebase Firestore** — content storage (images, books, copy, contact links, analytics)
- **Firebase Auth** — email/password login for the management portal
- **Netlify** — hosting, SPA redirect rules, serverless functions
- **Nodemailer via Netlify Functions** — email delivery for booking form submissions

---

## Local Development

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`.

### Environment Variables

Create a `.env.local` file in the project root with the following variables. All are required for Firebase to connect; the Gmail vars are only needed to test email delivery locally.

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=

GMAIL_USER=
GMAIL_APP_PASSWORD=
```

`GMAIL_USER` and `GMAIL_APP_PASSWORD` are also set as environment variables in the Netlify dashboard for the deployed function.

---

## Deployment

The site is deployed automatically on Netlify on push to `main`. No manual build step is needed.

`netlify.toml` sets:
- **Functions directory** — `netlify/functions/`
- **SPA redirect** — all paths → `index.html` with status 200

---

## Management Portal

The portal is accessible at `/manage`. It requires Firebase email/password authentication.

### Customize

| Route | Purpose |
|---|---|
| `/manage/hero` | Upload/select the full-bleed hero background image |
| `/manage/books` | Add, edit, reorder, and toggle books live; manage purchase links per section (Physical / Digital / Audio) |
| `/manage/speaking` | Upload/select the speaking section portrait |
| `/manage/about` | Upload/select the about section portrait |
| `/manage/baseball` | Manage images and text drafts for the Beep Baseball and 2022 Championship sections |
| `/manage/spotlight` | Add media appearances and testimonials shown in the Spotlight section |
| `/manage/quoteband` | Upload/select the image behind the quote strip |
| `/manage/contact` | Add, edit, and reorder contact/booking links |

### Reports

| Route | Purpose |
|---|---|
| `/manage/submissions` | View booking inquiries submitted via the contact form |
| `/manage/analytics` | Page views, sessions, top pages, and device breakdown |

---

## Firebase Data Structure

### Collections

| Collection | Contents |
|---|---|
| `books` | Book documents — title, cover image, description, meta, purchase sections, live flag, order |
| `heroImages` | Uploaded hero image URLs + alt text |
| `aboutImages` | Uploaded about portrait URLs + alt text |
| `speakingImages` | Uploaded speaking portrait URLs + alt text |
| `quoteBandImages` | Uploaded quote band image URLs + alt text |
| `beepBaseballImages` | Beep Baseball section images |
| `championshipImages` | 2022 Championship section images |
| `beepBaseballDrafts` | Text drafts for the Beep Baseball section |
| `championshipDrafts` | Text drafts for the Championship section |
| `mediaAppearances` | Press/interview entries for the Spotlight carousel |
| `testimonials` | Quote cards (with up to 3 photos) for the Spotlight section |
| `contactLinks` | Booking/contact links (icon, label, URL, order) |
| `submissions` | Booking form submissions |
| `page_views` | Anonymous page view events (path, timestamp, session ID, viewport width) |
| `book_clicks` | Purchase link click events (book title, retailer, section) |

### Config Documents (`config` collection)

Each document stores the currently active/live selection for that section.

| Document | Fields |
|---|---|
| `hero` | `activeUrl`, `activeAlt` |
| `about` | `activeUrl`, `activeAlt` |
| `speaking` | `activeUrl`, `activeAlt` |
| `quoteBand` | `activeUrl`, `activeAlt` |
| `beepBaseball` | `activeUrl`, `activeAlt` |
| `championship` | `activeUrl`, `activeAlt` |
| `beepBaseballText` | `activeDraftId`, `p1`, `p2`, `ctaLabel`, `ctaLink` |
| `championshipText` | `activeDraftId`, `p1`, `p2`, `ctaLabel`, `ctaLink` |
| `submissionSettings` | `notifyEmails` (array of addresses to notify on new submission) |

---

## Netlify Function

### `netlify/functions/send-notification.js`

Called by the contact form on submission. Sends an email via Gmail (Nodemailer) to all addresses listed in `config/submissionSettings.notifyEmails`.

**Required Netlify environment variables:**
- `GMAIL_USER` — the Gmail address used as the sender
- `GMAIL_APP_PASSWORD` — a Gmail App Password (not the account password)

The function accepts a `POST` with JSON body `{ to: string[], submission: { name, email, organization, event_type, message } }`.
