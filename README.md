# Film Photo Platform

Nền tảng kết nối cộng đồng nhiếp ảnh phim với dịch vụ phòng tối và studio.

## Cách chạy backend
cd backend
npm install
npm run dev

## Cách chạy mobile app
cd mobile
flutter pub get
flutter run

## Thành viên
- Người 1 — Kiến trúc & Core Backend
- Người 2 — Booking & Resource
- Người 3 — Service Package & Payment
- Người 4 — Mobile App
- Người 5 — Community, Expert, Admin & AI



Đề bài
3.1.1. Tiếng Anh: Platform Connecting the Film Photography Community with Darkroom and Studio Services

3.1.2. Tiếng Việt: Nền tảng kết nối cộng đồng nhiếp ảnh phim với các dịch vụ phòng tối và phòng chụp

(*) 3.2. Nội dung đề xuất chính (bao gồm kết quả và sản phẩm)

**a) Bối cảnh:**

Nhiếp ảnh phim đã có sự hồi sinh đáng kể trong những năm gần đây, thu hút ngày càng nhiều người đam mê đánh giá cao giá trị nghệ thuật và quy trình làm việc analog của nhiếp ảnh dựa trên phim. Cùng với sự phát triển của cộng đồng này, nhu cầu về các không gian sáng tạo như phòng tối, studio chụp ảnh, thiết bị chuyên dụng và các dịch vụ hỗ trợ cũng gia tăng.

Mặc dù có sự tăng trưởng này, các nguồn lực nói trên vẫn còn phân mảnh. Những người chụp ảnh phim thường phải dựa vào các nhóm mạng xã hội, mối quan hệ cá nhân hoặc website riêng lẻ để tìm kiếm phòng tối hoặc studio khả dụng. Việc kiểm tra tình trạng đặt chỗ, hỏi thông tin thiết bị, giá cả và xác nhận thường được thực hiện thủ công qua điện thoại hoặc ứng dụng nhắn tin. Quy trình này kém hiệu quả, tốn thời gian và thiếu minh bạch cho cả khách hàng lẫn nhà cung cấp dịch vụ.

Về phía nhà cung cấp dịch vụ, việc quản lý không gian sáng tạo, thiết bị nhiếp ảnh, vật tư tiêu hao, lịch bảo trì, đặt chỗ và hoạt động kinh doanh thường được thực hiện bằng bảng tính hoặc nhiều phần mềm rời rạc không liên kết với nhau. Kết quả là việc sử dụng nguồn lực không được tối ưu, các xung đột lịch trình thường xuyên xảy ra và hiệu quả kinh doanh khó phân tích.

Hiện nay, chưa có một nền tảng tích hợp nào chuyên kết nối cộng đồng nhiếp ảnh phim với các nhà cung cấp phòng tối, studio chụp ảnh và các nguồn lực sáng tạo liên quan. Điều này hạn chế việc chia sẻ nguồn lực, làm giảm hiệu quả vận hành và làm suy yếu sự hợp tác trong cộng đồng.

Vì vậy, dự án này đề xuất xây dựng một nền tảng số kết nối các nhiếp ảnh gia với các nhà cung cấp dịch vụ, đồng thời hỗ trợ chia sẻ nguồn lực thông minh, quản lý đặt chỗ, tương tác cộng đồng và quản lý vận hành kinh doanh trong một hệ sinh thái thống nhất.

**b) Giải pháp đề xuất:**

Hệ thống được đề xuất là một nền tảng đa chiều (multi-sided platform) được thiết kế để kết nối các nhiếp ảnh gia chụp phim với các nhà cung cấp dịch vụ phòng tối, studio chụp ảnh, thiết bị nhiếp ảnh và các dịch vụ sáng tạo hỗ trợ khác.

Thay vì hoạt động như một ứng dụng đặt chỗ truyền thống, nền tảng này tập trung vào việc quản lý và chia sẻ nguồn lực sáng tạo. Nhà cung cấp dịch vụ có thể đăng tải và quản lý nhiều không gian sáng tạo, kho thiết bị, vật tư tiêu hao và các gói dịch vụ tùy chỉnh thông qua một hệ thống tập trung.

