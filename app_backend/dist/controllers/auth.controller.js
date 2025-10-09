"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySession = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const register = async (req, res) => {
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const { username, fullName, accountNumber, idNumber, password } = req.body;
        // Check if user already exists
        const existingUser = await userRepository.findOne({
            where: [
                { accountNumber },
                { idNumber },
                { username }
            ]
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Account number or ID number already registered'
            });
        }
        // Create new user
        const user = new User_1.User();
        user.username = username;
        user.fullName = fullName;
        user.accountNumber = accountNumber;
        user.idNumber = idNumber;
        user.password = password;
        // Hash password before saving
        await user.hashPassword();
        // Save user
        await userRepository.save(user);
        res.status(201).json({
            success: true,
            message: 'Registration successful'
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        const details = (error === null || error === void 0 ? void 0 : error.message) || 'Registration failed';
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            details
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    const userRepository = database_1.AppDataSource.getRepository(User_1.User);
    try {
        const { username, password } = req.body;
        // Find user by username only (accountNumber is encrypted at rest with random IV,
        // so we compare plaintexts after load instead of querying by it)
        const user = await userRepository.findOne({
            where: { username }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Account number is no longer required at login
        // Validate password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Update last login
        user.lastLogin = new Date();
        await userRepository.save(user);
        // Generate token
        const jwtSecret = process.env.JWT_SECRET;
        const expiresInEnv = process.env.JWT_EXPIRATION || '24h';
        const jwtOptions = { expiresIn: expiresInEnv };
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, jwtSecret, jwtOptions);
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                accountNumber: user.accountNumber,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};
exports.login = login;
const logout = async (req, res) => {
    // Since we're using JWT, we just send a success response
    // The frontend should remove the token
    res.json({
        success: true,
        message: 'Logout successful'
    });
};
exports.logout = logout;
const verifySession = async (req, res) => {
    // If middleware passed, token is valid
    res.json({
        success: true,
        message: 'Session is valid'
    });
};
exports.verifySession = verifySession;
