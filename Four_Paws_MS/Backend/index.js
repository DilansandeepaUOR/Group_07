const express = require('express');
const app = express();
const port = 3001;

const cookieParser = require("cookie-parser");

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Path to NotificationService
const { router: notificationRouter } = require('./routes/Records/NotificationService');
app.use('/api/notifications', notificationRouter);
const { dailyNotificationCheck } = require('./routes/Records/NotificationService');
dailyNotificationCheck();

// Routes
const appointmentRoutes = require('./routes/Appointment/appointment');
app.use('/appointments', appointmentRoutes);


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

const adminUsersRegRoutes =require('./routes/Admininformations/reguserregister');
app.use('/api/adreguserform', adminUsersRegRoutes);

//admin login
const adminloginRoutes =require('./routes/Admininformations/adlogin');
app.use('/api/adloginform', adminloginRoutes);

//admin profile
const adminprofileRoutes =require("./routes/Admininformations/adgetprofile");
app.use('/api/',adminprofileRoutes);

//admin petshop
const adminpetshopRoutes =require('./routes/Admininformations/adpetshop');
app.use('/api/adminpetshop',adminpetshopRoutes);
app.use('/uploads', express.static('uploads'));

const pharmacy =require('./routes/Pharmacy/pharmacy');
app.use('/pharmacy', pharmacy);

//assistant doctor
const assistantdoctorRoutes =require('./routes/Assitdoctor/assistantdoctor');
app.use('/api/assistantdoctor', assistantdoctorRoutes);

//Contact info routes
const contactInfoRoutes = require('./routes/Contactinfo/contact');
app.use('/contact', contactInfoRoutes);

//Record Selection
const recordRoutes = require('./routes/Records/RecordSelection');
app.use('/api', recordRoutes);

const dogdewormingNotificationService = require('./routes/Records/DogsDewormingNotificationService');
app.use('/api/deworming-notifications', dogdewormingNotificationService.router);

app.get('/api/test-route', (req, res) => {
  res.json({ message: "Test route works!" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


