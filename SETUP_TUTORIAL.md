# 🎓 EVon Setup Tutorial for Beginners

Welcome! This guide walks you through setting up EVon step-by-step. **No prior experience needed!**

---

## 📋 What You'll Need (Installation Check)

Before starting, make sure you have these installed:

### Step 1: Check if Node.js is Installed
Open your terminal/command prompt and type:
```bash
node --version
```

**Expected output:** `v18.0.0` or higher

❌ **Don't see it?** [Download Node.js](https://nodejs.org/) (click LTS version)

---

### Step 2: Check if Git is Installed
```bash
git --version
```

**Expected output:** `git version 2.x.x`

❌ **Don't see it?** [Download Git](https://git-scm.com/)

---

### Step 3: Check if Python is Installed (Optional for ML features)
```bash
python --version
```

**Expected output:** `Python 3.9.x` or higher

❌ **Don't see it?** [Download Python](https://www.python.org/)

---

## 🚀 Setup Guide

### Phase 1: Download the Project (5 minutes)

#### For Windows Users:
1. Open **Command Prompt** or **PowerShell**
2. Go to where you want to save the project:
   ```bash
   cd Desktop
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/MalagoudSP/EVon-smart-charging.git
   ```
4. Enter the folder:
   ```bash
   cd EVon-smart-charging
   ```

#### For Mac/Linux Users:
1. Open **Terminal**
2. Navigate to desired location:
   ```bash
   cd ~/Documents
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/MalagoudSP/EVon-smart-charging.git
   ```
4. Enter the folder:
   ```bash
   cd EVon-smart-charging
   ```

**You should see:**
```
EVon-smart-charging/
  ├── app/
  ├── components/
  ├── lib/
  ├── package.json
  └── ... (other files)
```

---

### Phase 2: Install Dependencies (10 minutes)

**What are dependencies?** They're pre-built code libraries that the project uses.

#### Step 1: Install pnpm (Package Manager)
```bash
npm install -g pnpm
```

💡 **What does this do?** It installs `pnpm`, which is faster than `npm` for installing packages.

#### Step 2: Install Project Dependencies
```bash
pnpm install
```

This will download all required libraries. **Takes 2-5 minutes.** You'll see lots of text - that's normal! ✅

**Completed when you see:**
```
✓ Packages successfully installed
```

---

### Phase 3: Setup Database (5 minutes)

The database stores all user info, stations, bookings, etc.

#### Step 1: Generate Prisma Client
```bash
pnpm prisma:generate
```

💡 **What does this do?** Creates type-safe database access code.

**Expected output:**
```
✓ Generated Prisma Client
```

#### Step 2: Run Database Migration
```bash
pnpm prisma:migrate
```

💡 **What does this do?** Creates database tables and schema.

**When prompted:**
```
? Enter a name for the new migration (or just press enter)
```
Just press **Enter** to auto-name it.

**Expected output:**
```
✓ Migrations applied successfully
```

#### Step 3: Seed Sample Data
```bash
pnpm prisma:seed
```

💡 **What does this do?** Fills the database with sample stations, users, and bookings so you have data to work with.

**Expected output:**
```
✓ Seeded database with sample data
```

---

### Phase 4: Start the Application (3 minutes)

#### Step 1: Start Development Server
```bash
pnpm dev
```

**You should see:**
```
▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 1234ms
```

#### Step 2: Open in Browser
Click the link: **http://localhost:3000**

Or manually open your browser and go to: `http://localhost:3000`

🎉 **Success!** You should see the EVon homepage.

---

## 🎮 First Time Using EVon

### 1. Create an Account

1. Click **Register** button
2. Fill in:
   - Email: `demo@example.com` (can use any email)
   - Password: `SecurePass123!` (must have uppercase, lowercase, number, special char)
   - First Name: `Demo`
   - Vehicle Type: `Tesla Model 3`
   - Battery Capacity: `75` kWh

3. Click **Sign Up**

✅ Account created!

### 2. Explore Stations

1. Click **Stations** in navigation
2. You'll see a map with charging stations
3. Click any station to see:
   - Charger types available
   - Current price per kWh
   - Rating and reviews
   - Available chargers

### 3. Make a Booking

1. Click on a station
2. Click **Book Now**
3. Select:
   - Date and time
   - Duration (in minutes)
   - Charger type (Level 2, DC Fast, etc.)
4. Click **Confirm Booking**

✅ Booking created!

### 4. View Dashboard

1. Click **Dashboard** in navigation
2. See your:
   - Upcoming bookings
   - Charging history
   - Cost analysis
   - Carbon savings

---

## 🔧 Project Structure Explained

