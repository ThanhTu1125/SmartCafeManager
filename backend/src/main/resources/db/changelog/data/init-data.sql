SET FOREIGN_KEY_CHECKS = 0;

-- Dữ liệu bảng role
INSERT INTO `role` (`role_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `role_name`) 
VALUES (1,NULL,NULL,NULL,NULL,NULL,'ADMIN'),(2,NULL,NULL,NULL,NULL,NULL,'STAFF'),(3,NULL,NULL,NULL,NULL,NULL,'USER');

-- Dữ liệu bảng account
INSERT INTO `account` (`account_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `email`, `password`, `password_changed_at`, `reset_token`, `reset_token_expiry`, `status`, `username`, `role_id`) 
VALUES (1,'2026-07-12 19:19:00.000000','system',NULL,'2026-07-30 00:15:23.155000','admin','codegymintern@gmail.com','$2a$10$gVt/t3VoFQ20aMJW6n/wnOPjRzwa50Hviu6FjFQLV47i5DBQB3SUe','2026-07-30 00:15:23.056000','7734a6e7-1122-472f-91e7-6ed0be6fc164','2026-07-22 22:49:15.290000','ACTIVE','admin',1),(2,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'staff01@smartcafe.com','$2a$10$tDjHK77akloaamnCYJHKw.vA6l6zl9NhVEZyLff/UCeEbRu0pUmQu','2026-07-12 19:19:00.000000',NULL,NULL,'ACTIVE','staff01',2),(3,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'staff02@smartcafe.com','$2a$10$tDjHK77akloaamnCYJHKw.vA6l6zl9NhVEZyLff/UCeEbRu0pUmQu','2026-07-12 19:19:00.000000',NULL,NULL,'ACTIVE','staff02',2),(4,'2026-07-12 19:19:00.000000','system',NULL,'2026-07-16 19:08:38.761000',NULL,'thanhbinhk645@gmail.com','$2a$10$ag3gq.PYrDN0lshEY8vj/.poKGLa3kkUMAJkkt4a1T8T96O0JrB9e','2026-07-16 19:08:38.760000',NULL,NULL,'ACTIVE','customer01',3),(5,'2026-07-12 19:19:00.000000','system',NULL,NULL,NULL,'customer02@gmail.com','$2a$10$tDjHK77akloaamnCYJHKw.vA6l6zl9NhVEZyLff/UCeEbRu0pUmQu','2026-07-12 19:19:00.000000',NULL,NULL,'ACTIVE','customer02',3);

-- Dữ liệu bảng cafe_table
INSERT INTO `cafe_table` (`table_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `is_occupied`, `physical_state`, `service_status`, `table_name`) 
VALUES (1,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,0,'GOOD','NORMAL','Bàn 01'),(2,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,0,'GOOD','NORMAL','Bàn 02'),(3,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,1,'GOOD','WAITING_FOOD','Bàn 03'),(4,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,0,'MAINTENANCE','NORMAL','Bàn 04');

-- Dữ liệu bảng menu_category
INSERT INTO `menu_category` (`category_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `category_name`) 
VALUES (1,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,'Cà phê truyền thống'),(2,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,'Trà trái cây'),(3,'2026-07-12 19:19:00.000000',NULL,NULL,NULL,NULL,'Bánh ngọt');

-- Dữ liệu bảng item
INSERT INTO `item` (`item_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `description`, `image_url`, `is_available`, `item_code`, `item_name`, `price`, `total_order_count`, `category_id`) 
VALUES (1,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Cà phê đen đá pha phin truyền thống, đậm vị nguyên bản.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/cf_den_da.png',1,'CF01','Cà phê Đen Đá',25000,150,1),(2,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Cà phê sữa đá pha phin thơm béo, đậm đà khó quên.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/cf_sua_da.png',1,'CF02','Cà phê Sữa Đá',29000,200,1),(3,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Trà đào cam sả thanh mát, giải nhiệt tức thì cho mùa hè.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/tra_dao.png',1,'TR01','Trà Đào Cam Sả',45000,120,2),(4,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Trà vải nhiệt đới ngọt thanh, kết hợp cùng trái vải ngâm giòn.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/tra_vai.png',1,'TR02','Trà Vải Nhiệt Đới',45000,90,2),(5,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Bánh Tiramisu Ý mềm mịn, lớp kem béo ngậy vị cà phê cacao.','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/tiramisu.png',1,'BN01','Tiramisu',35000,40,3);

-- Dữ liệu bảng employee
INSERT INTO `employee` (`employee_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `address`, `date_of_birth`, `full_name`, `gender`, `image_url`, `phone_number`, `salary`, `account_id`) 
VALUES (1,'2026-07-12 19:19:00.000000','system',NULL,'2026-07-22 22:42:42.967000','admin','Đà Nẵng','1989-12-31 07:00:00.000000','Admin Codegym','MALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/avatar_admin.png','0377584918',15000000.00,1),(2,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'789 Trần Phú, Đà Nẵng','2000-02-14 00:00:00.000000','Trần Thị Nhân Viên 1','FEMALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/avatar_staff1.png','0912111222',8000000.00,2),(3,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'321 Bạch Đằng, Đà Nẵng','1999-12-12 00:00:00.000000','Lê Văn Nhân Viên 2','MALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/avatar_staff2.png','0988333444',8000000.00,3);

