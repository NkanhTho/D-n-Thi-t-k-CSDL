/* =========================================================================
   PATCH BACKEND — 2 endpoint mà frontend cần nhưng backend hiện chưa có.
   Gửi đoạn này cho Người 2 (hoặc nhóm trưởng) dán vào routes/bookingRoutes.js.
   Không tạo bảng mới, chỉ SELECT trên schema đã có.
   ========================================================================= */

// ---------- 1. Lịch sử đặt chỗ của chính user (trang Lịch sử đặt chỗ) ----------
// GET /api/bookings/my
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.id, b.space_id, b.start_time, b.end_time, b.total_price,
              b.status, b.qr_code_hash, b.created_at,
              s.name AS space_name, s.type AS space_type,
              t.status AS payment_status, t.order_id
       FROM bookings b
       JOIN spaces s ON b.space_id = s.id
       LEFT JOIN transactions t ON t.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY b.start_time DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- 2. Chi tiết một phòng (trang Chi tiết phòng/studio) ----------
// GET /api/bookings/spaces/:id
// Lưu ý: phải khai báo SAU route '/spaces' nhưng TRƯỚC '/spaces/:spaceId/resources'
// thì Express mới khớp đúng.
router.get('/spaces/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM spaces WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy phòng' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* -------------------------------------------------------------------------
   SAU KHI BACKEND CÓ 2 ENDPOINT TRÊN, sửa frontend cho gọn:

   src/api/spaceApi.js
     export const getSpaceById = (id) =>
       client.get(`/bookings/spaces/${id}`).then((res) => res.data);

   src/api/bookingApi.js  -> giữ nguyên, đã trỏ đúng '/bookings/my'
   ------------------------------------------------------------------------- */
