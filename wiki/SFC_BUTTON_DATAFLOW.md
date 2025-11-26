# 🌀 Luồng Dữ Liệu - Chạy Thuật Toán Space Filling Curve (SFC)

## 📋 Tổng Quan
Tài liệu này mô tả chi tiết dòng dữ liệu khi người dùng chọn thuật toán Space Filling Curve (SFC) và nhấn **Run**. Thuật toán SFC thường sắp xếp các điểm theo một đường quét (ví dụ Hilbert hoặc Morton/Z-order), rồi lấy thứ tự đó làm đường đi ban đầu. SFC thường rất nhanh (O(n log n) hoặc O(n)) nhưng chất lượng đường đi không luôn tối ưu.

---

## 🔄 Luồng Dữ Liệu Toàn Bộ

BƯỚC 1: User chọn `Space Filling Curve` rồi bấm `Run`
```
User chọn SFC từ dropdown
  ↓
Ấn nút "Run" → ControlPanel gọi onRun() → App.tsx runVisualization()
```

BƯỚC 2: App.tsx kiểm tra và bắt đầu
```
runVisualization():
  - Nếu cities.length < 2 → return
  - setIsComputing(true)
  - Gọi solveTsp(selectedAlgorithm, cities)
    - selectedAlgorithm = AlgorithmType.SPACE_FILLING_CURVE
    - cities = current City[]
```

BƯỚC 3: utils/api.ts gửi POST /solve
```
POST /solve
Body: { algorithm: "SPACE_FILLING_CURVE", cities: [...] }
```

BƯỚC 4: Backend main.py dispatch
```
- Parse request → SolveRequest
- solver = ALGORITHM_DISPATCH[SPACE_FILLING_CURVE] → solve_space_filling_curve
- Gọi solver(cities)
- Tính distance, trả SolveResponse
```

BƯỚC 5: Solver SFC (`backend/app/algorithms/space_filling_curve.py`)
```
- Phương pháp phổ biến:
  - Chuyển mỗi điểm thành key theo Morton code (Z-order) hoặc Hilbert index
  - Sắp xếp các điểm theo key tăng dần
  - Trả path = list of indices theo thứ tự sắp xếp
- Độ phức tạp: O(n log n) do sort (n = #cities)
- Output: path: list[int]
```

BƯỚC 6: Backend trả response
```
{
  "algorithm": "SPACE_FILLING_CURVE",
  "path": [i0, i1, ...],
  "total_distance": 1500.12,
  "execution_time_ms": 0.8
}
```

BƯỚC 7: Frontend xử lý và animate
```
- utils/api.ts parse → SolveResult
- App.tsx lưu targetPathRef.current = result.path
- resetRunState(); setIsRunning(true); setIsComputing(false)
- Animation loop append từng index vào `path` state
- Canvas vẽ đường nối theo thứ tự đó
```

BƯỚC 8: Hiển thị kết quả
```
- Canvas hiển thị đường đi dựa trên SFC order
- ControlPanel hiển thị total distance và execution time
```

---

## 📍 CHI TIẾT TỪNG BƯỚC (kèm code & giải thích)

### BƯỚC 1 → 3: UI → API (giống các thuật toán khác)
- File: `components/ControlPanel.tsx`, `App.tsx`, `utils/api.ts`

### BƯỚC 4: Endpoint (backend/app/main.py)
```py
solver = ALGORITHM_DISPATCH.get(request.algorithm)
# request.algorithm == AlgorithmType.SPACE_FILLING_CURVE
path = solver(request.cities)
```

### BƯỚC 5: Mô tả solver - Space Filling Curve
```py
# Pseudo: dùng Morton (Z-order) hoặc Hilbert index
def solve_space_filling_curve(cities):
    # 1. Map each city coordinate to integer grid (normalize)
    # 2. Compute Morton/Hilbert index for each point
    keys = [compute_morton(x, y) for (x,y) in coords]
    # 3. Sort indices by key
    sorted_indices = argsort(keys)
    return sorted_indices  # list of city indices
```

**Lưu ý:**
- Nếu backend dùng Hilbert curve, mã hóa hơi phức tạp hơn nhưng kết quả sắp xếp thường cho đường đi liên tục hơn so với Z-order.
- SFC tạo đường đi nhanh nhưng thường cần cải thiện thêm (2-opt, local search) để tối ưu hơn.

---

## 📊 Bảng Tóm Tắt Dữ Liệu

| Bước | File/Component | Input | Output |
|------|----------------|-------|--------|
| 1-3 | Frontend | {algorithm: 'SPACE_FILLING_CURVE', cities} | POST /solve |
| 4 | `backend/app/main.py` | SolveRequest | call `solve_space_filling_curve` |
| 5 | `backend/app/algorithms/space_filling_curve.py` | cities | path: list[int] (sorted by curve key) |
| 6 | `backend/app/main.py` | path | SolveResponse JSON |
| 7 | `utils/api.ts` | JSON | SolveResult |
| 8 | `App.tsx` + `Canvas.tsx` | targetPathRef, cities | animated path |

---

## 🔐 Validation & Error Handling

- Nếu `cities` rỗng → 400
- SFC solver giả định tọa độ có thể chuẩn hóa sang lưới; kiểm tra overflow nếu dùng integer encoding
- Frontend catch errors giống các thuật toán khác

---

## 📈 Hiệu năng & Ghi chú

- Sorting dominates: O(n log n)
- Compute key per point có chi phí thêm O(n · cost(key))
- SFC phù hợp khi cần tạo đường đi nhanh cho visualization hoặc làm pre-order cho các thuật toán tối ưu hóa sau này

---

## 🔗 Tham chiếu file

- `backend/app/algorithms/space_filling_curve.py`
- `backend/app/main.py`
- `utils/api.ts`, `App.tsx`, `components/Canvas.tsx`, `components/ControlPanel.tsx`

---

## 📝 Kết luận

SFC là cách nhanh để tạo một đường đi ban đầu bằng cách sắp xếp các điểm theo chỉ số của đường cong phủ không gian. Khi người dùng nhấn Run cho SFC, frontend gửi cities lên backend, backend tính key/sort và trả `path`, sau đó frontend animate đường đi đó.
