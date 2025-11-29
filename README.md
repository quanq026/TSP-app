# TSP Visualizer

Ứng dụng trực quan hóa và so sánh các thuật toán giải bài toán Người bán hàng (Traveling Salesman Problem).

**Demo:** [https://tsp-visualizer-quanq026.vercel.app/](https://tsp-visualizer-quanq026.vercel.app/)

## Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | Vite + React + TypeScript |
| Backend | FastAPI (Python) |
| Hosting Frontend | Vercel |
| Hosting Backend | Render |

## Thuật toán hỗ trợ

- **Nearest Neighbor** - Greedy heuristic, chọn thành phố gần nhất
- **Ant Colony Optimization (ACO)** - Metaheuristic mô phỏng đàn kiến
- **Space Filling Curve (Hilbert)** - Sắp xếp theo đường cong Hilbert

---

## Chạy Local

### Yêu cầu
- Node.js v18+
- Python 3.10+

### 1. Backend (FastAPI)

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

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend (Vite + React)

```bash
# Từ thư mục gốc
npm install
npm run dev
```

Mặc định frontend gọi backend production. Để chạy với backend local, sửa trong `utils/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

Frontend chạy tại: [http://localhost:3000](http://localhost:3000)

---

## Deploy Production

### Backend → Render

1. Push code lên GitHub
2. Vào [dashboard.render.com](https://dashboard.render.com) → **New Web Service**
3. Kết nối repo, cấu hình:
   - **Root Directory:** `backend`
   - **Runtime:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Deploy và lấy URL (vd: `https://tsp-app.onrender.com`)

> ⚠️ Free tier Render sẽ sleep sau 15 phút không hoạt động. Request đầu tiên mất ~30-50s để wake up.

### Frontend → Vercel

1. Vào [vercel.com](https://vercel.com) → **Add New Project**
2. Import repo GitHub
3. Cấu hình:
   - **Framework Preset:** Vite
   - **Root Directory:** `.` (để trống)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy

**Lưu ý:** Cập nhật `API_BASE_URL` trong `utils/api.ts` thành URL backend Render trước khi deploy.

---

## Cấu trúc dự án

```
TSP-app/
├── App.tsx                 # Component chính
├── components/             # React components
├── utils/
│   ├── api.ts              # Gọi API backend
│   └── geometry.ts         # Tính toán hình học
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI entrypoint
│   │   └── algorithms/     # Thuật toán TSP
│   ├── requirements.txt
│   └── render.yaml         # Config deploy Render
├── wiki/                   # Tài liệu thuật toán
└── package.json
```

---

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/cities/random` | Tạo danh sách thành phố ngẫu nhiên |
| POST | `/solve` | Giải TSP với thuật toán chỉ định |
| POST | `/analyze` | So sánh tất cả thuật toán |

---

## License

MIT