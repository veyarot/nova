// MongoDB Database Configuration

// .env file (Environment Variables)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/novaxiii
JWT_SECRET=your_jwt_secret_key_here
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
ADMIN_EMAIL=admin@novaxiii.com

// Database Schema Documentation

/*
USER COLLECTION
--------------
Collection for storing agent and admin user information

Fields:
- _id: ObjectId (Auto-generated)
- firstName: String (Required)
- lastName: String (Required)
- email: String (Required, Unique)
- password: String (Required, Hashed)
- role: String (Enum: 'agent', 'manager', 'admin', Default: 'agent')
- agencyName: String (Required)
- agentType: String (Enum: 'SA', 'GA', Required)
- phone: String
- profileImage: String (URL to profile image)
- active: Boolean (Default: true)
- createdAt: Date (Default: current date)
*/

/*
PERFORMANCE COLLECTION
---------------------
Collection for storing daily agent performance metrics

Fields:
- _id: ObjectId (Auto-generated)
- userId: ObjectId (Reference to User collection)
- date: Date (Required)
- calls: Number (Default: 0)
- appointments: Number (Default: 0)
- sits: Number (Default: 0)
- sales: Number (Default: 0)
- alp: Number (Annual Life Premium, Default: 0)
- refs: Number (Default: 0)
- refAppointments: Number (Default: 0)
- refSales: Number (Default: 0)
- refAlp: Number (Default: 0)
- notes: String
- createdAt: Date (Default: current date)
*/

/*
APPLICATION COLLECTION
--------------------
Collection for storing job applications

Fields:
- _id: ObjectId (Auto-generated)
- firstName: String (Required)
- lastName: String (Required)
- email: String (Required)
- phone: String (Required)
- location: String (Required)
- experience: String (Required)
- licenses: Array of Strings
- message: String
- resumeUrl: String
- status: String (Enum: 'pending', 'reviewed', 'contacted', 'interviewed', 'hired', 'rejected', Default: 'pending')
- createdAt: Date (Default: current date)
*/

// Example MongoDB Indexes Creation

/*
// User Indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ agencyName: 1 })
db.users.createIndex({ createdAt: -1 })

// Performance Indexes
db.performances.createIndex({ userId: 1 })
db.performances.createIndex({ date: -1 })
db.performances.createIndex({ userId: 1, date: -1 })

// Application Indexes
db.applications.createIndex({ email: 1 })
db.applications.createIndex({ status: 1 })
db.applications.createIndex({ createdAt: -1 })
*/

// Example Data Population for Testing

