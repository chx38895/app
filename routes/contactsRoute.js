const express = require('express');
const db = require('../controllers/dbContext');
const router = express.Router();

router.post('/', async (req, res) => {

  try {
    const userId  = req.session.userData.userId;

    const [contacts] = await db.query(`
    SELECT contacts.contact_id, users.username
    FROM contacts
    JOIN users ON contacts.contact_id = users.id
    WHERE contacts.user_id = ?`, 
    [ userId ]);

    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error occurred while fetching contacts:', error);
    res.status(500).send('Server Error');
  }
});


router.post('/search', async (req, res) => {
  try {
    const userId  = req.session.userData.userId;
    const { search } = req.body;

    const [searchResults] = await db.query('SELECT id, username FROM users WHERE username LIKE ? AND id !=?', [`%${search}%`, userId]);

    res.status(200).json(searchResults);

  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Server Error');
  }
});


router.post('/add', async (req, res) => {
  const { contactId } = req.body;
  const userId  = req.session.userData.userId;
  try {
    await db.query('INSERT INTO contacts (user_id, contact_id) VALUES (?, ?)', [userId, contactId]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error occurred while adding contact:', error);
    res.status(500).send('Server Error');
  }
});


router.post('/remove', async (req, res) => {
  const { contactId } = req.body;
  const userId  = req.session.userData.userId;

  try {

    await db.query('DELETE FROM contacts WHERE user_id = ? AND contact_id = ?', [userId, contactId]);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error occurred while removing contact:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;