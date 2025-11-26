# 🐜 Luồng Dữ Liệu - Chạy Thuật Toán Ant Colony Optimization (ACO)

## 📋 Tổng Quan
Tài liệu này mô tả chi tiết dòng dữ liệu khi người dùng chọn thuật toán Ant Colony Optimization (ACO) và nhấn **Run**. Bao gồm: frontend gửi request, backend chạy `solve_ant_colony`, các tham số ACO (ants, iterations, pheromone, evaporation), trả về `path`, frontend animate và hiển thị metrics.

---

## 🔄 Luồng Dữ Liệu Toàn Bộ

BƯỚC 1: User chọn `Ant Colony Opt.` rồi bấm `Run` (UI)
```
User chọn `ACO` trong dropdown
  ↓
Ấn nút "Run" → ControlPanel gọi `onRun()` → App.tsx `runVisualization()`
```

BƯỚC 2: App.tsx kiểm tra và bắt đầu
```
runVisualization():
  - Nếu cities.length < 2 → return
  - setIsComputing(true)
  - Gọi solveTsp(selectedAlgorithm, cities)
    - selectedAlgorithm = AlgorithmType.ACO
    - cities = current City[]
```

BƯỚC 3: API Client gửi request
```
POST /solve
Body: { algorithm: "ACO", cities: [...] }
```

BƯỚC 4: Backend nhận request (`backend/app/main.py`)
```
- FastAPI parse SolveRequest
- Lấy solver = ALGORITHM_DISPATCH[AlgorithmType.ACO] → solve_ant_colony
- Gọi solver(cities) và đo thời gian thực thi
- Tính tổng khoảng cách từ path
- Trả SolveResponse JSON
```

BƯỚC 5: ACO solver (`backend/app/algorithms/ant_colony.py`)
```
- Input: list[City]
- Khởi tạo pheromone matrix (nxn), heuristic (1/distance)
- Tham số thường có: n_ants, n_iterations, alpha (pheromone weight), beta (heuristic weight), evaporation_rate, Q (pheromone deposit)
- Vòng lặp mỗi iteration:
    - Mỗi con mối (ant) xây dựng 1 tour theo quy luật xác suất dựa trên pheromone^alpha * heuristic^beta
    - Tính độ dài tour
    - Cập nhật pheromone (deposit dựa trên chất lượng tour)
    - Evaporation: pheromone *= (1 - evaporation_rate)
- Lưu best_path (ngắn nhất) và trả về indices list của best_path
- Trả về: path: list[int]
```

BƯỚC 6: Backend trả response
```
SolveResponse:
{
  "algorithm": "ACO",
  "path": [i0, i1, ...],
  "total_distance": 987.65,
  "execution_time_ms": 12.34
}
```

BƯỚC 7: Frontend xử lý (App.tsx)
```
- utils/api.ts parse → SolveResult
- App.tsx: targetPathRef.current = result.path
- resetRunState(); setIsRunning(true); setIsComputing(false)
```

BƯỚC 8: Animation & Rendering
```
- useEffect animation loop append từng index từ targetPathRef.current vào `path` state
- Canvas vẽ đường nối dần theo `path`
- Có thể highlight best tour và thời gian/chi phí
```

BƯỚC 9: Hiển thị & Metrics
```
- ControlPanel hiển thị `totalDistance` và `executionTime`
- Có thể so sánh với các thuật toán khác trong AnalysisModal
```

---

## 📍 CHI TIẾT TỪNG BƯỚC (kèm code & tham số)

### BƯỚC 1 → 3: UI → API giống chung như các thuật toán khác
- File: `components/ControlPanel.tsx`, `App.tsx`, `utils/api.ts`
- `solveTsp(AlgorithmType.ACO, cities)` sẽ POST `/solve`.

### BƯỚC 4: Endpoint xử lý (backend/app/main.py)
```py
solver = ALGORITHM_DISPATCH.get(request.algorithm)
# với request.algorithm == AlgorithmType.ACO
path = solver(request.cities)
```

### BƯỚC 5: Mô tả solver - Ant Colony (tóm tắt thuật toán)
```py
def solve_ant_colony(cities):
    n = len(cities)
    pheromone = init_pheromone_matrix(n, initial_value)
    heuristic = compute_heuristic(cities)  # 1/distance

    best_path = None
    best_length = inf

    for iteration in range(n_iterations):
        all_tours = []
        for ant in range(n_ants):
            tour = construct_solution(pheromone, heuristic, alpha, beta)
            length = tour_length(tour)
            all_tours.append((tour, length))
            if length < best_length:
                best_length = length
                best_path = tour
        pheromone = evaporate(pheromone, evaporation_rate)
        pheromone = deposit(pheromone, all_tours, Q)

    return best_path  # list of indices
```

**Tham số thường thấy (có thể được hardcoded trong backend):**
- `n_ants` (số kiến), `n_iterations` (vòng lặp),
- `alpha` (pheromone influence), `beta` (heuristic influence),
- `evaporation_rate`, `Q` (pheromone deposit factor)

---

## 📊 Bảng Tóm Tắt Dữ Liệu

| Bước | File/Component | Input | Output |
|------|----------------|-------|--------|
| 1-3 | Frontend | {algorithm: 'ACO', cities} | HTTP POST /solve |
| 4 | `backend/app/main.py` | SolveRequest | call `solve_ant_colony` |
| 5 | `backend/app/algorithms/ant_colony.py` | cities, params | path: list[int] |
| 6 | `backend/app/main.py` | path | SolveResponse JSON |
| 7 | `utils/api.ts` | JSON | SolveResult |
| 8 | `App.tsx` + `Canvas.tsx` | targetPathRef, cities | animated path |

---

## 🔐 Validation & Error Handling

- Nếu `cities` rỗng → 400
- Solver có thể raise lỗi nếu dữ liệu không hợp lệ → FastAPI trả 500
- Frontend try/catch tương tự NN

---

## 📈 Hiệu năng & Ghi chú

- ACO thường có chi phí cao: O(n_ants × n_iterations × n) mỗi vòng (thực tế phụ thuộc cách cài đặt)
- Thời gian trả về `execution_time_ms` phụ thuộc n_ants & n_iterations
- Backend trả metrics để frontend hiển thị

---

## 🔗 Tham chiếu file

- `backend/app/algorithms/ant_colony.py` (solver)
- `backend/app/main.py` (POST /solve)
- `utils/api.ts`, `App.tsx`, `components/Canvas.tsx`, `components/ControlPanel.tsx`

---

## 📝 Kết luận

Khi chạy ACO, frontend gửi toàn bộ danh sách `cities` lên backend; backend chạy solver ACO với nhiều vòng lặp/kiến, cập nhật pheromone và tìm `best_path`, trả về `path` và metrics. Frontend animate đường đi và hiển thị chi phí/time.
