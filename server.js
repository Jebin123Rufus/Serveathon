
require('dotenv').config();
const twilio = require('twilio');
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const express = require('express');
const mongoose = require('mongoose');

// Debug Twilio environment variables
console.log('SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('TOKEN:', process.env.TWILIO_AUTH_TOKEN);
console.log('PHONE:', process.env.TWILIO_PHONE_NUMBER);

// Utility: Send SMS to a specific number with debug logging
async function sendServeathonSMS(toNumber) {
  try {
    console.log('Twilio SID:', process.env.TWILIO_ACCOUNT_SID);
    console.log('Twilio Token:', process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio From:', TWILIO_PHONE_NUMBER);
    console.log('Twilio To:', toNumber);
    const message = await client.messages.create({
      body: "This is from Serveathon, We'll send you medicine reminders to make sure you never miss a dose. Wishing you a speedy recovery. Stay HEALTHY!!",
      from: TWILIO_PHONE_NUMBER,
      to: toNumber
    });
    console.log(`SMS sent to ${toNumber}: ${message.sid}`);
  } catch (err) {
    console.error('Failed to send SMS:', err);
  }
}

const app = express();
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  // Fetch all patients and send SMS to their mobile numbers
  Patient.find().then(patients => {
    if (patients.length === 0) {
      console.log("No patients found in the database.");
      return;
    }
    patients.forEach(patient => {
      let number = patient.mobileNumber;
      // Add +91 prefix if not present
      if (!number.startsWith('+')) {
        number = '+91' + number;
      }
      sendServeathonSMS(number);
    });
  }).catch(err => {
    console.error("Error fetching patients:", err.message);
  });
});

// Patient Schema
const medicineSchema = new mongoose.Schema({
  name: String,
  count: Number,
  time: String, 
});

const patientSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true },
  medicines: [medicineSchema],
});

const Patient = mongoose.model('Patient', patientSchema);

app.post('/patients', async (req, res) => {
  try {
    const { mobileNumber, medicines } = req.body;
    const patient = new Patient({ mobileNumber, medicines });
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {

    // Send SMS using Twilio after successful registration
    client.messages.create({
      body: "This is from Serveathon, We'll send you medicine reminders to make sure you never miss a dose. Wishing you a speedy recovery. Stay HEALTHY!!",
      from: TWILIO_PHONE_NUMBER,
      to: mobileNumber
    }).then(message => {
      console.log(`SMS sent to ${mobileNumber}: ${message.sid}`);
    }).catch(err => {
      console.error(`Failed to send SMS: ${err.message}`);
    });

    // Send SMS using Twilio
    client.messages.create({
      body: "This is from Serveathon, We'll send you medicine reminders to make sure you never miss a dose. Wishing you a speedy recovery. Stay HEALTHY!!",
      from: twilioPhone,
      to: mobileNumber
    }).then(message => {
      console.log(`SMS sent to ${mobileNumber}: ${message.sid}`);
    }).catch(err => {
      console.error(`Failed to send SMS: ${err.message}`);
    });
    res.status(500).json({ error: err.message });
  }
});

Patient.find().then(patients => {
  patients.forEach(patient => {
    console.log(`Mobile Number: ${patient.mobileNumber}`);
    patient.medicines.forEach(med => {
      console.log(`  Medicine: ${med.name}, Count: ${med.count}, Time: ${med.time}`);
    });
  });
}).catch(err => {
  console.error('Error retrieving patients:', err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
