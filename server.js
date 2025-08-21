const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());


mongoose.connect('mongodb://localhost:27017/patient', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
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
