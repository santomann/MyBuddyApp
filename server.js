const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());

// Twilio configuration
const accountSid = 'masked'; // 
const authToken = 'masked'; // 
const serviceSid = 'masked'; // 

const client = twilio(accountSid, authToken);

// Firebase Admin SDK setup
const serviceAccount = require('./firebase-service-account.json'); // 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'addyoururl' //
});

const db = admin.database();

// Route to send verification code
app.post('/send-verification', async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const verification = await client.verify.v2.services(serviceSid)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });

        console.log('Verification SID:', verification.sid);
        res.status(200).json({ success: true, message: 'Verification code sent.' });
    } catch (error) {
        console.error('Error sending verification:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Route to verify the code and create user in Firebase
app.post('/verify-code', async (req, res) => {
    const { phoneNumber, code, name, password, id } = req.body;

    console.log('Verifying for:', phoneNumber, code);

    try {
        const verificationCheck = await client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({ to: phoneNumber, code });

        if (verificationCheck.status === 'approved') {
            // Create the user in Firebase
            const userRef = db.ref('users').push();
            await userRef.set({
                name: name,
                phoneNumber: phoneNumber,
                password: password, // 
                id: id
            });

            res.status(200).json({ success: true, message: 'Phone number verified and user created.' });
        } else {
            res.status(400).json({ success: false, message: 'Verification failed.' });
        }
    } catch (error) {
        console.error('Verification check failed:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
