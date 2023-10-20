const db = require('./controllers/dbContext');


/*db.query('SELECT 1 + 1 as result', (error, results, fields) => {
    if (error) {
      console.error('Error connecting to the database:', error.message);
      return;
    }
    console.log('Connected to the database successfully!');
    console.log('Result of the query:', results[0].result);
  });
  */

  /*async function testInsert() {
    try {
      const id = '10';
      const username = 'testuser';
      const password = 'testpassword';
  
      // Perform the insertion query using execute()
      const [result] = await db.execute('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [id, username, password]);
  
      // Check the result
      if (result.affectedRows === 1) {
        console.log('Data inserted successfully.');
      } else {
        console.log('Failed to insert data.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      // Close the database connection (if you are using connection pool)
      db.end();
    }
  }
  
  // Call the function to perform the insertion
  testInsert();

  */
/*
  async function testQuery() {
    try {

      console.log('start of the test');
      const [searchResults] = await db.query("SELECT * FROM users WHERE username LIKE '%a%'");
      console.log('check if test works', searchResults);
    } catch (error) {
      console.error('Error occurred while querying the database:', error);
    }
  }
*/


/*
async function testQuery() {
  try {
    const userId = "34870542-48d3-4ea7-b987-b79ef1c570ec"; // Declare as const

    console.log('start of the test');
    const [searchResults] = await db.query(`
    SELECT
    contacts.contact_id,
    users.username,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM messages
        WHERE sender = contacts.contact_id
        AND recipient = ? AND isRead = 0
        LIMIT 1
      )
      THEN 1
      ELSE 0
    END AS hasUnreadMessage
  FROM contacts
  JOIN users ON contacts.contact_id = users.id
  WHERE contacts.user_id = ?`,
    [userId, userId]); // Pass userId twice for both placeholders
    console.log(searchResults);
  } catch (error) {
    console.error('Error occurred while querying the database:', error);
  }
}

*/


async function testQuery() {
  try {
    const user = "34870542-48d3-4ea7-b987-b79ef1c570ec";
    const currentRecipient = "b8679074-fb80-442d-ad68-0ee3306ade27";

    console.log('start of the test');
    await db.query(`
    UPDATE messages
    SET isRead = 1
    WHERE recipient = ? AND sender = ? AND isRead = 0;
  `, [user, currentRecipient]);
  } catch (error) {
    console.error('Error occurred while querying the database:', error);
  }
}
testQuery();