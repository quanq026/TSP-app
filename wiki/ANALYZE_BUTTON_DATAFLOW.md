# 📊 Luồng Dữ Liệu - Nút Phân Tích (Analyze)

## 📋 Tổng Quan
Tài liệu này mô tả chi tiết quá trình xử lý dữ liệu từ khi người dùng ấn nút "Phân tích" cho đến khi modal kết quả so sánh các thuật toán TSP được hiển thị.

---

## 🔄 Luồng Dữ Liệu Toàn Bộ


BƯỚC 1: User Ấn Nút (Frontend - ControlPanel.tsx)
```
Người dùng ấn nút "Phân tích" (Analyze)
        ↓
Button onClick → onAnalyze() được gọi
        ↓
Kiểm tra: cityCount >= 3 ✓
```
BƯỚC 2: React State Update (App.tsx)
```
onAnalyze() → handleAnalyze() được gọi:
  - setIsComputing(true) → hiển thị loading
  - setError(null) → xóa lỗi cũ
  - Kiểm tra: cities.length >= 3 ✓
  - Chuẩn bị dữ liệu:
      cities = [{id:0, x:150, y:320}, ..., {id:29, x:620, y:420}]
  - Gọi: analyzeAlgorithms(cities)
```
BƯỚC 3: HTTP Request (utils/api.ts)
```
analyzeAlgorithms(cities):
  - URL được gọi: http://localhost:8000/analyze
  - Method: POST
  - Headers: Content-Type: application/json
  - Body: {"cities": [...30 city objects...]}
  - await fetch() → gửi request
```
BƯỚC 4: Backend Xử Lý (main.py)
```
Route: @app.post("/analyze")
  - Nhận body: AnalyzeRequest với cities
  - Kiểm tra: len(cities) >= 3 ✓
  - Loop qua 3 thuật toán:
      1. NEAREST_NEIGHBOR (chạy 1 lần - deterministic)
      2. ACO (chạy 3 lần - stochastic, lấy best)
      3. SPACE_FILLING_CURVE (chạy 1 lần - deterministic)
```
BƯỚC 5: Chạy Từng Thuật Toán
```
Với thuật toán deterministic (NN, SFC):
  - start = time.perf_counter()
  - path = solver(cities)
  - duration = (time.perf_counter() - start) * 1000
  - distance = get_total_distance(cities, path)
  - Lưu kết quả: AnalysisResult(...)

Với thuật toán stochastic (ACO):
  - Loop 3 lần (ACO_RUNS = 3):
      - Chạy ACO và đo thời gian
      - Nếu distance < best_distance → lưu lại
  - Lấy kết quả tốt nhất từ 3 lần chạy
  - execution_time = tổng thời gian 3 lần
```
BƯỚC 6: Định Dạng Response (schemas.py)
```
Dữ liệu trả về theo schema AnalyzeResponse:
{
  "results": [
    {
      "algorithm": "NEAREST_NEIGHBOR",
      "distance": 2450.5,
      "path": [0, 5, 12, ...],
      "execution_time_ms": 0.15
    },
    {
      "algorithm": "ACO",
      "distance": 2380.2,
      "path": [0, 12, 5, ...],
      "execution_time_ms": 45.3
    },
    {
      "algorithm": "SPACE_FILLING_CURVE",
      "distance": 2520.8,
      "path": [0, 3, 8, ...],
      "execution_time_ms": 0.08
    }
  ]
}
```
BƯỚC 7: Frontend Nhận Response (utils/api.ts)
```
handleResponse<BackendAnalysisResponse>(response):
  - Kiểm tra: response.ok === true ✓
  - Parse JSON: response.json()
  - Map dữ liệu: execution_time_ms → executionTime
  - Return: Array<AnalysisResult>
```
BƯỚC 8: Update State (App.tsx)
```
await analyzeAlgorithms() → results = [3 AnalysisResult objects]
        ↓
setAnalysisResults(results)
        ↓
setIsAnalysisOpen(true) → mở modal
        ↓
setIsComputing(false) → tắt loading
```
BƯỚC 9: Render Modal (AnalysisModal.tsx)
```
State thay đổi:
  analysisResults: [3 results] ← NEW
  isAnalysisOpen: true ← NEW

AnalysisModal component:
  - Sắp xếp results theo distance (tăng dần)
  - Hiển thị winner banner
  - Hiển thị 3 cards với path preview
  - Hiển thị 2 biểu đồ so sánh
  
Kết quả: Modal hiển thị kết quả phân tích 3 thuật toán
```

