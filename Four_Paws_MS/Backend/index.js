const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');

app.use(cors());
app.use(express.json());  // Ensure Express can handle JSON

// Routes
const appointmentRoutes = require('./routes/Appointment/appointment');
app.use('/appointments', appointmentRoutes);

const recordEntryRoutes = require('./routes/RecordEntry/recordHandle');  // Import router correctly
app.use('/record', recordEntryRoutes);  // Correctly register the endpoint


const registerRoutes =require('./routes/Userinformations/petownerregister');
app.use('/api/registerform', registerRoutes);

const loginRoutes =require('./routes/Userinformations/petownerlogin');
app.use('/api/loginform/', loginRoutes);

const pharmacy =require('./routes/Pharmacy/pharmacy');
app.use('/pharmacy', pharmacy);

//Sample code
// app.get('/', (req, res) => {
//   db.query('SELECT * FROM owners', (err, results) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Database error');
//       return;
//     }
//     res.json(results); 
//   });
// });


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
