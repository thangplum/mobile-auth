const express  = require('express');
const cors = require('cors');
const twilio = require('twilio');
const firebase = require('firebase');

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var client = new twilio("AC2ec5945edab7ba9b1ddebdffa8ea8cdd", "c1b86840f9ed69dec78ccb33736f5d30");

// Initialize Firebase database
var firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    databaseURL: process.env.FB_DATABASE_URL,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);

var database = firebase.database();

// Helper function uses to write phone number and access code to Firebase database
var writeAccessCode = (phoneNumber, accessCode) => {
    firebase.database().ref('phone/' + phoneNumber).set({
        accessCode: accessCode
    });
}

// Helper function uses to generate a 6-digit code
var generateRandomString = function(length) {
    var text = '';
    var possible = '0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

// (POST) CreateNewAccessCode
// Parameters: phoneNumber
// Return: a random 6-digit access code
// Other requirement: save this access code to the phoneNumber in the database
app.post('/getcode', (req, res) => {
    // Generate the 6-digit access code
    database.ref('phone').once("value")
        .then(snapshot => {
            // Check if the phone number is in database or not
            if (!snapshot.child(req.body.phoneNumber).exists()) {
                const accessCode = generateRandomString(6);
                // Write to database with given phone number and generated access code
                writeAccessCode(req.body.phoneNumber, accessCode);
                //text the access code to the user
                client.messages.create({
                    body: `This is your access code: ${accessCode}`,
                    to: `+1${req.body.phoneNumber}`,  // Text this number
                    from: '+16692382994' // From a valid Twilio number
                });
                res.json("Waiting to verify")
            } else {
                // If the phone number is already in the data base, check if the 
                // access code is a blank string or not 
                database.ref('phone/' + req.body.phoneNumber)
                    .once("value", snapshot => {
                        if (snapshot.val().accessCode == "") {
                            res.json("Already verified");
                        } else {
                            res.json("Waiting to verify");
                        }
                    })
            }
        });
    
    return;
});

// (POST) ValidateAccessCode
// Parameters: accessCode, phoneNumber
// Return: { success: true }
// Other requirement: set the access code to empty string once validation is complete
app.post('/verify', (req, res) => {
    database.ref('phone/' + req.body.phoneNumber)
      .once("value", snapshot => {
        if (snapshot && snapshot.exists()) {
            // Verify user's input access code with database's access code. 
            if (snapshot.val().accessCode == req.body.accessCode) {
                // Set phone number's access code to "" when they are successful verified
                writeAccessCode(req.body.phoneNumber, "")
                // return a success when verified
                res.json("successfully verified");
            } else {
                if (snapshot.val().accessCode == "") {
                    res.json("Already verified")
                } else {
                    res.json("Cannot verified");
                }
            }
        }}, errorObject => {
            console.log("The read failed: " + errorObject.code)
        });
});

module.exports = app;