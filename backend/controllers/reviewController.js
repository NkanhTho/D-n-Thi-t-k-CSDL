const db = require('../config/db');

// Tạo đánh giá mới
exports.createReview = (req, res) => {
  const userId = req.user.id;
  const { target_type, target_id, rating, comment } = req.body;

  if (!target_type || !target_id || !rating) {
    return res.status(400).json({ error: 'Thiếu target_type, target_id hoặc rating' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'rating phải từ 1 đến 5' });
  }

  db.query(
    'INSERT INTO reviews (user_id, target_type, target_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
    [userId, target_type, target_id, rating, comment],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Đánh giá thành công', reviewId: result.insertId });
    }
  );
};

// Xem đánh giá theo target (vd: /api/reviews/12?target_type=studio)
exports.getReviewsByTarget = (req, res) => {
  const { targetId } = req.params;
  const { target_type } = req.query;

  let sql = `
    SELECT r.id, r.user_id, u.name AS user_name, r.target_type, r.target_id,
           r.rating, r.comment, r.created_at
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.target_id = ?
  `;
  const params = [targetId];

  if (target_type) {
    sql += ' AND r.target_type = ?';
    params.push(target_type);
  }
  sql += ' ORDER BY r.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Xoá đánh giá (chỉ chủ đánh giá mới được xoá)
exports.deleteReview = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  db.query('SELECT * FROM reviews WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
    if (results[0].user_id !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xoá đánh giá này' });
    }

    db.query('DELETE FROM reviews WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Xoá đánh giá thành công' });
    });
  });
};
