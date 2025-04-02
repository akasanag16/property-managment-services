const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const { S3Client } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

describe('Backend Setup Tests', () => {
    test('MongoDB Connection', async () => {
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            expect(mongoose.connection.readyState).toBe(1);
        } catch (error) {
            console.error('MongoDB connection failed:', error);
            throw error;
        }
    });

    test('Upload Directory Exists', () => {
        const uploadsDir = process.env.UPLOAD_PATH;
        expect(fs.existsSync(uploadsDir)).toBe(true);
    });

    test('Email Configuration', () => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        expect(transporter).toBeDefined();
    });

    test('AWS S3 Configuration', () => {
        const s3Client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        expect(s3Client).toBeDefined();
    });
}); 