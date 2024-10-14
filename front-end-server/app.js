const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const Customer = require('./models/Customer');


const app = express();
const PORT = 3001;

dotenv.config();

const tokenVault = require('tokenization');

// tokenVault.dataGet("4dfcc02b-e4e5-4688-941c-6227227d329a","admin").then(data => console.log(data))
// tokenVault.emailToken("admin@gmail.com").then(data => console.log(data))

// return



app.use(bodyParser.json());  // Use bodyParser to parse JSON payloads
app.use(cors());

const otpStore = {};

// MongoDB connection
const DB_USER = 'admin';
const DB_PASSWORD = 'password';
const DB_NAME = 'users';
const DB_HOST =  'localhost:27017';

mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));



app.post('/login', async (req, res) => {
    const { email } = req.body;
    
    try {
        
        const tokenResponse = await tokenVault.emailToken(email);
        // Extract the token value from the JSON object
        const tokenEmail = tokenResponse.token;

        const user = await Customer.findOne({ email:tokenEmail });

        sendOTP1(email)

        console.log(user)
        
        if (user) {
            return res.send('success');
        } else {
            return res.status(401).send('failed');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/get-information', async (req, res) => {
    const { user } = req.body;
    
    try {
        
        const tokenResponse = await tokenVault.emailToken(user);
        // Extract the token value from the JSON object
        const tokenEmail = tokenResponse.token;

        const user1 = await Customer.findOne({ email:tokenEmail });

        
        
        if (user1) {

            const tokenDetails = await tokenVault.dataGet(user1.token,"admin")
            return res.status(200).json({ tokenDetails });;
        } else {
            return res.status(400).send('failed');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.put('/edit-profile', async (req, res) => {
    const { user } = req.body;
    const { data } = req.body;

    
    try {
        
        const tokenResponse = await tokenVault.emailToken(user);
        // Extract the token value from the JSON object
        const tokenEmail = tokenResponse.token;

        const user1 = await Customer.findOne({ email:tokenEmail });

        
        
        if (user1) {
            const tokenDetails = await tokenVault.editProfile(user1.token,data)
            return res.status(200).json({ tokenDetails });;
        } else {
            return res.status(400).send('failed');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/get-information-agent', async (req, res) => {
    const { user } = req.body;
    
    try {
        
        const tokenResponse = await tokenVault.emailToken(user);
        // Extract the token value from the JSON object
        const tokenEmail = tokenResponse.token;

        const user1 = await Customer.findOne({ email:user });

        if (user1) {

            const tokenDetails = await tokenVault.dataGet(user1.token,"customerservice_alabama")
            return res.status(200).json({ tokenDetails });
        } else {
            return res.status(400).send('failed');
        }
    } catch (err) {
        // console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to fetch all customer email entries
app.get('/get-all-customers-emails', async (req, res) => {
    try {
        // Fetch all customer email entries from the Customer collection
        const customers = await Customer.find({}, 'email');

        // Extract emails from the customers' data
        const emails = customers.map(customer => customer.email);

        // Send the email list to the front end
        return res.status(200).json({ emails });
    } catch (err) {
        // Handle errors
        console.error('Error fetching customer emails:', err);
        res.status(500).send('Internal Server Error');
    }
});



// Route to verify OTP
app.post('/verify-otp', (req, res) => {
    try {
        const { email, otp } = req.body;

        // Check if OTP matches
        if (otpStore[email] && otpStore[email] === otp) {
            // OTP is correct, you can clear it from memory
            delete otpStore[email];
            return res.send('success');
        } else {
            return res.status(401).send('failed');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to verify OTP' });
    }
});

async function sendOTP1(email){
    try {
        const otp = generateOTP();

        otpStore[email] = otp;

        await sendOTP(email, otp);
    } catch (error) {
        console.log(error)
    }
};

// Utility function to generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP via email
async function sendOTP(email, otp) {
    const transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false, // MailHog does not require SSL/TLS
        auth: null, // No authentication needed for MailHog
    });

    const mailOptions = {
        from: 'no-reply@example.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
}


app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
