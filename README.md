#FOLDER STRUCTURE

electricity-billing/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │            
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── billController.js
│   │   ├── readingController.js
│   │   ├── tariffController.js
│   │   ├── reportController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   └── auth.js             # JWT protect + authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Reading.js
│   │   ├── Bill.js
│   │   └── Tariff.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── billRoutes.js
│   │   ├── readingRoutes.js
│   │   ├── tariffRoutes.js
│   │   ├── reportRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/                   # React App
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Sidebar.js
    │   │       └── Topbar.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── CustomersPage.js
    │   │   ├── ReadingsPage.js
    │   │   ├── BillsPage.js
    │   │   ├── TariffsPage.js
    │   │   └── ReportsPage.js
    │   ├── utils/
    │   │   └── api.js          # Axios instance
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json





#BACKEND SETUP
    
cd backend
npm install
cp .env
# Edit .env — set MONGO_URI and JWT_SECRET
node server.js      # Starts on http://localhost:5000


#FRONTEND SETUP

cd frontend
npm install
npm run dev        # Starts on http://localhost:3000
