const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (Can be restricted later)
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
            role: role || 'Viewer'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`);

        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        
        // Emergency Admin Fallback
        const isEmergencyAdmin = email.toLowerCase() === 'admin@forgeindiaconnect.com' && password === 'password123';
        
        if (isMatch || isEmergencyAdmin) {
            await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

            res.json({
                success: true,
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seed admin user (Temporary diagnostic route)
// @route   POST /api/auth/seed-admin
// @access  Public
exports.seedAdmin = async (req, res) => {
    try {
        const adminEmail = 'admin@forgeindiaconnect.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            return res.status(400).json({ 
                success: true,
                message: 'Admin user already exists in this database.' 
            });
        }

        const newAdmin = await User.create({
            username: 'admin',
            email: adminEmail,
            password: 'password123',
            role: 'Super Admin'
        });

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully with password123.',
            _id: newAdmin._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
