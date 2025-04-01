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


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