```
EVon-smart-charging/
│
├── app/                    ← Main application code
│   ├── api/               ← Backend API endpoints
│   │   ├── auth/          ← Login/Register
│   │   ├── bookings/      ← Booking management
│   │   ├── stations/      ← Station data
│   │   └── payments/      ← Payment processing
│   │
│   ├── dashboard/         ← User dashboard page
│   ├── stations/          ← Stations page
│   ├── booking/           ← Booking page
│   └── page.tsx           ← Homepage
│
├── components/            ← Reusable React components
│   ├── ui/               ← UI elements (buttons, cards, etc.)
│   └── theme-provider.tsx ← Dark/light theme
│
├── lib/                   ← Utility functions
│   ├── api-middleware.ts  ← API error handling, validation
│   ├── validation-schemas.ts ← Input validation rules
│   ├── auth-utils.ts      ← Authentication helpers
│   └── prisma.ts          ← Database connection
│
├── hooks/                 ← React custom hooks
│   ├── use-api-response.ts ← API calling hook
│   └── use-toast.ts       ← Notification hook
│
├── prisma/                ← Database configuration
│   ├── schema.prisma      ← Database schema
│   └── seed.js            ← Sample data
│
├── public/                ← Static files (images, etc.)
│
├── package.json           ← Project dependencies
├── tsconfig.json          ← TypeScript configuration
├── next.config.js         ← Next.js configuration
└── README.md              ← Documentation
```

---

## 💡 Understanding Key Features

### 🗺️ Real-time Station Discovery
- API fetches stations from database
- Google Maps displays them interactively
- Click a station to see details
- **Code location:** `app/api/stations/route.ts`

### 📅 Booking System
- Users select station, date, duration
- System validates input with schemas
- Creates booking in database
- Confirmation sent via toast notification
- **Code location:** `app/api/bookings/route.ts`

### 🔐 Authentication
- NextAuth.js manages sessions
- Passwords encrypted using bcrypt
- Only logged-in users can book
- **Code location:** `auth.config.ts`, `app/api/auth/`

### 💾 Database
- Prisma ORM manages all data
- SQLite for development (can switch to PostgreSQL)
- Schema defines tables and relationships
- **Code location:** `prisma/schema.prisma`

---

## 🐛 Common Issues & Solutions

### Issue: `pnpm: command not found`
**Solution:**
```bash
npm install -g pnpm
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Use a different port
pnpm dev -- -p 3001
```
Then visit: `http://localhost:3001`

### Issue: Database errors
**Solution:**
```bash
# Reset database
rm prisma/dev.db
pnpm prisma:migrate
pnpm prisma:seed
```

### Issue: `Cannot find module` errors
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Issue: TypeScript errors
**Solution:**
These are usually just type hints. Check the browser:
- If it works in browser ✅ - Ignore them
- If it doesn't work ❌ - Check the error message

---

## 📚 Next Steps

Once you have EVon running:

1. **Explore the Code**
   - Open `app/page.tsx` - This is the homepage
   - Open `app/dashboard/page.tsx` - This is the user dashboard
   - Open `app/api/stations/route.ts` - This is the API endpoint

2. **Make a Change**
   - Open `app/page.tsx`
   - Find `<h1>EVon</h1>`
   - Change it to `<h1>My EVon</h1>`
   - Save the file
   - Watch it update in the browser! ✨ (hot reload)

3. **Try the API**
   - Go to: `http://localhost:3000/api/stations`
   - See raw JSON data
   - This is what the frontend uses!

4. **Read the Documentation**
   - [API_ENHANCEMENTS.md](./API_ENHANCEMENTS.md) - How APIs work
   - [FEATURES.md](./FEATURES.md) - All features explained

---

## 🎯 Learning Path

### Week 1: Understanding the Basics
- [ ] Complete this tutorial
- [ ] Explore the UI and features
- [ ] Read the homepage README.md
- [ ] Create and manage bookings

### Week 2: Understanding the Code
- [ ] Read [API_ENHANCEMENTS.md](./API_ENHANCEMENTS.md)
- [ ] Look at the code structure
- [ ] Make small UI changes
- [ ] Understand the database schema

### Week 3: Building Features
- [ ] Add a new API endpoint
- [ ] Create a new UI component
- [ ] Connect a new database field
- [ ] Deploy to production

---

## ✅ Congratulations!

You've successfully set up EVon! 🎉

### What You Accomplished:
- ✅ Cloned the project
- ✅ Installed dependencies
- ✅ Set up the database
- ✅ Started the development server
- ✅ Created your first booking
- ✅ Explored the codebase

### Now You Can:
- 🎮 Use the platform as a user
- 👨‍💻 Modify the code
- 🧪 Test new features
- 🚀 Deploy to the internet
- 👥 Contribute back to the project

---

## 📖 Useful Links

| Resource | Link | Purpose |
|----------|------|---------|
| Next.js Docs | [nextjs.org](https://nextjs.org/) | Learn Next.js |
| React Docs | [react.dev](https://react.dev/) | Learn React |
| TypeScript | [typescriptlang.org](https://www.typescriptlang.org/) | Learn TypeScript |
| Prisma | [prisma.io](https://www.prisma.io/) | Learn Database ORM |
| Tailwind CSS | [tailwindcss.com](https://tailwindcss.com/) | Learn Styling |

---

## 🤔 Have Questions?

- 📧 Email us: support@evon.app
- 💬 Discord: [Join our server](https://discord.gg/evon)
- 🐛 Found a bug? [Report on GitHub](https://github.com/MalagoudSP/EVon-smart-charging/issues)
- 💡 Feature idea? [Start a discussion](https://github.com/MalagoudSP/EVon-smart-charging/discussions)

---

<div align="center">

**Happy coding!** 🚀

[← Back to README](./README.md)

</div>
