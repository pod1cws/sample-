const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE users (id INT, username TEXT, role TEXT)");
  db.run("INSERT INTO users VALUES (1, 'alice', 'admin'), (2, 'bob', 'user')");
});

// VULNERABLE: Direct string interpolation allows SQL injection
function findUser(username, callback) {
  const query = `SELECT id, username, role FROM users WHERE username = '${username}'`;
  db.all(query, (err, rows) => {
    callback(err, rows);
  });
}

module.exports = { findUser };
