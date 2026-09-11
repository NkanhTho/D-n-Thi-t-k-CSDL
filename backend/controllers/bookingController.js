const db = require('../config/db');
const crypto = require('crypto');

exports.checkAvailability = async (req, res) => {
    const { spaceId, resourceIds, startTime, endTime } = req.body;

    try {
        const [spaceConflicts] = await db.query(
            `SELECT id FROM bookings 
             WHERE space_id = ? 
               AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
               AND (start_time < ? AND end_time > ?)`,
            [spaceId, endTime, startTime]
        );

        if (spaceConflicts.length > 0) {
            return res.status(200).json({ available: false, reason: 'Không gian đã được đặt trong khoảng thời gian này.' });
        }

        if (resourceIds && resourceIds.length > 0) {
            const [resourceConflicts] = await db.query(
                `SELECT br.resource_id 
                 FROM booking_resources br
                 JOIN bookings b ON br.booking_id = b.id
                 WHERE br.resource_id IN (?) 
                   AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
                   AND (b.start_time < ? AND b.end_time > ?)`,
                [resourceIds, endTime, startTime]
            );

            if (resourceConflicts.length > 0) {
                return res.status(200).json({ 
                    available: false, 
                    reason: 'Một số thiết bị đi kèm đã bị đặt trong khoảng thời gian này.',
                    conflictingResources: resourceConflicts.map(r => r.resource_id)
                });
            }
        }

        return res.status(200).json({ available: true, message: 'Nguồn lực hoàn toàn khả dụng.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.checkIn = async (req, res) => {
    const { bookingId, qrCodeHash } = req.body;

    try {
        const [booking] = await db.query(
            `SELECT * FROM bookings WHERE id = ? AND qr_code_hash = ?`, 
            [bookingId, qrCodeHash]
        );

        if (!booking || booking.length === 0) {
            return res.status(404).json({ message: 'Mã QR hoặc thông tin đặt chỗ không hợp lệ.' });
        }

        if (booking[0].status !== 'CONFIRMED') {
            return res.status(400).json({ message: `Không thể check-in. Trạng thái đơn: ${booking[0].status}` });
        }

        await db.query(`UPDATE bookings SET status = 'CHECKED_IN' WHERE id = ?`, [bookingId]);

        return res.status(200).json({ message: 'Check-in thành công. Bắt đầu phiên sử dụng không gian/thiết bị!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.checkOut = async (req, res) => {
    const { bookingId } = req.params;

    try {
        await db.query(`UPDATE bookings SET status = 'COMPLETED' WHERE id = ?`, [bookingId]);
        return res.status(200).json({ message: 'Hoàn thành phiên làm việc. Giải phóng tài nguyên thành công.' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.createBooking = async (req, res) => {
    const userId = req.user.id; 
    const { spaceId, resourceIds, startTime, endTime, totalPrice } = req.body;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [spaces] = await connection.query(
            `SELECT id, status FROM spaces WHERE id = ? FOR UPDATE`, 
            [spaceId]
        );

        if (!spaces.length || spaces[0].status !== 'AVAILABLE') {
            await connection.rollback();
            return res.status(400).json({ message: 'Không gian hiện không khả dụng để đặt.' });
        }

        const [spaceConflicts] = await connection.query(
            `SELECT id FROM bookings 
             WHERE space_id = ? 
               AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
               AND (start_time < ? AND end_time > ?) 
             FOR UPDATE`,
            [spaceId, endTime, startTime]
        );

        if (spaceConflicts.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: 'Xung đột lịch: Khung giờ này vừa có người khác đặt thành công.' });
        }

        if (resourceIds && resourceIds.length > 0) {
            const [resourceConflicts] = await connection.query(
                `SELECT br.resource_id 
                 FROM booking_resources br
                 JOIN bookings b ON br.booking_id = b.id
                 WHERE br.resource_id IN (?) 
                   AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
                   AND (b.start_time < ? AND b.end_time > ?) 
                 FOR UPDATE`,
                [resourceIds, endTime, startTime]
            );

            if (resourceConflicts.length > 0) {
                await connection.rollback();
                return res.status(409).json({ 
                    message: 'Xung đột lịch: Một số thiết bị đi kèm vừa bị người khác chọn trong khung giờ này.',
                    conflicts: resourceConflicts.map(r => r.resource_id)
                });
            }
        }

        const qrCodeHash = crypto.createHash('sha256').update(`${userId}-${spaceId}-${Date.now()}`).digest('hex');

        const [bookingResult] = await connection.query(
            `INSERT INTO bookings (user_id, space_id, start_time, end_time, total_price, status, qr_code_hash)
             VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
            [userId, spaceId, startTime, endTime, totalPrice, qrCodeHash]
        );

        const newBookingId = bookingResult.insertId;

        if (resourceIds && resourceIds.length > 0) {
            const resourceValues = resourceIds.map(resId => [newBookingId, resId, 1]);
            await connection.query(
                `INSERT INTO booking_resources (booking_id, resource_id, quantity) VALUES ?`,
                [resourceValues]
            );
        }

        await connection.commit();

        return res.status(201).json({
            message: 'Đặt chỗ thành công! Vui lòng chuyển sang bước thanh toán.',
            bookingId: newBookingId,
            qrCodeHash: qrCodeHash
        });

    } catch (error) {
        await connection.rollback();
        return res.status(500).json({ error: 'Lỗi hệ thống xử lý đặt chỗ: ' + error.message });
    } finally {
        connection.release();
    }
};