-- Dữ liệu bảng customer
INSERT INTO `customer` (`customer_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `address`, `date_of_birth`, `full_name`, `gender`, `image_url`, `loyalty_points`, `phone_number`, `account_id`) 
VALUES (1,'2026-07-12 19:19:00.000000','customer01',NULL,'2026-07-17 08:24:14.370000',NULL,'123 Nguyễn Văn Linh, Đà Nẵng','1995-05-14 07:00:00.000000','Phạm Khách Hàng 1 (sửa)','MALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1784251454/lbvflfgrwhwowrafhpy9.png',100,'0905123456',4),(2,'2026-07-12 19:19:00.000000','customer02',NULL,NULL,NULL,'456 Lê Duẩn, Đà Nẵng','1998-10-20 00:00:00.000000','Đặng Khách Hàng 2','FEMALE','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/avatar_cus2.png',50,'0935987654',5);

-- Dữ liệu bảng news (Đã đồng bộ tên cột newsId với file v1.0-generated.yaml)
INSERT INTO `news` (`news_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `content`, `image_url`, `summary`, `title`, `account_id`, `status`) 
VALUES (1,'2026-07-12 19:19:00.000000','admin',NULL,NULL,NULL,'Nội dung chi tiết chương trình khai trương dành cho khách hàng...','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/news_grand_opening.png','Tuần lễ khai trương giảm giá 20%','Khai trương hồng phát',1,'PUBLISHED'),(2,'2026-07-12 19:19:00.000000','staff01',NULL,NULL,NULL,'Cùng thưởng thức menu đồ uống giải nhiệt mùa hè của Smart Cafe...','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/news_summer.png','Thử ngay Trà Vải Nhiệt Đới','Ra mắt thức uống mới',2,'PENDING'),(3,'2026-07-12 12:32:29.972000','admin','2026-07-12 12:39:21.502000','2026-07-12 12:39:21.502000','admin','Không có gì hết ở nội dung','https://res.cloudinary.com/xqkvkmdf/image/upload/v1783859551/htyhtuz9cz7bc9vrqesx.png','Không có gì hết ở tóm tắt','Mẫu thử',1,'PENDING'),(4,'2026-07-15 13:23:05.974000','admin',NULL,'2026-07-28 09:46:16.140000','admin','aaaa','https://res.cloudinary.com/xqkvkmdf/image/upload/v1784121790/zn7zqisdad984ha8qs0i.png','aaaa','aaaa',1,'PUBLISHED');

-- Dữ liệu bảng table_order
INSERT INTO `table_order` (`order_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `close_at`, `open_at`, `paid_at`, `payment_method`, `status`, `total_amount`, `customer_id`, `employee_id`, `table_id`) 
VALUES (1,'2026-07-12 17:19:00.000000','customer01',NULL,'2026-07-12 18:30:00.000000','staff01','2026-07-12 18:30:00.000000','2026-07-12 17:19:00.000000','2026-07-12 18:30:00.000000','CASH','PAID',70000,1,2,1),(2,'2026-07-12 19:19:00.000000','customer02',NULL,NULL,NULL,NULL,'2026-07-12 19:19:00.000000',NULL,NULL,'OPEN',90000,2,3,3);

-- Dữ liệu bảng order_detail
INSERT INTO `order_detail` (`order_detail_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `note`, `quantity`, `status`, `unit_price`, `item_id`, `order_id`) 
VALUES (1,'2026-07-12 19:19:00.000000','customer01',NULL,NULL,NULL,'Ít đá, không đường',1,'SERVED',25000,1,1),(2,'2026-07-12 19:19:00.000000','customer01',NULL,NULL,NULL,NULL,1,'SERVED',45000,3,1),(3,'2026-07-12 19:19:00.000000','customer02',NULL,NULL,NULL,'Nhiều trân châu',2,'PENDING',45000,4,2);

-- Dữ liệu bảng feedback
INSERT INTO `feedback` (`feedback_id`, `created_at`, `created_by`, `deleted_at`, `updated_at`, `updated_by`, `content`, `email`, `image_url`, `rating`, `sender_name`, `sent_at`, `customer_id`, `item_id`) 
VALUES (1,'2026-07-12 19:19:00.000000','customer01',NULL,NULL,NULL,'Trà đào rất ngon, phục vụ chu đáo!','customer01@gmail.com','https://res.cloudinary.com/xqkvkmdf/image/upload/v1/feedback_photo.png',5,'Phạm Khách Hàng 1','2026-07-12 19:19:00.000000',1,3);

SET FOREIGN_KEY_CHECKS = 1;