---

## 📍 CHI TIẾT TỪNG BƯỚC

### **BƯỚC 1: User Interaction (ControlPanel.tsx)**

**File:** `components/ControlPanel.tsx`

```typescript
<button
  onClick={onAnalyze}
  disabled={isRunning || cityCount < 3}
  className="flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-all border"
  style={isRunning || cityCount < 3
    ? { borderColor: theme.colors.overlay, color: theme.colors.muted, cursor: 'not-allowed' }
    : { borderColor: withOpacity(theme.colors.foam, 0.5), color: theme.colors.foam }
  }
>
  <Activity size={18} />
  {t.analyze}
</button>
```

**Điều kiện kích hoạt:**
- `isRunning === false` (không đang chạy animation)
- `cityCount >= 3` (cần ít nhất 3 thành phố để phân tích)

**Dữ liệu được truyền:**
- Không có input trực tiếp
- Callback `onAnalyze()` được gọi

---

### **BƯỚC 2: State Management (App.tsx)**

**File:** `App.tsx`

```typescript
const handleAnalyze = useCallback(async () => {
  // 1. Kiểm tra điều kiện
  if (cities.length < 3) return;

  // 2. Bắt đầu loading
  setIsComputing(true);
  setError(null);
  
  try {
    // 3. Gọi API phân tích tất cả thuật toán
    const results = await analyzeAlgorithms(cities);
    // results = [
    //   {algorithm: "NEAREST_NEIGHBOR", distance: 2450.5, path: [...], executionTime: 0.15},
    //   {algorithm: "ACO", distance: 2380.2, path: [...], executionTime: 45.3},
    //   {algorithm: "SPACE_FILLING_CURVE", distance: 2520.8, path: [...], executionTime: 0.08}
    // ]
    
    // 4. Cập nhật state với kết quả
    setAnalysisResults(results);
    
    // 5. Mở modal hiển thị kết quả
    setIsAnalysisOpen(true);
    
  } catch (err) {
    // Xử lý lỗi với thông báo cho user
    const message = err instanceof Error ? err.message : 'Failed to analyze algorithms';
    setError(message);
    console.error('Failed to analyze algorithms', err);
  } finally {
    // 6. Tắt loading state
    setIsComputing(false);
  }
}, [cities]);
```

**Dữ liệu được truyền:**
- Input: `cities = Array<City>` (30 thành phố)
- Output: `analysisResults = Array<AnalysisResult>` (3 kết quả)

---

### **BƯỚC 3: HTTP Request (utils/api.ts)**

**File:** `utils/api.ts`

```typescript
export const analyzeAlgorithms = async (cities: City[]): Promise<AnalysisResult[]> => {
  // 1. Gửi HTTP POST request
  const response = await fetch(withBase('/analyze'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cities }),
  });
  // Body JSON = {
  //   "cities": [
  //     {"id": 0, "x": 150.3, "y": 320.5},
  //     {"id": 1, "x": 580.7, "y": 450.2},
  //     ...
  //     {"id": 29, "x": 620.1, "y": 420.5}
  //   ]
  // }

  // 2. Xử lý response
  const data = await handleResponse<BackendAnalysisResponse>(response);
  
  // 3. Map dữ liệu từ snake_case sang camelCase
  return data.results.map((result) => ({
    algorithm: result.algorithm,
    distance: result.distance,
    path: result.path,
    executionTime: result.execution_time_ms,  // Chuyển đổi tên trường
  }));
};
```

**HTTP Request Details:**
```
POST /analyze
Host: localhost:8000
Content-Type: application/json

{
  "cities": [
    {"id": 0, "x": 150.3, "y": 320.5},
    {"id": 1, "x": 580.7, "y": 450.2},
    ...
  ]
}
```

**Type Definitions:**
```typescript
type BackendAnalysisResponse = {
  results: Array<{
    algorithm: string;
    distance: number;
    path: number[];
    execution_time_ms: number;
  }>;
};

export interface AnalysisResult {
  algorithm: string;
  distance: number;
  path: number[];
  executionTime: number;  // camelCase cho frontend
}
```

---

