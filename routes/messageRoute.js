const express = require('express');
const db = require('../controllers/dbContext');

const router = express.Router();


router.post('/', async (req, res) => {
    const { recipient, offset} = req.body;
    const userId  = req.session.userData.userId;
    
  
    try {

        const [messages] = await db.query(
            `SELECT * FROM messages 
             WHERE (sender = '${userId}' AND recipient = '${recipient}') 
             OR (sender = '${recipient}' AND recipient = '${userId}') 
             ORDER BY timestamp DESC LIMIT 10 OFFSET ${offset}`
          );
      res.json(messages);
    } catch (error) {
      console.error('Error occurred while fetching messages:', error);
      res.status(500).send('Server Error');
    }
  
  });
  
  module.exports = router;



router.post('/send', async (req, res) => {
    const sender  = req.session.userData.userId;
    const { recipient, content } = req.body;
  
    try {
      await db.query(
        'INSERT INTO messages (sender, recipient, content) VALUES (?, ?, ?)',
        [sender, recipient, content]
      );
  
      res.sendStatus(200); 
    } catch (error) {
      console.error('Error occurred while saving the message:', error);
      res.status(500).send('Server Error');
    }
    
  });

  router.post('/unread', async (req, res) => {
    const userId  = req.session.userData.userId;
  
    try {

      const [unread] = await db.query(`
        SELECT DISTINCT
        sender.id AS sender_id,
        sender.username AS sender_username
        FROM messages
        JOIN users sender ON messages.sender = sender.id
        WHERE messages.recipient = ? AND messages.isRead = 0;`,
        [userId]
        
      );
  
      res.json(unread);
    } catch (error) {
      console.error('Error occurred while saving the message:', error);
      res.status(500).send('Server Error');
    }
    
  });

  router.post('/update', async (req, res) => {

    const user  = req.session.userData.userId;
    const { currentRecipient } = req.body;
    try {

      await db.query(`
      UPDATE messages
      SET isRead = 1
      WHERE recipient = ? AND sender = ? AND isRead = 0;
    `, [user, currentRecipient]);
  
      res.sendStatus(200); 
    } catch (error) {
      console.error('Error occurred while updating the message:', error);
      res.status(500).send('Server Error');
    }
  });





module.exports = router;