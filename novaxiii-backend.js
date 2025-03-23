// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/novaxiii', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Schemas
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['agent', 'manager', 'admin'], default: 'agent' },
    agencyName: { type: String, required: true },
    agentType: { type: String, enum: ['SA', 'GA'], required: true },
    phone: { type: String },
    profileImage: { type: String },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const performanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    calls: { type: Number, default: 0 },
    appointments: { type: Number, default: 0 },
    sits: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    alp: { type: Number, default: 0 }, // Annual Life Premium
    refs: { type: Number, default: 0 },
    refAppointments: { type: Number, default: 0 },
    refSales: { type: Number, default: 0 },
    refAlp: { type: Number, default: 0 },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    experience: { type: String, required: true },
    licenses: { type: [String], default: [] },
    message: { type: String },
    resumeUrl: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'contacted', 'interviewed', 'hired', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Performance = mongoose.model('Performance', performanceSchema);
const Application = mongoose.model('Application', applicationSchema);

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET || 'novaxiii_secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Setup email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Routes

// Auth routes
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, agencyName, agentType, phone } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            agencyName,
            agentType,
            phone
        });
        
        await user.save();
        
        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'novaxiii_secret_key',
            { expiresIn: '1d' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                agencyName: user.agencyName,
                agentType: user.agentType
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'novaxiii_secret_key',
            { expiresIn: '1d' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                agencyName: user.agencyName,
                agentType: user.agentType,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User routes
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, agencyName, agentType, profileImage } = req.body;
        
        const updateData = {
            firstName,
            lastName,
            phone,
            agencyName,
            agentType
        };
        
        if (profileImage) {
            updateData.profileImage = profileImage;
        }
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('-password');
        
        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Performance routes
app.post('/api/performance', authenticateToken, async (req, res) => {
    try {
        const { date, calls, appointments, sits, sales, alp, refs, refAppointments, refSales, refAlp, notes } = req.body;
        
        const performance = new Performance({
            userId: req.user.id,
            date: new Date(date),
            calls,
            appointments,
            sits,
            sales,
            alp,
            refs,
            refAppointments,
            refSales,
            refAlp,
            notes
        });
        
        await performance.save();
        res.status(201).json(performance);
    } catch (error) {
        console.error('Add performance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/performance', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = { userId: req.user.id };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const performances = await Performance.find(query).sort({ date: -1 });
        res.json(performances);
    } catch (error) {
        console.error('Get performances error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Leaderboard routes
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, period } = req.query;
        
        let start, end;
        
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            // Default to current week
            const today = new Date();
            const dayOfWeek = today.getDay();
            start = new Date(today);
            start.setDate(today.getDate() - dayOfWeek);
            start.setHours(0, 0, 0, 0);
            end = new Date(today);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        }
        
        const performances = await Performance.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    totalAlp: { $sum: '$alp' },
                    totalRefAlp: { $sum: '$refAlp' },
                    totalNetAlp: { $sum: { $add: ['$alp', '$refAlp'] } },
                    totalCalls: { $sum: '$calls' },
                    totalAppointments: { $sum: '$appointments' },
                    totalSits: { $sum: '$sits' },
                    totalSales: { $sum: '$sales' },
                    totalRefs: { $sum: '$refs' },
                    totalRefAppointments: { $sum: '$refAppointments' },
                    totalRefSales: { $sum: '$refSales' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    firstName: '$user.firstName',
                    lastName: '$user.lastName',
                    agencyName: '$user.agencyName',
                    agentType: '$user.agentType',
                    profileImage: '$user.profileImage',
                    totalAlp: 1,
                    totalRefAlp: 1,
                    totalNetAlp: 1,
                    totalCalls: 1,
                    totalAppointments: 1,
                    totalSits: 1,
                    totalSales: 1,
                    totalRefs: 1,
                    totalRefAppointments: 1,
                    totalRefSales: 1
                }
            },
            {
                $sort: { totalNetAlp: -1 }
            }
        ]);
        
        res.json(performances);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Application routes
app.post('/api/applications', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, location, experience, licenses, message, resumeUrl } = req.body;
        
        const application = new Application({
            firstName,
            lastName,
            email,
            phone,
            location,
            experience,
            licenses,
            message,
            resumeUrl
        });
        
        await application.save();
        
        // Send email notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || 'admin@novaxiii.com',
            subject: 'New Agent Application Received',
            html: `
                <h2>New Agent Application</h2>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Location:</strong> ${location}</p>
                <p><strong>Experience:</strong> ${experience}</p>
                <p><strong>Licenses:</strong> ${licenses.join(', ') || 'None'}</p>
                <p><strong>Message:</strong> ${message || 'None'}</p>
                <p><strong>Resume:</strong> ${resumeUrl ? 'Attached' : 'Not provided'}</p>
                <p>Log in to the admin portal to review this application.</p>
            `
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        
        res.status(201).json({ message: 'Application submitted successfully' });
    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin-only routes
app.get('/api/admin/applications', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const applications = await Application.find().sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/admin/applications/:id', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const { status } = req.body;
        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );
        
        res.json(application);
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
