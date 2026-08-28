const db = require('../config/db');

exports.getProfile = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT id, name, email, role, phone FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy user' });
    res.json(results[0]);
  });
};

exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;
  db.query(
    'UPDATE users SET name = ?, phone = ? WHERE id = ?',
    [name, phone, userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Cập nhật hồ sơ thành công' });
    }
  );
};