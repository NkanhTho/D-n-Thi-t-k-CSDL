const db = require('../config/db');

// Lấy tất cả bài viết (feed cộng đồng)
exports.getAllPosts = (req, res) => {
  const { type } = req.query; // lọc theo 'article' hoặc 'guide' (tuỳ chọn)

  let sql = `
    SELECT p.id, p.author_id, u.name AS author_name, p.title, p.content,
           p.type, p.tags, p.created_at
    FROM posts p
    JOIN users u ON u.id = p.author_id
  `;
  const params = [];

  if (type) {
    sql += ' WHERE p.type = ?';
    params.push(type);
  }
  sql += ' ORDER BY p.created_at DESC';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Xem chi tiết 1 bài viết
exports.getPostById = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT p.*, u.name AS author_name FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
      res.json(results[0]);
    }
  );
};

// Tạo bài viết mới
exports.createPost = (req, res) => {
  const authorId = req.user.id;
  const { title, content, type, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Thiếu title hoặc content' });
  }

  db.query(
    'INSERT INTO posts (author_id, title, content, type, tags) VALUES (?, ?, ?, ?, ?)',
    [authorId, title, content, type || 'article', tags],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Đăng bài thành công', postId: result.insertId });
    }
  );
};

// Cập nhật bài viết (chỉ tác giả)
exports.updatePost = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { title, content, tags } = req.body;

  db.query('SELECT * FROM posts WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
    if (results[0].author_id !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền sửa bài viết này' });
    }

    db.query(
      'UPDATE posts SET title = ?, content = ?, tags = ? WHERE id = ?',
      [title, content, tags, id],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: 'Cập nhật bài viết thành công' });
      }
    );
  });
};

// Xoá bài viết (chỉ tác giả)
exports.deletePost = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  db.query('SELECT * FROM posts WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
    if (results[0].author_id !== userId) {
      return res.status(403).json({ error: 'Bạn không có quyền xoá bài viết này' });
    }

    db.query('DELETE FROM posts WHERE id = ?', [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Xoá bài viết thành công' });
    });
  });
};
