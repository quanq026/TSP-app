# 📚 Chuẩn Bị Vấn Đáp - TSP Visualizer Project

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Frontend (React + TypeScript)](#2-frontend-react--typescript)
3. [Backend (FastAPI + Python)](#3-backend-fastapi--python)
4. [API Design](#4-api-design)
5. [Thuật Toán TSP](#5-thuật-toán-tsp)
6. [State Management & Data Flow](#6-state-management--data-flow)
7. [Performance & Optimization](#7-performance--optimization)
8. [Error Handling](#8-error-handling)
9. [Security](#9-security)
10. [Testing & Deployment](#10-testing--deployment)
11. [Câu Hỏi Nâng Cao](#11-câu-hỏi-nâng-cao)

---

# 1. Tổng Quan Dự Án

## Q1.1: Dự án này giải quyết bài toán gì?

**Trả lời:**
Dự án giải quyết **Traveling Salesman Problem (TSP)** - bài toán tìm đường đi ngắn nhất đi qua tất cả các thành phố đúng 1 lần và quay về điểm xuất phát.

**Đặc điểm:**
- TSP thuộc lớp **NP-hard** - không có thuật toán đa thức cho lời giải tối ưu
- Số hoán vị: (n-1)!/2 với n cities → explosive với n lớn
- Ví dụ: 20 cities → 60 tỷ tỷ hoán vị

---

## Q1.2: Tại sao chọn tech stack này?

**Trả lời:**

| Component | Technology | Lý do |
|-----------|------------|-------|
| Frontend | React + TypeScript | Type safety, component-based, ecosystem lớn |
| Build tool | Vite | Nhanh hơn CRA, HMR tốt |
| Backend | FastAPI | Async, auto-docs, type hints, performance |
| API | REST JSON | Đơn giản, widely supported |
| Styling | TailwindCSS | Utility-first, không cần viết CSS riêng |

---

## Q1.3: Kiến trúc tổng quan của dự án?

**Trả lời:**

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  App.tsx │──│ ControlPanel │──│       Canvas.tsx        │ │
│  │ (State)  │  │  (Controls)  │  │   (SVG Visualization)   │ │
│  └────┬─────┘  └──────────────┘  └─────────────────────────┘ │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────┐                                             │
│  │  utils/api  │ ◄─── HTTP Requests ────────────────────┐    │
│  └─────────────┘                                        │    │
└─────────────────────────────────────────────────────────│────┘
                                                          │
                          ▼                               │
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  ┌───────────┐    ┌────────────────────────────────────┐    │
│  │  FastAPI  │────│           Algorithms               │    │
│  │  main.py  │    │  ┌────────┐ ┌─────┐ ┌───────────┐  │    │
│  │           │    │  │   NN   │ │ ACO │ │    SFC    │  │    │
│  └───────────┘    │  └────────┘ └─────┘ └───────────┘  │    │
│                   └────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Q1.4: Mô tả flow hoàn chỉnh khi user click "Run"?

**Trả lời:**

```
1. User click "Run" button
   ↓
2. ControlPanel.tsx gọi props.onRun()
   ↓
3. App.tsx runVisualization():
   - Validate: cities.length >= 2
   - setIsComputing(true)
   - Gọi solveTsp(algorithm, cities)
   ↓
4. utils/api.ts solveTsp():
   - POST /solve với {algorithm, cities}
   ↓
5. Backend main.py solve_tsp():
   - Parse request
   - Dispatch to algorithm solver
   - Measure execution time
   - Calculate total distance
   - Return SolveResponse
   ↓
6. Frontend nhận response:
   - Lưu path vào targetPathRef
   - setIsRunning(true)
   ↓
7. useEffect animation loop:
   - Append từng city ID vào path state
   - Canvas re-render mỗi frame
   ↓
8. Animation complete:
   - setIsRunning(false)
   - Hiển thị total distance
```

---

# 2. Frontend (React + TypeScript)

## Q2.1: Giải thích cấu trúc component?

**Trả lời:**

```
App.tsx (Root)
├── Canvas.tsx          # SVG visualization
├── ControlPanel.tsx    # Buttons, inputs, algorithm selector
└── AnalysisModal.tsx   # Comparison results modal
```

**App.tsx responsibilities:**
- Global state management (cities, path, algorithm, loading states)
- API calls coordination
- Animation logic

---

## Q2.2: Tại sao dùng `useCallback` trong App.tsx?

**Trả lời:**

```typescript
const handleCanvasClick = useCallback(
  (x: number, y: number) => {
    const newCity: City = { id: getNextCityId(), x, y };
    setCities(prev => [...prev, newCity]);
    resetRunState();
  },
  [resetRunState]
);
```

**Lý do:**
1. **Prevent unnecessary re-renders**: Nếu không dùng useCallback, function được tạo mới mỗi render → child components re-render
2. **Dependency optimization**: Canvas.tsx nhận `onCanvasClick` prop, nếu reference thay đổi → Canvas re-render
3. **Performance**: Với nhiều cities, tránh re-render không cần thiết

---

## Q2.3: Giải thích cách render path trong Canvas?

**Trả lời:**

```typescript
// Tạo Map để lookup O(1) thay vì O(n)
const cityMap = useMemo(() => {
  const map = new Map<number, City>();
  cities.forEach(city => map.set(city.id, city));
  return map;
}, [cities]);

// Render lines
{path.map((cityId, index) => {
  if (index === path.length - 1) return null;
  const c1 = cityMap.get(cityId);
  const c2 = cityMap.get(path[index + 1]);
  if (!c1 || !c2) return null;
  return (
    <line
      key={`line-${index}`}
      x1={c1.x} y1={c1.y}
      x2={c2.x} y2={c2.y}
      stroke={theme.colors.foam}
      strokeWidth="2"
    />
  );
})}
```

**Tối ưu:**
- `useMemo` cho cityMap → chỉ tính lại khi cities thay đổi
- Map lookup O(1) thay vì Array.find() O(n)
- Key stable với `line-${index}`

---

## Q2.4: Animation hoạt động như thế nào?

**Trả lời:**

```typescript
useEffect(() => {
  if (!isRunning) return;

  const target = targetPathRef.current;
  if (path.length >= target.length) {
    setIsRunning(false);
    return;
  }

  const timer = setTimeout(() => {
    setPath(prev => [...prev, target[prev.length]]);
  }, 50); // 50ms per step

  return () => clearTimeout(timer);
}, [isRunning, path]);
```

**Giải thích:**
1. `targetPathRef` chứa full path từ API
2. Mỗi 50ms, thêm 1 city vào `path` state
3. Canvas re-render, vẽ thêm 1 đoạn đường
4. Khi `path.length >= target.length` → dừng

---

## Q2.5: Làm sao đảm bảo city ID unique?

**Trả lời:**

```typescript
// Counter-based ID generation
let cityIdCounter = 0;
const getNextCityId = () => ++cityIdCounter;

// Khi fetch random cities từ backend
const handleRandomize = async (count: number) => {
  const generated = await fetchRandomCities(count, width, height);
  setCities(generated);
  
  // Sync counter với max ID từ backend
  if (generated.length > 0) {
    const maxId = Math.max(...generated.map(c => c.id));
    cityIdCounter = maxId;
  }
};
```

**Tại sao không dùng Date.now()?**
- Click nhanh → có thể trùng ID
- Counter đảm bảo unique 100%

---

## Q2.6: Giải thích i18n (internationalization)?

**Trả lời:**

```typescript
// types.ts
export type Language = 'en' | 'vi';

// translations.ts
export const translations = {
  en: {
    run: 'Run',
    clear: 'Clear',
    random: 'Random',
    // ...
  },
  vi: {
    run: 'Chạy',
    clear: 'Xóa',
    random: 'Ngẫu nhiên',
    // ...
  }
};

// Usage in component
const t = translations[language];
<button>{t.run}</button>
```

**Cách switch language:**
- State `language` trong App.tsx
- Truyền xuống components qua props
- Components sử dụng `translations[language]`

---

# 3. Backend (FastAPI + Python)

## Q3.1: Tại sao chọn FastAPI thay vì Flask/Django?

**Trả lời:**

| Feature | FastAPI | Flask | Django |
|---------|---------|-------|--------|
| Async support | ✅ Native | ❌ Manual | ⚠️ Limited |
| Type hints | ✅ Required | ❌ Optional | ❌ Optional |
| Auto documentation | ✅ OpenAPI/Swagger | ❌ Manual | ❌ DRF needed |
| Validation | ✅ Pydantic | ❌ Manual | ⚠️ Forms |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## Q3.2: Giải thích Pydantic schemas?

**Trả lời:**

```python
# schemas.py
class City(BaseModel):
    id: int = Field(..., ge=0)  # >= 0
    x: float = Field(...)
    y: float = Field(...)

class SolveRequest(BaseModel):
    algorithm: AlgorithmType
    cities: List[City]

class SolveResponse(BaseModel):
    algorithm: AlgorithmType
    path: List[int]
    total_distance: float
    execution_time_ms: float
```

**Lợi ích:**
1. **Auto validation**: Invalid data → 422 error
2. **Type coercion**: "123" → 123 (int)
3. **Documentation**: Auto-generate OpenAPI schema
4. **Serialization**: Python objects → JSON

---

## Q3.3: CORS là gì và tại sao cần?

**Trả lời:**

**CORS = Cross-Origin Resource Sharing**

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Vấn đề:**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Browser block cross-origin requests by default

**Giải pháp:**
- Backend gửi header `Access-Control-Allow-Origin`
- Browser cho phép request

**Production:**
```python
allow_origins=["https://yourdomain.com"]  # Restrict!
```

---

## Q3.4: Giải thích cách dispatch algorithm?

**Trả lời:**

```python
ALGORITHM_DISPATCH = {
    AlgorithmType.NEAREST_NEIGHBOR: solve_nearest_neighbor,
    AlgorithmType.ACO: solve_ant_colony,
    AlgorithmType.SPACE_FILLING_CURVE: solve_space_filling_curve,
}

@app.post("/solve")
def solve_tsp(request: SolveRequest):
    solver = ALGORITHM_DISPATCH.get(request.algorithm)
    if solver is None:
        raise HTTPException(status_code=400, detail="Unsupported algorithm")
    
    path = solver(request.cities)
    # ...
```

**Pattern:** Strategy Pattern
- Mỗi algorithm là một strategy
- Dispatch table chọn strategy based on input
- Dễ thêm algorithm mới: chỉ cần add vào dict

---

## Q3.5: Tại sao ACO chạy nhiều lần?

**Trả lời:**

```python
ACO_RUNS = 3

if request.algorithm == AlgorithmType.ACO:
    best_path = []
    best_distance = float("inf")
    
    for _ in range(ACO_RUNS):
        path = solver(request.cities)
        distance = get_total_distance(request.cities, path)
        
        if distance < best_distance:
            best_distance = distance
            best_path = path
```

**Lý do:**
- ACO là **stochastic** (random-based)
- Mỗi lần chạy cho kết quả khác nhau
- Chạy nhiều lần + lấy best → kết quả ổn định hơn

---

# 4. API Design

## Q4.1: Liệt kê tất cả endpoints?

**Trả lời:**

| Method | Endpoint | Input | Output | Mục đích |
|--------|----------|-------|--------|----------|
| GET | `/health` | - | `{status: "ok"}` | Health check |
| GET | `/algorithms` | - | `{algorithms: [...]}` | List algorithms |
| GET | `/cities/random` | count, width, height | `{cities: [...]}` | Generate random cities |
| POST | `/solve` | algorithm, cities | path, distance, time | Solve TSP |
| POST | `/analyze` | cities | results[] | Compare all algorithms |

---

## Q4.2: Tại sao dùng POST cho /solve thay vì GET?

**Trả lời:**

**GET limitations:**
- Data trong URL → limited length (~2000 chars)
- Cities array có thể rất dài
- URL encoding phức tạp

**POST advantages:**
- Data trong body → unlimited size
- JSON format dễ parse
- Semantic: "solve" là action, không phải retrieve

---

## Q4.3: Response format như thế nào?

**Trả lời:**

```json
// POST /solve response
{
  "algorithm": "NEAREST_NEIGHBOR",
  "path": [0, 5, 12, 3, 8, 1, ...],
  "total_distance": 2450.75,
  "execution_time_ms": 0.35
}

// POST /analyze response
{
  "results": [
    {
      "algorithm": "NEAREST_NEIGHBOR",
      "distance": 2450.75,
      "path": [...],
      "execution_time_ms": 0.35
    },
    {
      "algorithm": "ACO",
      "distance": 2380.50,
      "path": [...],
      "execution_time_ms": 150.20
    },
    // ...
  ]
}
```

---

## Q4.4: Error handling trong API?

**Trả lời:**

```python
# Validation error (Pydantic)
# Invalid input → 422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "cities", 0, "x"],
      "msg": "value is not a valid float",
      "type": "type_error.float"
    }
  ]
}

# Business logic error
if len(request.cities) < 3:
    raise HTTPException(
        status_code=400,
        detail="Need at least 3 cities for analysis"
    )
# → 400 Bad Request
{
  "detail": "Need at least 3 cities for analysis"
}
```

---

# 5. Thuật Toán TSP

## Q5.1: So sánh 3 thuật toán?

**Trả lời:**

| Thuật toán | Time | Space | Quality | Deterministic |
|------------|------|-------|---------|---------------|
| Nearest Neighbor | O(n²) | O(n) | ~75-80% | ✅ Yes |
| Space Filling Curve | O(n log n) | O(n) | ~70-85% | ✅ Yes |
| Ant Colony | O(n² × iter) | O(n²) | ~95%+ | ❌ No |

---

## Q5.2: Giải thích Nearest Neighbor?

**Trả lời:**

```python
def solve_nearest_neighbor(cities):
    # 1. Start từ city đầu tiên
    current = 0
    unvisited = {1, 2, ..., n-1}
    path = [0]
    
    # 2. Lặp cho đến khi thăm hết
    while unvisited:
        # Tìm city gần nhất chưa thăm
        nearest = argmin(distance(current, j) for j in unvisited)
        path.append(nearest)
        unvisited.remove(nearest)
        current = nearest
    
    return path
```

**Ưu điểm:** Nhanh, đơn giản
**Nhược điểm:** Greedy → có thể bị stuck ở local optimum

---

## Q5.3: Giải thích Space Filling Curve (Hilbert)?

**Trả lời:**

```python
def solve_space_filling_curve(cities):
    # 1. Normalize coordinates về grid
    # 2. Tính Hilbert index cho mỗi city
    indices = [(hilbert_distance(x, y), city_id) for ...]
    
    # 3. Sort theo Hilbert index
    indices.sort()
    
    # 4. Extract path
    path = [city_id for _, city_id in indices]
    return path
```

**Ý tưởng:** Biến 2D → 1D, sort theo 1D index

**Hilbert curve:**
- Đường cong liên tục phủ toàn bộ không gian 2D
- Điểm gần nhau trong 2D → index gần nhau trong 1D

---

## Q5.4: Giải thích Ant Colony Optimization?

**Trả lời:**

```python
def solve_ant_colony(cities):
    pheromone = [[1.0] * n for _ in range(n)]  # Ma trận pheromone
    
    for iteration in range(max_iterations):
        # Mỗi kiến xây dựng 1 tour
        for ant in range(num_ants):
            tour = construct_tour(pheromone)
            # Nếu tour tốt → lưu lại
            
        # Cập nhật pheromone
        evaporate(pheromone)      # Bay hơi
        deposit(pheromone, tours)  # Tích tụ
    
    return best_tour
```

**Công thức chọn city tiếp theo:**
```
P(i→j) = [τᵢⱼ]^α × [ηᵢⱼ]^β / Σ[τᵢₖ]^α × [ηᵢₖ]^β
```
- τ = pheromone
- η = 1/distance (heuristic)
- α, β = trọng số

---

## Q5.5: Tại sao ACO cho kết quả tốt hơn?

**Trả lời:**

1. **Exploration + Exploitation:**
   - Pheromone cao → exploitation (đi đường đã biết tốt)
   - Random choice → exploration (khám phá đường mới)

2. **Positive feedback:**
   - Đường tốt → nhiều kiến đi → pheromone cao → càng nhiều kiến đi

3. **Multiple iterations:**
   - Không greedy 1 lần như NN
   - Học từ nhiều trial → converge to good solution

---

## Q5.6: Các tham số ACO ảnh hưởng thế nào?

**Trả lời:**

| Tham số | Giá trị | Ảnh hưởng nếu tăng |
|---------|---------|-------------------|
| `num_ants` | 30 | Thời gian ↑, exploration ↑ |
| `max_iterations` | 150 | Thời gian ↑, convergence ↑ |
| `alpha` (pheromone) | 1 | Exploitation ↑, có thể stuck |
| `beta` (heuristic) | 3 | Giống NN hơn |
| `evaporation` | 0.1 | Quên nhanh, exploration ↑ |

---

# 6. State Management & Data Flow

## Q6.1: Các state chính trong App.tsx?

**Trả lời:**

```typescript
// Data states
const [cities, setCities] = useState<City[]>([]);
const [path, setPath] = useState<number[]>([]);

// UI states
const [selectedAlgorithm, setSelectedAlgorithm] = useState(AlgorithmType.NEAREST_NEIGHBOR);
const [language, setLanguage] = useState<Language>('en');

// Loading states
const [isComputing, setIsComputing] = useState(false);  // API call in progress
const [isRunning, setIsRunning] = useState(false);      // Animation in progress

// Analysis states
const [analysisResults, setAnalysisResults] = useState<AnalysisResult[] | null>(null);
const [showAnalysis, setShowAnalysis] = useState(false);

// Error state
const [error, setError] = useState<string | null>(null);
```

---

## Q6.2: Tại sao dùng useRef cho targetPath?

**Trả lời:**

```typescript
const targetPathRef = useRef<number[]>([]);
```

**Lý do:**
1. **Không trigger re-render:** Thay đổi ref không gây re-render
2. **Persistent across renders:** Giữ giá trị giữa các render
3. **Access latest value:** Animation useEffect cần access latest path

**So sánh:**
- `useState`: Thay đổi → re-render → có thể gây loop
- `useRef`: Thay đổi → không re-render → ổn định

---

## Q6.3: Data flow cho Random Cities?

**Trả lời:**

```
1. User nhập count (30)
   ↓
2. Click "Random" button
   ↓
3. ControlPanel gọi onRandomize(30)
   ↓
4. App.tsx handleRandomize():
   - setIsComputing(true)
   - fetchRandomCities(30, width, height)
   ↓
5. API: GET /cities/random?count=30&width=800&height=600
   ↓
6. Backend generate_random_cities():
   - Random x, y với padding
   - Return cities với IDs
   ↓
7. Frontend nhận cities:
   - setCities(generated)
   - Sync cityIdCounter
   - setIsComputing(false)
   ↓
8. Canvas re-render với new cities
```

---

# 7. Performance & Optimization

## Q7.1: Những optimization đã thực hiện?

**Trả lời:**

| Optimization | File | Trước | Sau |
|--------------|------|-------|-----|
| City lookup | Canvas.tsx | `cities.find()` O(n) | `Map.get()` O(1) |
| Memoization | Canvas.tsx | Tính mỗi render | `useMemo` |
| ACO iterations | ant_colony.py | 50 | 150 (better convergence) |
| ACO runs | main.py | 1 | 3 (take best) |

---

## Q7.2: Tại sao dùng Map thay vì find()?

**Trả lời:**

```typescript
// Before: O(n) per lookup
const c1 = cities.find(c => c.id === cityId);

// After: O(1) per lookup
const cityMap = useMemo(() => {
  const map = new Map<number, City>();
  cities.forEach(city => map.set(city.id, city));
  return map;
}, [cities]);
const c1 = cityMap.get(cityId);
```

**Impact với 100 cities, 100 path segments:**
- Before: 100 × 100 = 10,000 comparisons
- After: 100 (build map) + 100 (lookups) = 200 operations

---

## Q7.3: Backend có bottleneck nào không?

**Trả lời:**

1. **ACO distance matrix:** O(n²) space và time
   ```python
   dists = [[calculate_distance(i, j) for j] for i]  # O(n²)
   ```

2. **ACO iterations:** O(n² × iterations × ants)
   - Với n=100, iter=150, ants=30 → 45M operations

3. **Potential improvement:**
   - Use numpy for vectorized operations
   - Parallel ant construction
   - Early termination if converged

---

# 8. Error Handling

## Q8.1: Frontend xử lý error như thế nào?

**Trả lời:**

```typescript
const [error, setError] = useState<string | null>(null);

const handleAnalyze = useCallback(async () => {
  try {
    setIsComputing(true);
    const results = await analyzeAlgorithms(cities);
    setAnalysisResults(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to analyze';
    setError(message);  // Set error state
  } finally {
    setIsComputing(false);
  }
}, [cities]);

// Error toast in UI
{error && (
  <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
    {error}
    <button onClick={() => setError(null)}>×</button>
  </div>
)}
```

---

## Q8.2: Backend xử lý error như thế nào?

**Trả lời:**

```python
# 1. Pydantic validation (auto)
# Invalid City → 422 Unprocessable Entity

# 2. Business logic validation
if not request.cities:
    raise HTTPException(status_code=400, detail="No cities provided")

if len(request.cities) < 3:
    raise HTTPException(status_code=400, detail="Need at least 3 cities")

# 3. Algorithm errors
if solver is None:
    raise HTTPException(status_code=400, detail="Unsupported algorithm")

# 4. Unhandled exceptions → 500 Internal Server Error (FastAPI default)
```

---

## Q8.3: ACO có edge case nào đặc biệt?

**Trả lời:**

```python
# Problem: 2 cities cùng vị trí → distance = 0 → division by zero
eta = 1.0 / distance  # ZeroDivisionError!

# Solution 1: Filter duplicates
seen_positions = set()
unique_cities = []
for city in cities:
    pos = (city.x, city.y)
    if pos not in seen_positions:
        seen_positions.add(pos)
        unique_cities.append(city)

# Solution 2: Safe division
eta = 1.0 / max(distance, 0.001)
```

---

# 9. Security

## Q9.1: CORS wildcard có vấn đề gì?

**Trả lời:**

```python
allow_origins=["*"]  # DANGEROUS in production!
```

**Risks:**
- Any website can call your API
- Potential for CSRF attacks
- Data exposure to malicious sites

**Fix for production:**
```python
allow_origins=["https://yourdomain.com", "https://www.yourdomain.com"]
```

---

## Q9.2: Input validation đã đủ chưa?

**Trả lời:**

```python
class City(BaseModel):
    id: int = Field(..., ge=0)      # ✅ >= 0
    x: float = Field(...)            # ⚠️ No bounds
    y: float = Field(...)            # ⚠️ No bounds

# Potential improvement
class City(BaseModel):
    id: int = Field(..., ge=0, le=1000000)
    x: float = Field(..., ge=0, le=10000)
    y: float = Field(..., ge=0, le=10000)
```

---

## Q9.3: Có cần rate limiting không?

**Trả lời:**

**Current:** Không có rate limiting

**Risk:** 
- DoS attack với nhiều request /analyze (CPU intensive)
- Flood /cities/random

**Solution:**
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/analyze")
@limiter.limit("10/minute")
def analyze_algorithms(request: AnalyzeRequest):
    # ...
```

---

# 10. Testing & Deployment

## Q10.1: Làm sao test frontend?

**Trả lời:**

```typescript
// Unit test với Jest/Vitest
import { render, fireEvent } from '@testing-library/react';
import { ControlPanel } from './ControlPanel';

test('calls onRun when Run button clicked', () => {
  const onRun = jest.fn();
  render(<ControlPanel onRun={onRun} {...otherProps} />);
  
  fireEvent.click(screen.getByText('Run'));
  expect(onRun).toHaveBeenCalled();
});

// E2E test với Playwright
test('full TSP flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Random');
  await page.click('text=Run');
  await expect(page.locator('.total-distance')).toBeVisible();
});
```

---

## Q10.2: Làm sao test backend?

**Trả lời:**

```python
# test_main.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_solve_tsp():
    response = client.post("/solve", json={
        "algorithm": "NEAREST_NEIGHBOR",
        "cities": [
            {"id": 0, "x": 0, "y": 0},
            {"id": 1, "x": 1, "y": 1},
            {"id": 2, "x": 2, "y": 0},
        ]
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["path"]) == 3
    assert data["total_distance"] > 0

def test_solve_empty_cities():
    response = client.post("/solve", json={
        "algorithm": "NEAREST_NEIGHBOR",
        "cities": []
    })
    assert response.status_code == 400
```

---

## Q10.3: Deployment flow?

**Trả lời:**

```
Frontend (Netlify/Vercel):
1. npm run build → dist/
2. Push to GitHub
3. Auto deploy via CI/CD

Backend (Railway/Render/AWS):
1. Dockerfile:
   FROM python:3.10
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

2. Environment variables:
   - CORS_ORIGINS=https://frontend.com

3. Health check: GET /health
```

---

# 11. Câu Hỏi Nâng Cao

## Q11.1: Làm sao scale với 1 triệu cities?

**Trả lời:**

1. **Algorithm selection:**
   - NN: O(n²) → ~1 trillion operations → quá chậm
   - SFC: O(n log n) → ~20 million operations → khả thi

2. **Optimizations:**
   - k-d tree cho nearest neighbor lookup: O(n log n)
   - Divide and conquer: chia thành clusters
   - Approximate algorithms: skip some cities

3. **Infrastructure:**
   - Parallel processing với multiprocessing
   - Distributed computing (Spark, Dask)
   - GPU acceleration (CUDA)

---

## Q11.2: So sánh với các thuật toán khác?

**Trả lời:**

| Algorithm | Time | Quality | Use case |
|-----------|------|---------|----------|
| **Brute force** | O(n!) | Optimal | n ≤ 10 |
| **DP (Held-Karp)** | O(n² × 2ⁿ) | Optimal | n ≤ 20 |
| **Branch & Bound** | Exponential | Optimal | n ≤ 30 |
| **NN** | O(n²) | ~80% | Real-time |
| **2-opt** | O(n²) per iter | ~95% | Post-processing |
| **ACO** | O(n² × iter) | ~95% | Quality focus |
| **Genetic Algorithm** | O(n × pop × gen) | ~95% | Exploration |
| **Lin-Kernighan** | O(n^2.2) | ~99% | Industry standard |

---

## Q11.3: Nếu thêm thuật toán mới, cần làm gì?

**Trả lời:**

```python
# 1. Tạo file mới: backend/app/algorithms/new_algo.py
def solve_new_algorithm(cities: List[City]) -> List[int]:
    # Implementation
    return path

# 2. Update schemas.py
class AlgorithmType(str, Enum):
    # ...existing...
    NEW_ALGORITHM = "NEW_ALGORITHM"

# 3. Update main.py
from .algorithms import solve_new_algorithm

ALGORITHM_DISPATCH = {
    # ...existing...
    AlgorithmType.NEW_ALGORITHM: solve_new_algorithm,
}

# 4. Update frontend types.ts
export enum AlgorithmType {
  // ...existing...
  NEW_ALGORITHM = 'NEW_ALGORITHM',
}

# 5. Update translations.ts
algoNames: {
  // ...existing...
  [AlgorithmType.NEW_ALGORITHM]: 'New Algorithm',
}
```

---

## Q11.4: Tại sao không dùng WebSocket?

**Trả lời:**

**Current:** REST API (request-response)

**WebSocket advantages:**
- Real-time progress updates
- Stream path incrementally
- Lower latency for rapid updates

**Why not used:**
- Algorithms complete quickly (< 1s typically)
- REST simpler to implement and debug
- No need for bidirectional communication

**When to consider WebSocket:**
- Very large datasets (n > 10000)
- Long-running optimization
- Multiple concurrent users seeing same visualization

---

## Q11.5: Real-world applications của TSP?

**Trả lời:**

| Industry | Application |
|----------|-------------|
| **Logistics** | Delivery route optimization (Amazon, UPS) |
| **Manufacturing** | PCB drilling order, robot arm paths |
| **Genomics** | DNA sequencing assembly |
| **Astronomy** | Telescope scheduling |
| **Computer graphics** | Plotter paths, laser cutting |
| **Retail** | Warehouse picking routes |

---

## Q11.6: Giải thích NP-hard?

**Trả lời:**

**NP = Non-deterministic Polynomial time**

1. **P problems:** Solved in polynomial time (O(n^k))
   - Sorting, searching, shortest path

2. **NP problems:** Verified in polynomial time
   - Given a solution, can check if it's correct quickly

3. **NP-hard:** At least as hard as NP problems
   - TSP: Finding optimal solution is NP-hard
   - No known polynomial algorithm
   - Best exact algorithms are exponential

**Implication:**
- Với n lớn, chỉ có thể tìm approximate solution
- Đó là lý do dùng heuristics (NN, ACO, SFC)

---

# 📝 Checklist Trước Vấn Đáp

- [ ] Hiểu flow tổng quan từ click → API → algorithm → render
- [ ] Giải thích được từng thuật toán
- [ ] Biết so sánh time/space complexity
- [ ] Hiểu React hooks (useState, useEffect, useCallback, useMemo, useRef)
- [ ] Giải thích được API design choices
- [ ] Biết các optimization đã làm
- [ ] Hiểu error handling ở cả 2 phía
- [ ] Aware của security considerations
- [ ] Có thể extend (thêm algorithm mới)
- [ ] Biết limitations và potential improvements

---

**Good luck với vấn đáp! 🍀**