### **BƯỚC 4: Backend API (main.py)**

**File:** `backend/app/main.py`

```python
ALGORITHM_DISPATCH = {
    AlgorithmType.NEAREST_NEIGHBOR: solve_nearest_neighbor,
    AlgorithmType.ACO: solve_ant_colony,
    AlgorithmType.SPACE_FILLING_CURVE: solve_space_filling_curve,
}

ALGORITHM_LABELS = {
    AlgorithmType.NEAREST_NEIGHBOR: AlgorithmType.NEAREST_NEIGHBOR.value,
    AlgorithmType.ACO: AlgorithmType.ACO.value,
    AlgorithmType.SPACE_FILLING_CURVE: AlgorithmType.SPACE_FILLING_CURVE.value,
}

# ACO is stochastic - run multiple times and keep best result
ACO_RUNS = 3

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_algorithms(request: AnalyzeRequest) -> AnalyzeResponse:
    if len(request.cities) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 cities for analysis")

    results: list[AnalysisResult] = []

    for algorithm, solver in ALGORITHM_DISPATCH.items():
        # ACO is stochastic - run multiple times and keep best result
        if algorithm == AlgorithmType.ACO:
            best_path = []
            best_distance = float("inf")
            total_duration = 0.0

            for _ in range(ACO_RUNS):
                start = time.perf_counter()
                path = solver(request.cities)
                duration = (time.perf_counter() - start) * 1000
                total_duration += duration
                distance = get_total_distance(request.cities, path)

                if distance < best_distance:
                    best_distance = distance
                    best_path = path

            results.append(
                AnalysisResult(
                    algorithm=ALGORITHM_LABELS[algorithm],
                    distance=best_distance,
                    path=best_path,
                    execution_time_ms=total_duration,  # Total time for all runs
                )
            )
        else:
            # Deterministic algorithms - run once
            start = time.perf_counter()
            path = solver(request.cities)
            duration = (time.perf_counter() - start) * 1000
            distance = get_total_distance(request.cities, path)
            results.append(
                AnalysisResult(
                    algorithm=ALGORITHM_LABELS[algorithm],
                    distance=distance,
                    path=path,
                    execution_time_ms=duration,
                )
            )

    return AnalyzeResponse(results=results)
```

**Thứ tự chạy thuật toán:**
1. **Nearest Neighbor** - O(n²), rất nhanh, chạy 1 lần
2. **Ant Colony Optimization** - O(iterations × ants × n²), chậm hơn, **chạy 3 lần lấy best**
3. **Space Filling Curve** - O(n log n), rất nhanh, chạy 1 lần

---

### **BƯỚC 5: Các Thuật Toán TSP**

#### **5.1 Nearest Neighbor (nearest_neighbor.py)**

```python
def solve_nearest_neighbor(cities: List[City]) -> List[int]:
    """Greedy TSP heuristic: luôn đi đến thành phố gần nhất chưa ghé thăm."""
    
    if not cities:
        return []

    city_lookup = {city.id: city for city in cities}
    unvisited = set(city_lookup.keys())
    current_city_id = cities[0].id
    path: List[int] = [current_city_id]
    unvisited.remove(current_city_id)

    def find_nearest(current_id: int) -> int | None:
        current_city = city_lookup[current_id]
        nearest_id = None
        min_distance = float("inf")

        for candidate_id in unvisited:
            candidate = city_lookup[candidate_id]
            distance = calculate_distance(current_city, candidate)
            if distance < min_distance:
                min_distance = distance
                nearest_id = candidate_id
        return nearest_id

    while unvisited:
        nearest_id = find_nearest(current_city_id)
        if nearest_id is None:
            break
        path.append(nearest_id)
        unvisited.remove(nearest_id)
        current_city_id = nearest_id

    return path
```

**Độ phức tạp:** O(n²)
**Thời gian thực thi:** ~0.1-0.5ms cho 30 cities

---

#### **5.2 Ant Colony Optimization (ant_colony.py)**

