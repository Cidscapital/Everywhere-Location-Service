const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const nodemailer = require('nodemailer');
const Swal = require('sweetalert2')
const OpenCageGeocoder = require('opencage-api-client');



dotenv.config(); // Load environment variables from .env file

const app = express();
const port = 3000;

    // Middleware
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.static('public'));
    app.use(cookieParser());
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true
    }));

    // MySQL Connection
    const db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    db.connect((err) => {
        if (err) throw err;
        console.log('Connected to MySQL');
    });

    // Email Transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Middleware to check if the user is logged in
    const isAuthenticated = (req, res, next) => {
        if (req.session.userId) {
            // User is logged in, proceed to the next middleware or route handler
            next();
        } else {
            // User is not logged in, redirect to the login page
            res.redirect('/login');
        }
    };

    // Routes
    app.get('/', (req, res) => {
        res.render('index.ejs'); // Render your landing page
    });

    app.get('/signup', (req, res) => {
        res.render('signup.ejs');
    });

    app.get('/login', (req, res) => {
        res.render('login.ejs');
    });

    app.get('/main', isAuthenticated, (req, res) => {
        res.render('dashboard.ejs');
    });

    app.get('/deposit', isAuthenticated, (req, res) => {
        res.render('deposit.ejs');
    });

    app.get('/withdraw', isAuthenticated, (req, res) => {
        res.render('withdraw.ejs');
    });
 
    app.post('/signup', async (req, res) => {
            // Handle signup logic, insert user data into the database

            const { name, email, pass, re_pass } = req.body;

            // Validation
        if (!name || !email || !pass || !re_pass || pass !== re_pass) {
            return res.status(400).json({ message: 'Invalid input or passwords do not match' });
        }

        // Generate a random verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000);

        // Hash the password before storing it in the database
        try {
            const hashedPassword = await bcrypt.hash(pass, 10); // 10 is the number of salt rounds

            // Store hashedPassword in the database along with other user details
            // (your database query here)
            // Insert user data into the database
            const insertUserQuery = 'INSERT INTO users (name, email, hashedpassword, verification_code) VALUES (?, ?, ?, ?)';
            db.query(insertUserQuery, [name, email, hashedPassword, verificationCode], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                // Send verification email
                const mailOptions = {
                    from: process.env.EMAIL_USERNAME,
                    to: email,
                    subject: 'Account Verification',
                    text: `Your verification code is: ${verificationCode}`
                };

                transporter.sendMail(mailOptions, (mailErr) => {
                    if (mailErr) {
                        console.error(mailErr);
                        return res.status(500).json({ message: 'Error sending verification email' });
                    }

                res.status(200).json({ message: 'Verification code sent to your email' });

                });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }

    }); 

    app.get('/verification', (req, res) => {
        // Handle verification logic, send verification code to the user's email

        const email = req.query.email;

        if (!email) {
            return res.status(400).json({ message: 'Invalid Email.' });
        }

        res.render('verification.ejs', { email });
    });

    app.post('/verify', (req, res) => {
        const { email, verificationCode } = req.body;

        // Validate input
        if (!email || !verificationCode) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        

        // Check if the email is already verified
        const checkEmailVerificationQuery = 'SELECT is_verified FROM users WHERE email = ?';
        db.query(checkEmailVerificationQuery, [email], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (result.length === 1 && result[0].is_verified) {
                // Email is already verified, redirect to login
                return res.status(200).json({ message: 'Email is already verified' });
            }

            // Continue with the verification logic
            const checkVerificationQuery = 'UPDATE users SET is_verified = true WHERE email = ? AND verification_code = ?';
            db.query(checkVerificationQuery, [email, verificationCode], (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                if (result.affectedRows === 1) {
                    // Successful verification
                    res.status(200).json({ message: 'Verification successful' });
                } else {
                    // Invalid verification code
                    res.status(401).json({ message: 'Invalid verification code' });
                }
            });
        });
    });

    // Login route with location retrieval and database insertion
    app.post('/login', async (req, res) => {
        const { email, pass} = req.body;

        // Validation
        if (!email || !pass) {
            return res.status(400).json({ message: 'Invalid input' });
        }

        // Check if the user is verified
        const checkVerificationQuery = 'SELECT id, is_verified FROM users WHERE email = ?';
        db.query(checkVerificationQuery, [email], async (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (result.length === 0 || !result[0].is_verified) {
                return res.redirect(`/verification?email=${email}`); // Redirect to verification page if the account is not verified
            }

            // Implement your actual login logic here (check the password, create session, etc.)
            const loginUserQuery = 'SELECT * FROM users WHERE email = ?';
            db.query(loginUserQuery, [email], async (loginErr, loginResult) => {
                if (loginErr) {
                    console.error(loginErr);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                if (loginResult.length === 1) {
                    const user = loginResult[0];

                    // Continue with login process
                    req.session.userId = user.id; // Store user ID in the session
                    res.status(200).json({ message: 'Logged in successfully' });
                        
                } else {
                    // User not found
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            });
        });
    });


    // Logout route
    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                res.redirect('/'); // Redirect to the home page or login page
            }
        });
    });

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
