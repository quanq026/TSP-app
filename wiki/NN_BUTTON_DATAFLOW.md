# 🧭 Luồng Dữ Liệu - Chạy Thuật Toán Nearest Neighbor (NN)

## 📋 Tổng Quan
Tài liệu này mô tả chi tiết quá trình xử lý dữ liệu khi người dùng chọn thuật toán Nearest Neighbor (NN) và nhấn nút **Run** để giải TSP. Mô tả bao gồm: gọi UI, gửi request tới backend, backend chạy solver `nearest_neighbor`, trả kết quả, và frontend hiển thị animation đường đi.

---

## 🔄 Luồng Dữ Liệu Toàn Bộ

BƯỚC 1: User chọn thuật toán NN và bấm `Run` (Frontend - `ControlPanel.tsx` / `App.tsx`)
```
User chọn `Nearest Neighbor` trong dropdown
        ↓
Ấn nút "Run"
        ↓
ControlPanel gọi prop `onRun()` → App.tsx `runVisualization()` được gọi
```

BƯỚC 2: Kiểm tra điều kiện và bắt đầu (App.tsx)
```
runVisualization():
  - Kiểm tra: nếu cities.length < 2 → return (không chạy)
  - setIsComputing(true) → bật loading
  - Gọi solveTsp(selectedAlgorithm, cities)
    - selectedAlgorithm = AlgorithmType.NEAREST_NEIGHBOR
    - cities = current array of City objects
```

BƯỚC 3: HTTP Request (utils/api.ts)
```
solveTsp(AlgorithmType.NEAREST_NEIGHBOR, cities):
  - POST /solve
  - Body: { algorithm: "NEAREST_NEIGHBOR", cities: [...] }
  - Headers: Content-Type: application/json
  - await fetch()
```

BƯỚC 4: Backend API nhận request (`backend/app/main.py`)
```
@app.post("/solve")
  - FastAPI parse request → SolveRequest(algorithm, cities)
  - Nếu not request.cities → raise HTTPException 400
  - Lấy solver từ ALGORITHM_DISPATCH bằng key AlgorithmType.NEAREST_NEIGHBOR
    → solver = solve_nearest_neighbor (imported from backend/app/algorithms/nearest_neighbor.py)
```

BƯỚC 5: Thực thi solver (backend/app/algorithms/nearest_neighbor.py)
```
start timer
path = solve_nearest_neighbor(request.cities)
stop timer
distance = get_total_distance(request.cities, path)
return SolveResponse(
  algorithm=request.algorithm,
  path=path,
  total_distance=distance,
  execution_time_ms=duration
)
```

BƯỚC 6: Backend trả response JSON
```
Response (SolveResponse):
{
  "algorithm": "NEAREST_NEIGHBOR",
  "path": [i0, i1, i2, ...],  // indices of cities in visit order
  "total_distance": 1234.56,
  "execution_time_ms": 1.23
}
```

BƯỚC 7: Frontend xử lý response (utils/api.ts → App.tsx)
```
- utils/api.ts handleResponse() parse JSON → SolveResult
- App.tsx receives result:
    targetPathRef.current = result.path   // lưu path đầy đủ
    resetRunState()  // setPath([]), setIsRunning(false)
    setIsRunning(true)  // bật animation loop
    setIsComputing(false)  // tắt loading
```

BƯỚC 8: Animation (App.tsx → Canvas.tsx)
```
- useEffect animation loop (isRunning true):
    - mỗi bước: append next city index từ targetPathRef.current vào `path` state
    - sau khi path.length >= targetPath.length → setIsRunning(false)
- Canvas nhận `path` state và vẽ:
    - Vẽ đường nối giữa city coordinates theo thứ tự trong `path`
    - Animate từng đoạn khi `path` tăng
```

BƯỚC 9: Hiển thị kết quả
```
- Canvas hiển thị đường đi NN
- ControlPanel/ App hiển thị tổng khoảng cách (getTotalDistance(cities, path))
- Có thể mở modal `AnalysisModal` để so sánh (nếu gọi)
```

---

## 📍 CHI TIẾT TỪNG BƯỚC (kèm code & kiểu dữ liệu)

### **BƯỚC 1: UI Trigger**

**Files:** `components/ControlPanel.tsx`, `App.tsx`

```tsx
// ControlPanel: nút Run gọi onRun prop
<button onClick={onRun} ...>{t.run}</button>

// App.tsx: runVisualization callback passed to ControlPanel
```

**Input:**
- `selectedAlgorithm` = `AlgorithmType.NEAREST_NEIGHBOR`
- `cities` = Array<City> (tối thiểu 2 phần tử)

---

### **BƯỚC 2: runVisualization (App.tsx)**

```tsx
const runVisualization = useCallback(async () => {
  if (cities.length < 2) return;

  setIsComputing(true);
  try {
    const result = await solveTsp(selectedAlgorithm, cities);
    targetPathRef.current = result.path; // e.g. [0, 3, 2, 5, ...]
    resetRunState();
    setIsRunning(true);
  } finally {
    setIsComputing(false);
  }
}, [cities, selectedAlgorithm, resetRunState]);
```

**Dữ liệu gửi:** body JSON `{"algorithm":"NEAREST_NEIGHBOR","cities":[...city objects...]}`

---

### **BƯỚC 3: API Client (utils/api.ts)**

