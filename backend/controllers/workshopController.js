const db = require('../config/db');

// Danh sách workshop
exports.getAllWorkshops = (req, res) => {
  db.query(
    `SELECT w.id, w.organizer_id, u.name AS organizer_name, w.title, w.description,
            w.date, w.location, w.capacity, w.registered_count, w.created_at
     FROM workshops w
     JOIN users u ON u.id = w.organizer_id
     ORDER BY w.date ASC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// Xem chi tiết 1 workshop
exports.getWorkshopById = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT w.*, u.name AS organizer_name FROM workshops w
     JOIN users u ON u.id = w.organizer_id
     WHERE w.id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: 'Không tìm thấy workshop' });
      res.json(results[0]);
    }
  );
};

// Tạo workshop (chỉ role 'expert', áp dụng checkRole ở route)
exports.createWorkshop = (req, res) => {
  const organizerId = req.user.id;
  const { title, description, date, location, capacity } = req.body;

  if (!title || !date || !capacity) {
    return res.status(400).json({ error: 'Thiếu title, date hoặc capacity' });
  }

  db.query(
    'INSERT INTO workshops (organizer_id, title, description, date, location, capacity) VALUES (?, ?, ?, ?, ?, ?)',
    [organizerId, title, description, date, location, capacity],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Tạo workshop thành công', workshopId: result.insertId });
    }
  );
};

// Đăng ký tham gia workshop
// Dùng transaction + FOR UPDATE để tránh 2 người đăng ký cùng lúc vượt capacity
exports.registerWorkshop = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // workshop id

  db.beginTransaction((errTx) => {
    if (errTx) return res.status(500).json({ error: errTx.message });

    db.query('SELECT * FROM workshops WHERE id = ? FOR UPDATE', [id], (err, results) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: err.message }));
      }
      if (results.length === 0) {
        return db.rollback(() => res.status(404).json({ error: 'Không tìm thấy workshop' }));
      }

      const workshop = results[0];
      if (workshop.registered_count >= workshop.capacity) {
        return db.rollback(() => res.status(400).json({ error: 'Workshop đã đủ số lượng đăng ký' }));
      }

      db.query(
        'INSERT INTO workshop_registrations (workshop_id, user_id) VALUES (?, ?)',
        [id, userId],
        (err2) => {
          if (err2) {
            // Lỗi trùng đăng ký (UNIQUE key) hoặc lỗi khác
            const message = err2.code === 'ER_DUP_ENTRY'
              ? 'Bạn đã đăng ký workshop này rồi'
              : err2.message;
            return db.rollback(() => res.status(400).json({ error: message }));
          }

          db.query(
            'UPDATE workshops SET registered_count = registered_count + 1 WHERE id = ?',
            [id],
            (err3) => {
              if (err3) {
                return db.rollback(() => res.status(500).json({ error: err3.message }));
              }

              db.commit((errCommit) => {
                if (errCommit) {
                  return db.rollback(() => res.status(500).json({ error: errCommit.message }));
                }
                res.status(201).json({ message: 'Đăng ký workshop thành công' });
              });
            }
          );
        }
      );
    });
  });
};

// Huỷ đăng ký workshop
exports.cancelRegistration = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // workshop id

  db.beginTransaction((errTx) => {
    if (errTx) return res.status(500).json({ error: errTx.message });

    db.query(
      'DELETE FROM workshop_registrations WHERE workshop_id = ? AND user_id = ?',
      [id, userId],
      (err, result) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: err.message }));
        }
        if (result.affectedRows === 0) {
          return db.rollback(() => res.status(404).json({ error: 'Bạn chưa đăng ký workshop này' }));
        }

        db.query(
          'UPDATE workshops SET registered_count = registered_count - 1 WHERE id = ?',
          [id],
          (err2) => {
            if (err2) {
              return db.rollback(() => res.status(500).json({ error: err2.message }));
            }
            db.commit((errCommit) => {
              if (errCommit) {
                return db.rollback(() => res.status(500).json({ error: errCommit.message }));
              }
              res.json({ message: 'Huỷ đăng ký thành công' });
            });
          }
        );
      }
    );
  });
};