```python
def solve_ant_colony(cities: List[City]) -> List[int]:
    """Giải TSP với Ant Colony Optimization."""
    
    # Tham số
    num_ants = min(20, len(cities))
    max_iterations = 50
    alpha = 1   # ảnh hưởng pheromone
    beta = 3    # ảnh hưởng khoảng cách
    evaporation = 0.1
    q = 100

    # Khởi tạo pheromone matrix
    n = len(cities)
    pheromones = [[1.0 for _ in range(n)] for _ in range(n)]
    
    # Xây dựng distance matrix
    dists = build_distance_matrix()
    
    best_path = []
    best_distance = math.inf

    # Main loop
    for iteration in range(max_iterations):  # 50 iterations
        for ant in range(num_ants):           # 20 ants
            path = construct_path()           # Xây dựng đường đi
            total = path_distance(path)
            
            if total < best_distance:
                best_distance = total
                best_path = path[:]

        evaporate_pheromones()                # Bay hơi pheromone
        deposit_pheromones()                  # Đặt pheromone mới

    return normalize_path(best_path, cities[0].id)
```

**Độ phức tạp:** O(iterations × ants × n²) = O(50 × 20 × 30²) = O(900,000)
**Thời gian thực thi:** ~30-100ms cho 30 cities

---

#### **5.3 Space Filling Curve (space_filling_curve.py)**

```python
GRID_SIZE = 4096

def solve_space_filling_curve(cities: List[City]) -> List[int]:
    """Sắp xếp cities theo Hilbert curve để xấp xỉ tour ngắn."""
    
    if not cities:
        return []

    # 1. Tìm tọa độ lớn nhất để chuẩn hóa
    max_coord = max(max(city.x for city in cities), max(city.y for city in cities), 1)

    # 2. Tính Hilbert distance cho mỗi city
    enriched = []
    for city in cities:
        nx, ny = _normalize_coords(city, max_coord)
        hilbert_value = _hilbert_distance(GRID_SIZE, nx, ny)
        enriched.append((hilbert_value, city.id))

    # 3. Sắp xếp theo Hilbert value
    enriched.sort(key=lambda item: item[0])
    
    # 4. Trả về path theo thứ tự đã sắp xếp
    path = [city_id for _, city_id in enriched]
    return normalize_path(path, cities[0].id)
```

**Độ phức tạp:** O(n log n) (do sorting)
**Thời gian thực thi:** ~0.05-0.2ms cho 30 cities

---

### **BƯỚC 6: Data Models (schemas.py)**

**File:** `backend/app/schemas.py`

```python
class AnalysisResult(BaseModel):
    """Kết quả phân tích của một thuật toán"""
    algorithm: str              # Tên thuật toán (enum value)
    distance: float             # Tổng khoảng cách tour
    path: List[int]             # Thứ tự thăm cities (IDs)
    execution_time_ms: float    # Thời gian thực thi (ms)


class AnalyzeRequest(BaseModel):
    """Request body cho endpoint /analyze"""
    cities: List[City]          # Danh sách cities cần phân tích


class AnalyzeResponse(BaseModel):
    """Response cho endpoint /analyze"""
    results: List[AnalysisResult]  # Kết quả của tất cả thuật toán
```

**JSON Response Example:**
```json
{
  "results": [
    {
      "algorithm": "NEAREST_NEIGHBOR",
      "distance": 2450.5,
      "path": [0, 5, 12, 8, 3, 15, 22, 1, 9, 18, 27, 4, 11, 20, 29, 7, 14, 23, 2, 10, 19, 28, 6, 13, 21, 25, 16, 24, 17, 26],
      "execution_time_ms": 0.15
    },
    {
      "algorithm": "ACO",
      "distance": 2380.2,
      "path": [0, 12, 5, 8, 15, 3, 22, 18, 9, 1, 27, 11, 4, 20, 29, 14, 7, 23, 10, 2, 19, 28, 13, 6, 21, 16, 25, 24, 26, 17],
      "execution_time_ms": 45.3
    },
    {
      "algorithm": "SPACE_FILLING_CURVE",
      "distance": 2520.8,
      "path": [0, 3, 8, 5, 12, 15, 22, 18, 9, 1, 4, 11, 20, 27, 29, 7, 14, 23, 2, 10, 19, 28, 6, 13, 21, 16, 25, 24, 17, 26],
      "execution_time_ms": 0.08
    }
  ]
}
```

---

### **BƯỚC 7: Response Parsing (utils/api.ts)**

**File:** `utils/api.ts`