Nhiếp ảnh gia có thể tìm kiếm, so sánh và đặt trước nguồn lực dựa trên nhiều tiêu chí khác nhau như vị trí, loại phòng, phong cách nghệ thuật, sức chứa, thiết bị sẵn có, giá cả, giờ hoạt động và đánh giá từ cộng đồng. Trong quá trình đặt chỗ, hệ thống tự động kiểm tra tính khả dụng của toàn bộ nguồn lực cần thiết để tránh xung đột lịch trình.

Nền tảng cũng hỗ trợ quản lý kinh doanh thông qua việc theo dõi đặt chỗ, lập lịch bảo trì, quản lý vòng đời nguồn lực, phân tích doanh thu và các bảng điều khiển vận hành. Bên cạnh đó, các tính năng cộng đồng cho phép nhiếp ảnh gia và chuyên gia chia sẻ kinh nghiệm, đăng tải hướng dẫn, tổ chức workshop và trao đổi kiến thức liên quan đến nhiếp ảnh phim.

Trí tuệ nhân tạo được tích hợp nhằm cá nhân hóa các đề xuất dịch vụ, tối ưu hóa việc phân bổ nguồn lực, dự báo nhu cầu đặt chỗ, phục hồi ảnh cũ, tăng cường chất lượng ảnh phim đã quét, và cung cấp một trợ lý thông minh có khả năng trả lời các câu hỏi liên quan đến nhiếp ảnh.

**Vai trò trong hệ thống**

1. **Nhiếp ảnh gia (Khách hàng):** Là người dùng đặt trước không gian sáng tạo và các nguồn lực hỗ trợ cho hoạt động chụp ảnh. Trách nhiệm chính bao gồm:
- Quản lý hồ sơ cá nhân
- Tìm kiếm và so sánh phòng tối, studio
- Xem thông tin chi tiết về không gian sáng tạo
- Đặt phòng và thiết bị
- Mua hoặc tùy chỉnh gói dịch vụ
- Thanh toán trực tuyến
- Xem lịch sử đặt chỗ
- Quản lý bộ sưu tập ảnh số
- Gửi đánh giá và xếp hạng
- Tham gia các hoạt động và workshop cộng đồng

2. **Nhà cung cấp dịch vụ:** Là cá nhân hoặc tổ chức sở hữu và vận hành một hoặc nhiều phòng tối, studio chụp ảnh, kho thiết bị hoặc cơ sở sáng tạo. Trách nhiệm chính bao gồm:
- Quản lý hồ sơ doanh nghiệp
- Quản lý phòng tối và studio chụp ảnh
- Cấu hình thông số kỹ thuật và tình trạng khả dụng của phòng
- Quản lý thiết bị nhiếp ảnh và nguồn lực tiêu hao
- Tạo và quản lý gói dịch vụ
- Cấu hình chính sách giá và chương trình khuyến mãi
- Xử lý yêu cầu đặt chỗ
- Phân bổ nguồn lực cho các đơn đặt chỗ đã xác nhận
- Theo dõi tình trạng sử dụng phòng và thiết bị
- Lập lịch bảo trì thiết bị
- Phân tích doanh thu và hiệu quả kinh doanh qua bảng điều khiển

3. **Chuyên gia nhiếp ảnh:** Đóng góp kiến thức chuyên môn cho nền tảng. Trách nhiệm chính bao gồm:
- Đăng bài viết giáo dục
- Tổ chức workshop và khóa đào tạo
- Đánh giá thiết bị nhiếp ảnh
- Chia sẻ kỹ thuật phòng tối và các phương pháp tốt nhất
- Xây dựng kho kiến thức cộng đồng

4. **Quản trị viên:** Giám sát hoạt động nền tảng và đảm bảo độ tin cậy của hệ thống. Trách nhiệm chính bao gồm:
- Quản lý người dùng và nhà cung cấp dịch vụ
- Phê duyệt đăng ký nhà cung cấp
- Quản lý danh mục và nội dung nền tảng
- Giám sát giao dịch và thanh toán
- Xử lý tranh chấp và khiếu nại
- Quản lý dịch vụ AI và cấu hình nền tảng
- Tạo báo cáo toàn hệ thống

