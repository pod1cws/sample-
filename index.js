const express = require('express');
const { findUser } = require('./database');

const app = express();
app.use(express.json());

// FLAW 1: Hardcoded test credential (triggers secret scanning)
const DUMMY_STRIPE_API_KEY = "sk_test_fakeplaceholderstring1234567890abcdef";

// FLAW 2: Launch-blocking crash bug (Unhandled TypeError on missing nested object)
app.post('/api/checkout', (req, res) => {
  // If req.body.cart is undefined, accessing .items will throw an uncaught exception
  // and crash an unmonitored Node process if error middleware isn't present
  const total = req.body.cart.items.reduce((sum, item) => sum + item.price, 0);

  return res.json({ success: true, total });
});

// FLAW 3: Exposes the database SQLi endpoint
app.get('/api/user', (req, res) => {
  const username = req.query.username;
  findUser(username, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Query failed" });
    }
    return res.json({ users: rows });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