```ts
export const solveTsp = async (
  algorithm: AlgorithmType,
  cities: City[]
): Promise<SolveResult> => {
  const response = await fetch(withBase('/solve'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ algorithm, cities }),
  });

  const data = await handleResponse<BackendSolveResponse>(response);
  return {
    algorithm: data.algorithm,
    path: data.path,
    totalDistance: data.total_distance,
    executionTime: data.execution_time_ms,
  };
};
```

**HTTP details:** `POST /solve` with JSON body

---

### **BƯỚC 4: Endpoint (backend/app/main.py)**

```py
@app.post('/solve', response_model=SolveResponse)
def solve_tsp(request: SolveRequest) -> SolveResponse:
    if not request.cities:
        raise HTTPException(status_code=400, detail="No cities provided")

    solver = ALGORITHM_DISPATCH.get(request.algorithm)
    if solver is None:
        raise HTTPException(status_code=400, detail="Unsupported algorithm")

    start = time.perf_counter()
    path = solver(request.cities)
    duration = (time.perf_counter() - start) * 1000

    distance = get_total_distance(request.cities, path)

    return SolveResponse(
        algorithm=request.algorithm,
        path=path,
        total_distance=distance,
        execution_time_ms=duration,
    )
```

**ALGORITHM_DISPATCH** maps `AlgorithmType.NEAREST_NEIGHBOR` → `solve_nearest_neighbor`.

---

### **BƯỚC 5: Solver (backend/app/algorithms/nearest_neighbor.py)**

- Hàm `solve_nearest_neighbor(cities: list[City]) -> list[int]` trả về thứ tự index các cities.
- Thuật toán: bắt đầu tại một city (thường index 0), lặp chọn city gần nhất chưa thăm tới khi hết.

Ví dụ (pseudo):
```py
def solve_nearest_neighbor(cities):
    n = len(cities)
    visited = [False]*n
    path = [0]
    visited[0] = True
    current = 0
    for _ in range(n-1):
        next_idx = argmin_distance_from(current, among unvisited)
        path.append(next_idx)
        visited[next_idx] = True
        current = next_idx
    return path
```

**Output:** `path: list[int]` chứa indices (0..n-1)

---

### **BƯỚC 6: Response (SolveResponse)**

```json
{
  "algorithm": "NEAREST_NEIGHBOR",
  "path": [0, 4, 2, 5, 1, ...],
  "total_distance": 1234.56,
  "execution_time_ms": 0.45
}
```

---

### **BƯỚC 7: Frontend xử lý kết quả**

- `utils/api.ts` parse thành `SolveResult`.
- `App.tsx` lưu `targetPathRef.current = result.path`.
- `App.tsx` gọi `resetRunState()` rồi `setIsRunning(true)` để bắt đầu animation.

---

### **BƯỚC 8: Animation & Rendering**

- Animation loop (useEffect) bước từng index từ `targetPathRef.current` vào `path` state.
- `components/Canvas.tsx` vẽ:
  - điểm thành phố
  - đường nối theo `path` (tăng dần khi animation chạy)
  - highlight current city / segment nếu có
- Sau khi kết thúc, `isRunning` = false.

---

### **BƯỚC 9: Hiển thị thông tin**

- `ControlPanel` hiển thị total distance (tính bằng `getTotalDistance(cities, path)`)
- Nếu người dùng mở `AnalysisModal`, có thể so sánh với các thuật toán khác

---

## 📊 Bảng Tóm Tắt Dữ Liệu

| Bước | File/Component | Input | Output |
|------|----------------|-------|--------|
| 1 | `ControlPanel.tsx` / `App.tsx` | user click Run | call `runVisualization()` |
| 2 | `App.tsx` | cities[], selectedAlgorithm | call `solveTsp(...)` |
| 3 | `utils/api.ts` | {algorithm, cities} | HTTP POST /solve |
| 4 | `backend/app/main.py` | SolveRequest | validate, call solver |
| 5 | `backend/app/algorithms/nearest_neighbor.py` | cities | path: list[int] |
| 6 | `backend/app/main.py` | path | SolveResponse (path, distance, time) |
| 7 | `utils/api.ts` | JSON response | SolveResult object |
| 8 | `App.tsx` | SolveResult | targetPathRef.current set → animation |
| 9 | `Canvas.tsx` | cities, path | visualized path + metrics |

---

## 🔐 Validation & Error Handling

- Frontend: kiểm tra `cities.length < 2` không cho chạy.
- Backend: nếu `request.cities` rỗng → 400; nếu algorithm unsupported → 400.
- Network errors được catch trong `runVisualization()` và ghi log.

---

## 📈 Hiệu năng & Ghi chú

- Nearest Neighbor là O(n^2) trong cách triển khai đơn giản (với n = số thành phố).
- Backend đo `execution_time_ms` và trả về cho frontend để hiển thị.
- Animation thời gian phụ thuộc `STEP_DELAY_MS` trong `App.tsx`.

---

## 🔗 Tham chiếu file

- `components/ControlPanel.tsx` (nút Run)
- `App.tsx` (runVisualization, animation loop)
- `utils/api.ts` (solveTsp)
- `backend/app/main.py` (POST /solve)
- `backend/app/algorithms/nearest_neighbor.py` (solver)
- `backend/app/schemas.py` (SolveRequest / SolveResponse)
- `components/Canvas.tsx` (rendering)

---

## 📝 Kết luận

Khi người dùng chọn Nearest Neighbor và nhấn Run, dữ liệu (mảng `cities`) được gửi lên backend, backend chạy solver NN, trả về `path` (thứ tự các thành phố), và frontend sẽ animate đường đi đó lên canvas, đồng thời hiển thị tổng khoảng cách và thời gian thực thi.


