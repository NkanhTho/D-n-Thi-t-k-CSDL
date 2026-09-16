# Cần mount thêm route ở backend/index.js

File `index.js` hiện tại chỉ mount: `auth`, `users`, `reviews`, `collections`,
`posts`, `workshops`, `bookings`. Hai route sau của Người 3 chưa được mount nên
trang Thanh toán và phần Hỗ trợ sẽ trả 404:

```js
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const complaintRoutes = require('./routes/complaintRoutes');
app.use('/api/complaints', complaintRoutes);
```

Thêm 2 dòng này **trước** `app.listen(...)`.

Ngoài ra, trong `index.js` hiện `app.listen()` được gọi trước khi mount
`bookingRoutes` — vẫn chạy được nhưng nên dọn lại cho đúng thứ tự:
mount hết route rồi mới `app.listen()`.

## returnUrl của cổng thanh toán

Trong `.env` của backend, trỏ returnUrl về trang kết quả của frontend kèm `orderId`:

```
VNP_RETURN_URL=http://localhost:5173/payment-result
MOMO_REDIRECT_URL=http://localhost:5173/payment-result
```

Frontend đọc `?orderId=` hoặc `?vnp_TxnRef=` rồi gọi
`GET /api/payments/status/:orderId` để lấy trạng thái thật từ bảng `transactions`.
