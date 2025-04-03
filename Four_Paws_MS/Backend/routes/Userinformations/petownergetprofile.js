const express=require('express');
const router=express.Router();
const db=require('../../db');

router.use(express.json());
router.use(express.urlencoded({extended: true}));

router.use((req,res,next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});


router.get('/profile', async (req, res) => {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'ID query parameter is required' });
    }
  
    try {
      const [results] = await db.promise().query(
        'SELECT Owner_name, E_mail, Phone_number, Owner_address FROM pet_owner WHERE Owner_id = ?', 
        [id]
      );
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'user not found' });
      }
      
      res.json(results[0]);
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Error retrieving user' });
    }
  });


  module.exports = router;


