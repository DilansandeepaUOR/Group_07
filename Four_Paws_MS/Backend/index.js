const express = require('express');  
const app = express();
const port = 3001;

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

const appointmentRoutes = require('./routes/Appointment/appointment');
app.use('/appointments', appointmentRoutes);



//user authentications
const registerRoutes =require('./routes/Userinformations/petownerregister');
app.use('/api/registerform', registerRoutes);

const loginRoutes =require('./routes/Userinformations/petownerlogin');
app.use('/api/loginform/', loginRoutes);

const loginUserRoutes =require('./routes/Userinformations/loginuser');
app.use('/api/auth/', loginRoutes);

const logOutUserRoutes =require('./routes/Userinformations/logoutuser');
app.use('/api/deauth/', loginRoutes);

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
