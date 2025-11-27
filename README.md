# TSP Visualizer (Frontend + FastAPI Backend)

Ứng dụng hiển thị và phân tích các thuật toán TSP. Frontend viết bằng Vite/React, backend dùng FastAPI (Python) để tính toán và trả về JSON.

## Chuẩn bị chung
- Node.js v18+
- Python 3.10+

## Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Truy cập `http://localhost:8000/docs` để thử các API (`GET /cities/random`, `POST /solve`, `POST /analyze`, ...).

## Frontend (Vite + React)
```bash
# Từ thư mục gốc dự án
npm install
echo VITE_API_URL=http://localhost:8000 > .env.local   # chỉnh URL nếu backend chạy nơi khác
npm run dev
```
Toàn bộ thao tác (random điểm, chạy thuật toán, phân tích) đều gọi FastAPI thông qua JSON.

## Build & Deploy
- Frontend: `npm run build` và deploy nội dung trong `dist/`.
- Backend: có thể chạy `uvicorn` trực tiếp hoặc đóng gói thành Docker image tùy môi trường triển khai.

## Cấu trúc chính
- `App.tsx`, `components/`, `utils/api.ts`: UI và logic gọi HTTP.
- `backend/app/algorithms/`: các thuật toán (Nearest Neighbor, Ant Colony, Space Filling Curve) viết lại bằng Python.
- `backend/app/main.py`: FastAPI entrypoint, định nghĩa routes và wiring giữa frontend/backed.