/*
// Sample Users
db.users.insertMany([
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@novaxiii.com",
    password: "$2a$10$X7VYJjYvPX7j5H5MX2xDZOZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ", // hashed "password123"
    role: "agent",
    agencyName: "METROPOLITAN",
    agentType: "SA",
    phone: "555-123-4567",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    active: true,
    createdAt: new Date()
  },
  {
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@novaxiii.com",
    password: "$2a$10$X7VYJjYvPX7j5H5MX2xDZOZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ", // hashed "password123"
    role: "agent",
    agencyName: "PINNACLE",
    agentType: "GA",
    phone: "555-234-5678",
    profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
    active: true,
    createdAt: new Date()
  },
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@novaxiii.com",
    password: "$2a$10$X7VYJjYvPX7j5H5MX2xDZOZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ5zZ", // hashed "password123"
    role: "admin",
    agencyName: "NOVAXIII",
    agentType: "SA",
    phone: "555-987-6543",
    active: true,
    createdAt: new Date()
  }
]);

// Sample Performance Data
const johnId = db.users.findOne({ email: "john.smith@novaxiii.com" })._id;
const mariaId = db.users.findOne({ email: "maria.rodriguez@novaxiii.com" })._id;

// Current week data for John
db.performances.insertMany([
  {
    userId: johnId,
    date: new Date("2025-03-17"),
    calls: 43,
    appointments: 12,
    sits: 8,
    sales: 5,
    alp: 8250.75,
    refs: 15,
    refAppointments: 6,
    refSales: 3,
    refAlp: 4500.25,
    notes: "Great day with high-value client",
    createdAt: new Date()
  },
  {
    userId: johnId,
    date: new Date("2025-03-18"),
    calls: 38,
    appointments: 10,
    sits: 7,
    sales: 4,
    alp: 7120.50,
    refs: 12,
    refAppointments: 5,
    refSales: 2,
    refAlp: 3250.75,
    notes: "Follow-up with existing clients",
    createdAt: new Date()
  },
  {
    userId: johnId,
    date: new Date("2025-03-19"),
    calls: 45,
    appointments: 15,
    sits: 9,
    sales: 6,
    alp: 9800.25,
    refs: 18,
    refAppointments: 8,
    refSales: 4,
    refAlp: 5400.50,
    notes: "Excellent day with new leads",
    createdAt: new Date()
  }
]);

// Current week data for Maria
db.performances.insertMany([
  {
    userId: mariaId,
    date: new Date("2025-03-17"),
    calls: 52,
    appointments: 18,
    sits: 12,
    sales: 8,
    alp: 12450.75,
    refs: 22,
    refAppointments: 10,
    refSales: 5,
    refAlp: 7800.25,
    notes: "Exceeded daily goals",
    createdAt: new Date()
  },
  {
    userId: mariaId,
    date: new Date("2025-03-18"),
    calls: 47,
    appointments: 15,
    sits: 10,
    sales: 7,
    alp: 10850.50,
    refs: 18,
    refAppointments: 8,
    refSales: 4,
    refAlp: 6250.75,
    notes: "Good conversion rate today",
    createdAt: new Date()
  },
  {
    userId: mariaId,
    date: new Date("2025-03-19"),
    calls: 55,
    appointments: 20,
    sits: 14,
    sales: 9,
    alp: 13420.25,
    refs: 25,
    refAppointments: 12,
    refSales: 6,
    refAlp: 8350.50,
    notes: "Record day for appointments",
    createdAt: new Date()
  }
]);

// Sample Applications
db.applications.insertMany([
  {
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    phone: "555-111-2222",
    location: "Phoenix, AZ",
    experience: "3-5",
    licenses: ["life", "health"],
    message: "I'm looking to join a progressive agency where I can leverage my existing client base and grow my business.",
    resumeUrl: "",
    status: "pending",
    createdAt: new Date("2025-03-15")
  },
  {
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@example.com",
    phone: "555-333-4444",
    location: "Dallas, TX",
    experience: "1-3",
    licenses: ["life"],
    message: "I've been in sales for 2 years and ready to transition to insurance. I'm excited about the opportunity to join NOVAXIII.",
    resumeUrl: "",
    status: "reviewed",
    createdAt: new Date("2025-03-12")
  },
  {
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@example.com",
    phone: "555-555-6666",
    location: "San Francisco, CA",
    experience: "5+",
    licenses: ["life", "health", "property", "casualty"],
    message: "Looking to bring my 8 years of insurance experience to a company with growth opportunities and strong support systems.",
    resumeUrl: "",
    status: "contacted",
    createdAt: new Date("2025-03-10")
  }
]);
*/

// Data Visualization Queries

