## 📁 Folder Structure

```
electricity-billing/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── billController.js
│   │   ├── readingController.js
│   │   ├── tariffController.js
│   │   ├── reportController.js
│   │   └── dashboardController.js
│
│   ├── middleware/
│   │   └── auth.js             # JWT protect + authorize
│
│   ├── models/                 # 📌 Database Schemas (Mongoose)
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Reading.js
│   │   ├── Bill.js
│   │   └── Tariff.js
│
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── billRoutes.js
│   │   ├── readingRoutes.js
│   │   ├── tariffRoutes.js
│   │   ├── reportRoutes.js
│   │   └── dashboardRoutes.js
│
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/                   # React App
    ├── public/
    │   └── index.html
    │
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Sidebar.js
    │   │       └── Topbar.js
    │   │
    │   ├── context/
    │   │   └── AuthContext.js
    │   │
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── CustomersPage.js
    │   │   ├── ReadingsPage.js
    │   │   ├── BillsPage.js
    │   │   ├── TariffsPage.js
    │   │   └── ReportsPage.js
    │   │
    │   ├── utils/
    │   │   └── api.js          # Axios instance
    │   │
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    │
    └── package.json
```

---

## 🗄️ Database

All database schemas are located in:

```
/backend/models
```


---

## ⚙️ Prerequisites

* Node.js v18+
* MongoDB (local or Atlas)

---

## 🚀 Backend Setup

```
cd backend
npm install
cp .env.example .env
# Edit .env → set MONGO_URI and JWT_SECRET
node server.js
```

👉 Runs on: http://localhost:5000

---

## 💻 Frontend Setup

```
cd frontend
npm install
npm run dev
```

👉 Runs on: http://localhost:3000
