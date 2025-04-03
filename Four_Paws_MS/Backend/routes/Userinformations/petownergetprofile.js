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
        'SELECT po.Owner_name, po.E_mail, po.Phone_number, po.Owner_address, p.Pet_id, p.Pet_name, p.Pet_type, p.Pet_dob FROM pet_owner po JOIN pet p ON po.Owner_id = p.Owner_id WHERE po.Owner_id = ?;', 
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


