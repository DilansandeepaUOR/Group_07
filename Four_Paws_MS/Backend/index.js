const express = require('express');  
const app = express();
const port = 3001;

const cors = require('cors');
app.use(cors());

const appointmentRoutes = require('./routes/Appointment/appointment');
app.use('/appointments', appointmentRoutes);


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
