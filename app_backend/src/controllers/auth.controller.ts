import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

export const register = async (req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);
    
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
        const user = new User();
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
    } catch (error: any) {
        console.error('Registration error:', error);
        const details = error?.message || 'Registration failed';
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            details
        });
    }
};

export const login = async (req: Request, res: Response) => {
    const userRepository = AppDataSource.getRepository(User);
    
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
        const jwtSecret = process.env.JWT_SECRET as jwt.Secret;
        const expiresInEnv = process.env.JWT_EXPIRATION || '24h';
        const jwtOptions: jwt.SignOptions = { expiresIn: expiresInEnv as unknown as jwt.SignOptions['expiresIn'] };
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            jwtSecret,
            jwtOptions
        );

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
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    // Since we're using JWT, we just send a success response
    // The frontend should remove the token
    res.json({
        success: true,
        message: 'Logout successful'
    });
};

export const verifySession = async (req: Request, res: Response) => {
    // If middleware passed, token is valid
    res.json({
        success: true,
        message: 'Session is valid'
    });
};
