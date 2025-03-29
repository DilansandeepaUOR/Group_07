const express = require('express');
const db = require('./db');  
const app = express();
const port = 3001;


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
