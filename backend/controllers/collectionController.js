const db = require('../config/db');

// Lấy danh sách bộ sưu tập của user hiện tại
exports.getMyCollections = (req, res) => {
  const userId = req.user.id;
  db.query(
    'SELECT * FROM photo_collections WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// Tạo bộ sưu tập mới
exports.createCollection = (req, res) => {
  const userId = req.user.id;
  const { title, description } = req.body;

  if (!title) return res.status(400).json({ error: 'Thiếu title' });

  db.query(
    'INSERT INTO photo_collections (user_id, title, description) VALUES (?, ?, ?)',
    [userId, title, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Tạo bộ sưu tập thành công', collectionId: result.insertId });
    }
  );
};

// Xem chi tiết 1 bộ sưu tập kèm ảnh bên trong
exports.getCollectionDetail = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  db.query(
    'SELECT * FROM photo_collections WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ sưu tập' });

      const collection = results[0];
      db.query('SELECT * FROM photos WHERE collection_id = ? ORDER BY uploaded_at DESC', [id], (err2, photos) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ ...collection, photos });
      });
    }
  );
};

// Thêm ảnh vào bộ sưu tập
exports.addPhoto = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // collection id
  const { image_url, caption } = req.body;

  if (!image_url) return res.status(400).json({ error: 'Thiếu image_url' });

  // Kiểm tra bộ sưu tập có thuộc về user không
  db.query('SELECT * FROM photo_collections WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ sưu tập' });

    db.query(
      'INSERT INTO photos (collection_id, image_url, caption) VALUES (?, ?, ?)',
      [id, image_url, caption],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ message: 'Thêm ảnh thành công', photoId: result.insertId });
      }
    );
  });
};

// Xoá bộ sưu tập (chỉ chủ sở hữu)
exports.deleteCollection = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  db.query('SELECT * FROM photo_collections WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy bộ sưu tập' });

    db.query('DELETE FROM photo_collections WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Xoá bộ sưu tập thành công' });
    });
  });
};
