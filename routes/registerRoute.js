const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../controllers/dbContext');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));




router.post('/', async (req, res) => {
        try {
          const { username, password } = req.body;
      
          const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
          if (existingUser.length > 0) {
            return res.status(400).send('Username already exists');
          }
      

          const userId = uuidv4();
      
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
      
          await db.query('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [userId, username, hashedPassword]);
      
          res.send('User registered successfully');
        } catch (error) {
          console.error(error);
          res.status(500).send('Server Error');
        }
      });

module.exports = router;