5. **Trợ lý AI:** Cung cấp hỗ trợ thông minh cho cả khách hàng và nhà cung cấp dịch vụ. Trách nhiệm chính bao gồm:
- Đề xuất không gian sáng tạo phù hợp
- Gợi ý thiết bị và gói dịch vụ
- Phục hồi và tăng cường chất lượng ảnh số
- Trả lời các câu hỏi liên quan đến nhiếp ảnh
- Hỗ trợ tìm kiếm ngữ nghĩa trong kho kiến thức

**Ứng dụng AI, ví dụ như:**
- Hệ thống đề xuất cá nhân hóa cho phòng, thiết bị và gói dịch vụ
- Tối ưu hóa phân bổ nguồn lực thông minh
- Dự báo nhu cầu đặt chỗ
- Đề xuất giá động (dynamic pricing)
- Phục hồi và tăng cường chất lượng ảnh
- Trợ lý nhiếp ảnh dựa trên AI
- Tìm kiếm ngữ nghĩa trong kho kiến thức cộng đồng
- Học tập dựa trên nghiên cứu (RBL)

**Chủ đề nghiên cứu**
- Thuật toán lập lịch và phân bổ nguồn lực
- Hệ thống đề xuất (Recommendation Systems)
- Trí tuệ nhân tạo cho nền tảng dịch vụ sáng tạo
- Thị giác máy tính cho phục hồi ảnh
- Dự báo nhu cầu
- Tìm kiếm ngữ nghĩa và truy xuất tri thức
- Thiết kế nền tảng đa chiều (Multi-sided Platform)

**c) Yêu cầu chức năng:**

*** Các luồng nghiệp vụ cốt lõi:

**Luồng 1. Quản lý không gian sáng tạo**
Nhà cung cấp dịch vụ tạo và duy trì hồ sơ chi tiết cho từng không gian sáng tạo có trên nền tảng. Mỗi phòng tối hoặc studio chứa thông tin toàn diện bao gồm kích thước phòng, sức chứa tối đa, phong cách nghệ thuật, điều kiện ánh sáng, thông gió, đặc tính âm học, cơ sở vật chất hỗ trợ, giờ hoạt động, chính sách sử dụng, mô hình giá, hình ảnh và các tiện ích sẵn có. Nền tảng liên tục theo dõi tình trạng khả dụng của từng phòng để hỗ trợ việc lập kế hoạch đặt chỗ chính xác.

**Luồng 2. Quản lý nguồn lực và thiết bị**
Nền tảng quản lý tất cả các nguồn lực có thể tái sử dụng liên quan đến không gian sáng tạo, bao gồm máy ảnh, ống kính, máy phóng ảnh (enlarger), máy quét phim, hệ thống chiếu sáng, chân máy, phông nền, thiết bị xử lý phòng tối và vật tư tiêu hao như hóa chất và giấy ảnh.
Mỗi nguồn lực có thông tin vòng đời riêng bao gồm tình trạng khả dụng, lịch bảo trì, tình trạng vận hành, giá thuê, khả năng tương thích với các gói dịch vụ và lịch sử sử dụng.

**Luồng 3. Đặt chỗ và phân bổ nguồn lực**
Nhiếp ảnh gia chọn không gian sáng tạo, thời gian thuê, thiết bị và các dịch vụ bổ sung theo nhu cầu. Trước khi xác nhận đặt chỗ, hệ thống kiểm tra tính khả dụng của mọi nguồn lực cần thiết và tự động phát hiện xung đột lịch trình.
Sau khi được phê duyệt, đơn đặt chỗ sẽ khóa toàn bộ các nguồn lực liên quan trong khoảng thời gian đã chọn và cập nhật lịch đặt chỗ cho mọi tài sản liên quan.

**Luồng 4. Quản lý phiên dịch vụ**
Trong thời gian đặt chỗ, khách hàng check-in bằng thông tin đặt chỗ hoặc mã QR. Hệ thống ghi lại thời gian sử dụng thực tế, thiết bị được cấp, các dịch vụ bổ sung đã sử dụng và trạng thái checkout.
Các bản ghi vận hành này được dùng cho việc lập hóa đơn, đánh giá dịch vụ, theo dõi thiết bị và giải quyết tranh chấp khi cần thiết.

