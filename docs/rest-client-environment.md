# REST Client Environment Setup

## 1. Mục đích

Dự án sử dụng **VSCode REST Client** để thử nghiệm REST API trực tiếp trong IDE.

REST Client cho phép:

- lưu request chung trong source code
- chuyển nhanh giữa các môi trường (`local`, `staging`, `production`)

---

## 2. Cài đặt Extension

Mở VSCode → Extensions → cài:

```
REST Client (Author: Huachao Mao)
```

Hoặc cài bằng command:

```
code --install-extension humao.rest-client
```

---

## 3. Thiết lập Environment (BẮT BUỘC)

Hiện tại dự án sử dụng **User Settings của VSCode** để cấu hình environment.

### Bước 1 — Mở User Settings JSON

Trong VSCode:

```
Ctrl + Shift + P
→ Preferences: Open User Settings (JSON)
```

---

### Bước 2 — Thêm cấu hình REST Client

Thêm đoạn sau vào file settings:

```json
"rest-client.environmentVariables": {
  "local": {
    "baseUrl": "http://localhost:3001"
  },
  "staging": {
    "baseUrl": "https://staging.api.com"
  },
  "production": {
    "baseUrl": "https://api.com"
  }
}
```

---

### Bước 3 — Reload VSCode

```
Ctrl + Shift + P
→ Reload Window
```

---

## 4. Sử dụng Environment

Mở file `.http` trong thư mục `rest/`.

Ví dụ:

```
GET {{baseUrl}}/health
```

Ở góc phải dưới VSCode:

```
No Environment → chọn local
```

Sau khi chọn:

```
{{baseUrl}} = http://localhost:3001
```

---

## 5. Ví dụ Request

```
### Health check
GET {{baseUrl}}/health
```

Nhấn **Send Request** để gọi API.

---

## 6. Lưu ý quan trọng

- Environment nằm trong **User Settings**, không commit vào git.
- Mỗi developer có thể cấu hình `baseUrl` riêng.
- Không lưu token production vào repository.

---

## 7. Troubleshooting

### Không thấy Environment

- đảm bảo extension REST Client đã cài
- reload VSCode
- mở file `.http`
- kiểm tra JSON syntax hợp lệ

---

## 8. Khuyến nghị

Sử dụng REST Client thay cho Postman trong quá trình phát triển backend để:

- version control API request
- debug nhanh
- onboarding developer dễ dàng