/*
// 1. Monthly ALP Growth by Agent
db.performances.aggregate([
  {
    $match: { 
      date: { 
        $gte: new Date("2025-01-01"), 
        $lte: new Date("2025-12-31") 
      } 
    }
  },
  {
    $project: {
      userId: 1,
      year: { $year: "$date" },
      month: { $month: "$date" },
      totalAlp: { $add: ["$alp", "$refAlp"] }
    }
  },
  {
    $group: {
      _id: { 
        userId: "$userId", 
        year: "$year", 
        month: "$month" 
      },
      monthlyAlp: { $sum: "$totalAlp" }
    }
  },
  {
    $sort: { 
      "_id.year": 1, 
      "_id.month": 1 
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id.userId",
      foreignField: "_id",
      as: "user"
    }
  },
  {
    $unwind: "$user"
  },
  {
    $project: {
      _id: 0,
      year: "$_id.year",
      month: "$_id.month",
      agentName: { 
        $concat: ["$user.firstName", " ", "$user.lastName"] 
      },
      agencyName: "$user.agencyName",
      monthlyAlp: 1
    }
  }
])

// 2. Conversion Rates by Agent
db.performances.aggregate([
  {
    $match: { 
      date: { 
        $gte: new Date("2025-03-01"), 
        $lte: new Date("2025-03-31") 
      } 
    }
  },
  {
    $group: {
      _id: "$userId",
      totalCalls: { $sum: "$calls" },
      totalAppointments: { $sum: "$appointments" },
      totalSits: { $sum: "$sits" },
      totalSales: { $sum: "$sales" },
      totalAlp: { $sum: { $add: ["$alp", "$refAlp"] } }
    }
  },
  {
    $project: {
      _id: 1,
      totalCalls: 1,
      totalAppointments: 1,
      totalSits: 1,
      totalSales: 1,
      totalAlp: 1,
      appointmentRate: { 
        $cond: [
          { $eq: ["$totalCalls", 0] },
          0,
          { $divide: ["$totalAppointments", "$totalCalls"] }
        ]
      },
      showRate: { 
        $cond: [
          { $eq: ["$totalAppointments", 0] },
          0,
          { $divide: ["$totalSits", "$totalAppointments"] }
        ]
      },
      closeRate: { 
        $cond: [
          { $eq: ["$totalSits", 0] },
          0,
          { $divide: ["$totalSales", "$totalSits"] }
        ]
      },
      avgAlpPerSale: { 
        $cond: [
          { $eq: ["$totalSales", 0] },
          0,
          { $divide: ["$totalAlp", "$totalSales"] }
        ]
      }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  {
    $unwind: "$user"
  },
  {
    $project: {
      _id: 0,
      agentName: { 
        $concat: ["$user.firstName", " ", "$user.lastName"] 
      },
      agencyName: "$user.agencyName",
      appointmentRate: { $multiply: ["$appointmentRate", 100] },
      showRate: { $multiply: ["$showRate", 100] },
      closeRate: { $multiply: ["$closeRate", 100] },
      avgAlpPerSale: 1
    }
  },
  {
    $sort: { closeRate: -1 }
  }
])

// 3. Referral Efficiency Analysis
db.performances.aggregate([
  {
    $match: { 
      date: { 
        $gte: new Date("2025-01-01"), 
        $lte: new Date("2025-12-31") 
      },
      refs: { $gt: 0 }
    }
  },
  {
    $group: {
      _id: "$userId",
      totalRefs: { $sum: "$refs" },
      totalRefAppointments: { $sum: "$refAppointments" },
      totalRefSales: { $sum: "$refSales" },
      totalRefAlp: { $sum: "$refAlp" }
    }
  },
  {
    $project: {
      _id: 1,
      totalRefs: 1,
      totalRefAppointments: 1,
      totalRefSales: 1,
      totalRefAlp: 1,
      refAppointmentRate: { 
        $multiply: [
          { $divide: ["$totalRefAppointments", "$totalRefs"] },
          100
        ]
      },
      refCloseRate: { 
        $cond: [
          { $eq: ["$totalRefAppointments", 0] },
          0,
          { 
            $multiply: [
              { $divide: ["$totalRefSales", "$totalRefAppointments"] },
              100
            ]
          }
        ]
      },
      avgRefAlpPerSale: { 
        $cond: [
          { $eq: ["$totalRefSales", 0] },
          0,
          { $divide: ["$totalRefAlp", "$totalRefSales"] }
        ]
      },
      avgRefValuePerRef: { 
        $divide: ["$totalRefAlp", "$totalRefs"] 
      }
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user"
    }
  },
  {
    $unwind: "$user"
  },
  {
    $project: {
      _id: 0,
      agentName: { 
        $concat: ["$user.firstName", " ", "$user.lastName"] 
      },
      agencyName: "$user.agencyName",
      totalRefs: 1,
      refAppointmentRate: 1,
      refCloseRate: 1,
      avgRefAlpPerSale: 1,
      avgRefValuePerRef: 1
    }
  },
  {
    $sort: { avgRefValuePerRef: -1 }
  }
])
*/