**Luồng 5. Quản lý gói dịch vụ**
Nhà cung cấp dịch vụ có thể kết hợp không gian sáng tạo, thiết bị, nguồn lực tiêu hao, giảng viên hướng dẫn và các dịch vụ hỗ trợ thành các gói dịch vụ linh hoạt, được thiết kế cho các hoạt động nhiếp ảnh khác nhau như chụp ảnh chân dung, chụp sản phẩm, tráng phim, in ảnh phòng tối hoặc workshop giáo dục.
Nền tảng tự động xác thực tính khả dụng của nguồn lực trước khi cho phép khách hàng đặt trước toàn bộ gói dịch vụ.

**Luồng 6. Chia sẻ kiến thức cộng đồng**
Nền tảng cho phép nhiếp ảnh gia và chuyên gia trao đổi kiến thức thông qua bài viết, hướng dẫn, đánh giá thiết bị, kỹ thuật nhiếp ảnh, thông báo workshop và thảo luận.
Nội dung được tổ chức thành một kho kiến thức có thể tìm kiếm, hỗ trợ việc học tập liên tục và gắn kết cộng đồng.

**d) Yêu cầu phi chức năng:**
- Thời gian phản hồi trung bình của hệ thống phải dưới ba giây trong điều kiện vận hành bình thường.
- Nền tảng phải hỗ trợ đặt chỗ đồng thời trong khi ngăn chặn xung đột lịch trình thông qua cơ chế phân bổ nguồn lực an toàn theo giao dịch (transaction-safe).
- Việc xác thực và phân quyền phải được triển khai bằng JWT và OAuth 2.0 với kiểm soát truy cập dựa trên vai trò (RBAC).
- Hệ thống phải áp dụng kiến trúc module, tách biệt các phần mobile, web, backend và dịch vụ AI để cải thiện khả năng mở rộng và bảo trì.
- Hạ tầng đám mây phải cung cấp khả năng lưu trữ an toàn, sao lưu tự động và khôi phục sau thảm họa.
- Nền tảng phải được thiết kế để có thể mở rộng trong tương lai, cho phép tích hợp thêm không gian sáng tạo, loại thiết bị và dịch vụ kinh doanh mới mà không cần thay đổi kiến trúc lớn.

**e) Lý thuyết & Thực hành:**

Lý thuyết và thực hành (Tài liệu)
- Ứng dụng di động: Flutter (Android & iOS)
- Cổng thông tin web: ReactJS / Next.js
- Backend: ASP.NET Core Web API hoặc Node.js (Express)
- Cơ sở dữ liệu: PostgreSQL hoặc MySQL
- Lưu trữ đám mây: Microsoft Azure Blob Storage / Firebase Storage
- Xác thực: JWT & OAuth 2.0
- Tích hợp AI: OpenAI API, Hệ thống đề xuất, Thị giác máy tính
- Bản đồ & dịch vụ định vị: Google Maps API
- Thanh toán trực tuyến: VNPay, MoMo, Stripe
- Triển khai đám mây: Microsoft Azure / Firebase
- Quản lý phiên bản: GitHub

Dự án kết hợp các nguyên lý kỹ thuật phần mềm với hệ thống đặt trước nguồn lực, điện toán đám mây, trí tuệ nhân tạo, hệ thống đề xuất và các nền tảng cộng đồng số nhằm xây dựng một hệ sinh thái toàn diện cho cộng đồng nhiếp ảnh phim.

**f) Sản phẩm (Kết quả bàn giao dự kiến):**

Sản phẩm dự kiến bàn giao bao gồm:
- Một ứng dụng di động đa nền tảng dành cho nhiếp ảnh gia.
- Một cổng thông tin web dành cho nhà cung cấp dịch vụ để quản lý không gian sáng tạo, thiết bị, đặt chỗ và hoạt động kinh doanh.
- Một hệ thống quản trị dựa trên web để quản lý nền tảng.
- Các module AI phục vụ đề xuất, tối ưu hóa nguồn lực, phục hồi ảnh và hỗ trợ thông minh.
- Một nền tảng chia sẻ kiến thức và cộng đồng dành riêng cho nhiếp ảnh phim.

