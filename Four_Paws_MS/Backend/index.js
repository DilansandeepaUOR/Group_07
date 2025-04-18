const express = require('express');
const app = express();
const port = 3001;

const cookieParser = require("cookie-parser");

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(cookieParser());


// Routes
const appointmentRoutes = require('./routes/Appointment/appointment');
app.use('/appointments', appointmentRoutes);



//user authentications

const recordEntryRoutes = require('./routes/RecordEntry/recordHandle');
app.use('/record', recordEntryRoutes);


const registerRoutes =require('./routes/Userinformations/petownerregister');
app.use('/api/registerform', registerRoutes);

const loginRoutes =require('./routes/Userinformations/petownerlogin');
app.use('/api/loginform/', loginRoutes);


const loginUserRoutes =require('./routes/Userinformations/loginuser');
app.use('/api/auth/', loginUserRoutes);

const logOutUserRoutes =require('./routes/Userinformations/logoutuser');
app.use('/api/auth/', logOutUserRoutes);

const petProfileRoutes =require('./routes/Userinformations/petownergetprofile');
app.use('/api/', petProfileRoutes);


//admin routes
//admin register
const adminRegRoutes =require('./routes/Admininformations/adregister');
app.use('/api/adregform', adminRegRoutes);

//admin login
const adminloginRoutes =require('./routes/Admininformations/adlogin');
app.use('/api/adloginform/', adminloginRoutes);

//admin profile
const adminprofileRoutes =require("./routes/Admininformations/adgetprofile");
app.use('/api/',adminprofileRoutes);

//admin petshop
const adminpetshopRoutes =require('./routes/Admininformations/adpetshop');
app.use('/api/adminpetshop',adminpetshopRoutes)

const pharmacy =require('./routes/Pharmacy/pharmacy');
app.use('/pharmacy', pharmacy);

//Contact info routes
const contactInfoRoutes = require('./routes/Contactinfo/contact');
app.use('/contact', contactInfoRoutes);


//Record Selection
//const mysql = require('mysql2/promise');
//const router = express.Router();
// Middleware

app.use(express.json());
// Use the routes
const recordRoutes = require('./routes/Records/RecordSelection');
app.use('/api', recordRoutes);







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
app.get('/api/test-route', (req, res) => {
  res.json({ message: "Test route works!" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
