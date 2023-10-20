const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../controllers/dbContext');
const router = express.Router();



router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;


    const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length === 0) {
      return res.status(401).send('Invalid credentials');
    }


    const passwordMatch = await bcrypt.compare(password, existingUser[0].password);
    if (!passwordMatch) {
      return res.status(401).send('Invalid credentials');
    }


    const userData = {
      userId: existingUser[0].id,
      username: existingUser[0].username,
    };
    // Store userData in session
    req.session.userData = userData;


    
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;