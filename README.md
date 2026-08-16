# 💖 AuraMatch — Complete Full-Stack Dating Web Application

AuraMatch is a modern, responsive, 100% free-of-cost full-stack Dating Web Application built with **Next.js (App Router), React, TypeScript, Tailwind CSS, Mongoose, and MongoDB Atlas**.

Designed from the ground up for **18+ adults**, prioritizing photo verification, safety moderation, physics-based gesture swiping, instant mutual matching, real-time messaging, and clean REST APIs ready for future Flutter iOS/Android mobile clients.

---

## 🚀 Key Features

* **100% Free Core Dating**: Zero paywalls or charges. Free swiping, unblurred likes preview, instant matches, and messaging.
* **Physics-Based Swipe Engine**: Framer Motion gesture physics (Swipe Right = Like, Swipe Left = Pass, Swipe Up = SuperLike), dynamic visual stamp overlays, photo story tabs, and full deck rewinds.
* **End-to-End Mutual Matching**: Automated detection of mutual likes (`User A ↔ User B`), triggering full-screen confetti celebration and instant conversation generation.
* **Real-Time Messaging**: Optimistic chat dispatch, typing indicators, read receipts, and curated smart icebreaker sparks.
* **Who Liked You (Free)**: Unblurred candidate cards with 1-click instant match.
* **Onboarding & Profile Studio**: Multi-step registration, age validation (18+ only), multi-photo manager, bio, passions, prompts, and selfie photo verification check.
* **Safety Center & Moderation**: Dedicated `/safety` center, 1-click user blocking & reporting, automated spam/keyword moderation filters.
* **Admin Command Center**: Multi-view admin portal with live metrics (active users, match conversion rates), user management (verify/suspend/ban), and report queues.
* **Future Flutter App Compatibility**: All business logic lives in backend services (`services/`) and REST Route Handlers (`/api/...`).

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti.
* **Backend / API**: Next.js Route Handlers, Zod Validation, JWT Authentication (`jsonwebtoken`), Bcrypt password hashing (`bcryptjs`).
* **Database & ORM**: MongoDB Atlas Free Tier / Mongoose with indexed models (`User`, `Profile`, `Like`, `Pass`, `Match`, `Conversation`, `Message`, `Report`, `Block`, `Notification`).
* **Real-Time Architecture**: Socket/Event-driven communication bridge with optimistic fallback.

---

## 📁 Directory Structure

```text
dating-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx               # Sign in & instant demo accounts
│   │   ├── register/page.tsx            # Multi-step 18+ registration
│   │   └── verify/page.tsx              # Selfie photo verification
│   ├── onboarding/page.tsx              # Profile setup wizard
│   ├── discover/page.tsx                # Swiping cards, hotkeys & filter modal
│   ├── profile/
│   │   ├── page.tsx                     # User profile preview & editor
│   │   └── [id]/page.tsx                # Candidate profile view
│   ├── matches/page.tsx                 # Active match conversations
│   ├── chat/[matchId]/page.tsx          # Real-time chat & icebreakers
│   ├── likes/page.tsx                   # Inbound likes with 1-click match
│   ├── settings/page.tsx                # Distance radius, age & privacy toggles
│   ├── safety/page.tsx                  # Safety center & tips
│   ├── help/page.tsx                    # FAQs & Support inquiry
│   ├── admin/
│   │   ├── dashboard/page.tsx           # Platform KPIs & match funnels
│   │   ├── users/page.tsx               # Member directory & ban actions
│   │   └── reports/page.tsx             # Safety reports moderation
│   └── api/                             # REST APIs for Next.js & Flutter
├── components/
│   ├── ui/ (Button, Badge, Navbar)
│   ├── discovery/ (SwipeCard, SwipeControls, FilterModal, MatchCelebrationModal)
│   ├── profile/ (ProfileEditor, ProfileDetailModal)
│   └── chat/ (ChatList, ChatWindow)
├── lib/
│   ├── mongodb.ts                       # MongoDB connection manager
│   ├── auth.ts                          # JWT & Password hashing
│   ├── socket.ts                        # Real-time event bus
│   ├── storage.ts                       # Persistent cache & photo helpers
│   └── validations.ts                   # Zod request validation schemas
├── models/                              # Mongoose Schemas & 2dsphere indexes
├── services/                            # Reusable domain business logic
└── utils/                               # Distance calculation, seed data & formatters
```

---

## 📦 Installation & Setup

1. **Clone or Navigate to the project directory**:
   ```bash
   cd "d:/Software/Dating app WEB"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and set your MongoDB URI:
   ```bash
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/auramatch
   JWT_SECRET=super_secret_jwt_key_dating_app_2026
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   *(Note: If MongoDB is offline, the app automatically falls back to an in-memory seed store so everything works immediately out of the box!)*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 🔒 Security & Privacy Practices

* **Zero Plain-Text Passwords**: All user passwords hashed using `bcryptjs` with salt factor 10.
* **Server-Side Authorization**: Authentication tokens extracted and verified on server-side Route Handlers.
* **Zod Input Sanitization**: Every API request payload validated against strict type constraints.
* **Privacy Controls**: Incognito mode and discovery visibility pause toggles.
* **Strict Age Verification**: Under 18 accounts rejected at registration.

---

## 📱 Future Flutter Mobile App Integration

Because all core business logic is encapsulated in Next.js Route Handlers (`/api/...`), a Flutter iOS/Android application can directly connect to the same endpoints:
* `POST /api/auth/login` → Authenticate user and receive JWT token
* `GET /api/discover` → Fetch discovery candidate stack
* `POST /api/discover/action` → Submit `{ targetUserId, action: 'like' | 'pass' }`
* `GET /api/matches` → Fetch matched user list
* `GET /api/conversations/[id]/messages` → Fetch chat history
* `POST /api/conversations/[id]/messages` → Send instant message
* `POST /api/reports` → Submit user report

---

## 📄 License
MIT © 2026 AuraMatch. Built with modern web standards.