```typescript
const handleResponse = async <T>(response: Response): Promise<T> => {
  // 1. Kiểm tra HTTP status
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  
  // 2. Parse JSON response
  return response.json() as Promise<T>;
};

// Trong analyzeAlgorithms():
return data.results.map((result) => ({
  algorithm: result.algorithm,
  distance: result.distance,
  path: result.path,
  executionTime: result.execution_time_ms,  // snake_case → camelCase
}));
```

**Data Transformation:**
```
Backend (Python snake_case)     →    Frontend (TypeScript camelCase)
─────────────────────────────────────────────────────────────────────
execution_time_ms: 45.3         →    executionTime: 45.3
```

---

### **BƯỚC 8: State Update (App.tsx)**

**File:** `App.tsx`

```typescript
// Sau khi nhận results từ API
setAnalysisResults(results);  // Lưu kết quả phân tích
setIsAnalysisOpen(true);      // Mở modal
setIsComputing(false);        // Tắt loading
```

**State Changes:**
```javascript
Before:
{
  cities: [{id:0, x:150, y:320}, ...],
  analysisResults: [],
  isAnalysisOpen: false,
  isComputing: false,
  error: null
}

After:
{
  cities: [{id:0, x:150, y:320}, ...],
  analysisResults: [
    {algorithm: "NEAREST_NEIGHBOR", distance: 2450.5, ...},
    {algorithm: "ACO", distance: 2380.2, ...},
    {algorithm: "SPACE_FILLING_CURVE", distance: 2520.8, ...}
  ],
  isAnalysisOpen: true,    ← Trigger modal render
  isComputing: false,
  error: null
}
```

---

### **BƯỚC 9: UI Rendering (AnalysisModal.tsx)**

**File:** `components/AnalysisModal.tsx`

```typescript
const AnalysisModal: React.FC<AnalysisModalProps> = ({ 
  isOpen, 
  onClose, 
  results, 
  cities, 
  language 
}) => {
  const t = translations[language];

  // 1. Không render nếu modal đóng
  if (!isOpen) return null;

  // 2. Sắp xếp kết quả theo khoảng cách (winner = shortest)
  const sortedResults = [...results].sort((a, b) => a.distance - b.distance);
  const winner = sortedResults[0];

  // 3. Helper function để lấy tên thuật toán đã dịch
  const getAlgoName = (key: string) => {
    const algoKey = key as AlgorithmType;
    if (algoKey in AlgorithmType) {
      return t.algoNames[algoKey] ?? key;
    }
    return key;
  };

  return (
    <div className="fixed inset-0 z-50 ...">
      {/* Modal Container */}
      <div className="rounded-xl shadow-2xl ...">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <h2>{t.analysis.title}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Winner Banner */}
          <div className="p-4 rounded-lg flex items-center gap-4 mb-8">
            <Trophy size={32} />
            <div>
              <p>{t.analysis.winnerTitle}</p>
              <p className="text-2xl font-bold">{getAlgoName(winner?.algorithm)}</p>
              <p>{t.analysis.totalDist}: {winner?.distance.toFixed(1)}</p>
            </div>
          </div>

          {/* Algorithm Cards (3 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {sortedResults.map((result, idx) => (
              <AlgorithmCard key={result.algorithm} result={result} isWinner={idx === 0} />
            ))}
          </div>

          {/* Comparison Charts */}
          <MetricChart title="Distance" data={...} />
          <MetricChart title="Execution Time" data={...} />
          
        </div>
      </div>
    </div>
  );
};
```

**Các thành phần UI:**

1. **Winner Banner**: Hiển thị thuật toán có khoảng cách ngắn nhất
2. **Algorithm Cards**: 3 cards cho 3 thuật toán, mỗi card có:
   - Tên thuật toán
   - Thời gian thực thi
   - Tổng khoảng cách
   - Path preview (SVG mini)
3. **Comparison Charts**: 2 biểu đồ thanh so sánh:
   - Distance (khoảng cách)
   - Execution Time (thời gian)

---

## 📊 Bảng Tóm Tắt Dữ Liệu

| Bước | Component | Input | Output | Loại |
|------|-----------|-------|--------|------|
| 1 | ControlPanel | Click event | onAnalyze() | User Input |
| 2 | App | cities[] | Promise<AnalysisResult[]> | State Setup |
| 3 | api.ts | cities[] | HTTP POST Request | Network |
| 4 | main.py | AnalyzeRequest | Loop algorithms | Backend |
| 5 | algorithms/* | cities[] | path[], distance | Logic |
| 6 | schemas.py | AnalysisResult[] | JSON | Data Model |
| 7 | api.ts | JSON Response | AnalysisResult[] | Parsing |
| 8 | App | AnalysisResult[] | State Update | React |
| 9 | AnalysisModal | results[], cities[] | Modal UI | Rendering |

---

## ⏱️ So Sánh Hiệu Năng Thuật Toán

| Thuật toán | Độ phức tạp | Thời gian (30 cities) | Chất lượng |
|------------|-------------|----------------------|------------|
| Nearest Neighbor | O(n²) | ~0.1-0.5ms | Trung bình |
| Ant Colony | O(iter × ants × n²) × 3 runs | ~90-300ms | Tốt |
| Space Filling Curve | O(n log n) | ~0.05-0.2ms | Trung bình |

**Nhận xét:**
- **ACO** thường cho kết quả tốt nhất nhưng chậm nhất
- **ACO** được chạy **3 lần** và chỉ lấy kết quả tốt nhất (do tính stochastic)
- **Space Filling Curve** nhanh nhất nhưng không đảm bảo tối ưu
- **Nearest Neighbor** cân bằng giữa tốc độ và chất lượng

---

## 🔐 Validation Layers

### **Frontend Validation (App.tsx)**
```typescript
if (cities.length < 3) return;  // Cần ít nhất 3 cities
```

### **Backend Validation (main.py)**
```python
if len(request.cities) < 3:
    raise HTTPException(status_code=400, detail="Need at least 3 cities for analysis")
```

### **UI Validation (ControlPanel.tsx)**
```typescript
disabled={isRunning || cityCount < 3}  // Disable button nếu < 3 cities
```

---

## ⚠️ Error Handling

### **Frontend Errors (App.tsx)**
```typescript
try {
  const results = await analyzeAlgorithms(cities);
  setAnalysisResults(results);
  setIsAnalysisOpen(true);
} catch (err) {
  const message = err instanceof Error ? err.message : 'Failed to analyze algorithms';
  setError(message);        // Hiển thị toast error
  console.error('Failed to analyze algorithms', err);
}
```

### **Backend Errors (main.py)**
```python
# FastAPI tự động trả về lỗi nếu:
# - cities < 3 → 400 Bad Request
# - Invalid JSON body → 422 Unprocessable Entity
# - Server error → 500 Internal Server Error
```

---

## 📈 Performance Considerations

1. **HTTP Request**: ~50-200ms (network latency)
2. **Nearest Neighbor**: O(n²) → ~0.1-0.5ms
3. **ACO**: O(50 × 20 × n²) → ~30-100ms (chiếm phần lớn thời gian)
4. **Space Filling Curve**: O(n log n) → ~0.05-0.2ms
5. **JSON Serialization**: O(n) cho mỗi result
6. **Modal Rendering**: O(n) cho path preview

**Total Time**: ~100-400ms (dominated by ACO và network)

---

## 🔗 Tham Chiếu File

| File | Vai Trò | Dòng Chính |
|------|---------|----------|
| `components/ControlPanel.tsx` | UI Button | 150-163 |
| `App.tsx` | State Management | 116-132 |
| `utils/api.ts` | API Client | 82-96 |
| `backend/app/main.py` | API Endpoint | 97-118 |
| `backend/app/algorithms/nearest_neighbor.py` | NN Algorithm | 9-42 |
| `backend/app/algorithms/ant_colony.py` | ACO Algorithm | 11-123 |
| `backend/app/algorithms/space_filling_curve.py` | SFC Algorithm | 41-57 |
| `backend/app/schemas.py` | Data Models | 33-45 |
| `components/AnalysisModal.tsx` | Modal UI | 126-248 |

---

## 📝 Kết Luận

Nút Phân tích là tính năng quan trọng để so sánh hiệu quả các thuật toán TSP:

1. **User** ấn nút "Phân tích"
2. **Frontend** gửi danh sách cities đến backend
3. **Backend** chạy tuần tự 3 thuật toán và đo thời gian
4. **Frontend** nhận kết quả và hiển thị modal so sánh
5. **User** thấy winner, path preview, và biểu đồ so sánh

Toàn bộ quá trình giúp user hiểu rõ trade-off giữa **tốc độ** và **chất lượng** của từng thuật toán TSP.
