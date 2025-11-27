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

# 5.5 CÂU HỎI NÂNG CAO VỀ THUẬT TOÁN

## Q5.7: Chứng minh độ phức tạp O(n²) của Nearest Neighbor?

**Trả lời:**

```
Vòng lặp ngoài: n-1 lần (chọn n-1 thành phố)
  └── Vòng lặp trong: trung bình n/2 lần (tìm min trong unvisited)

Tổng số phép so sánh:
= (n-1) + (n-2) + (n-3) + ... + 1
= n(n-1)/2
= O(n²)
```

**Chi tiết:**
- Bước 1: So sánh n-1 cities
- Bước 2: So sánh n-2 cities
- ...
- Bước n-1: So sánh 1 city

---

## Q5.8: Nearest Neighbor có đảm bảo tìm được lời giải tối ưu không? Chứng minh.

**Trả lời:**

**KHÔNG đảm bảo tối ưu.**

**Phản ví dụ:**

```
      B(1,2)
     /     \
    /       \
   A(0,0)---C(2,0)---D(4,0)

Khoảng cách:
- A-B = √5 ≈ 2.24
- A-C = 2
- B-C = √5 ≈ 2.24
- C-D = 2
- B-D = √13 ≈ 3.61
- A-D = 4
```

**NN từ A:**
1. A → C (gần nhất = 2)
2. C → D (gần nhất = 2)
3. D → B (còn lại = 3.61)
4. B → A (về = 2.24)
**Total: 9.85**

**Tour tối ưu:**
A → B → C → D → A = 2.24 + 2.24 + 2 + 4 = **10.48**

Hmm, trong trường hợp này NN lại tốt hơn! Nhưng có cases khác:

```
     B(0,1)          C(3,1)
        \              /
         \            /
          A(1,0)----D(2,0)

NN: A→D→C→B→A có thể tệ hơn A→B→C→D→A
```

**Kết luận:** NN không optimal vì quyết định greedy tại mỗi bước không xét tương lai.

---

## Q5.9: Approximation ratio của Nearest Neighbor là bao nhiêu?

**Trả lời:**

**Worst-case ratio:** O(log n)

**Định lý (Rosenkrantz et al., 1977):**
```
L_NN / L_OPT ≤ (1/2) × (⌈log₂ n⌉ + 1)
```

**Ý nghĩa:**
- n = 100 cities → ratio ≤ 4
- n = 1000 cities → ratio ≤ 5.5
- Worst case, NN có thể tệ hơn optimal **log(n) lần**

**Thực tế:**
- Average ratio ≈ 1.20 - 1.25 (tệ hơn 20-25%)
- Thường tốt hơn worst-case nhiều

---

## Q5.10: Tại sao NN phụ thuộc vào điểm bắt đầu?

**Trả lời:**

```python
# Ví dụ: 4 cities hình vuông
#   B --- C
#   |     |
#   A --- D

# Bắt đầu từ A:
# A → B → C → D → A (hoặc A → D → C → B → A)

# Bắt đầu từ B:
# B → A → D → C → B (có thể khác!)
```

**Giải pháp: Multi-start NN**
```python
def multi_start_nn(cities):
    best = None
    for start in range(len(cities)):
        tour = nn_from(cities, start)
        if best is None or tour_length(tour) < tour_length(best):
            best = tour
    return best
```
- Time: O(n³) thay vì O(n²)
- Quality: Tốt hơn đáng kể

---

## Q5.11: Giải thích chi tiết Hilbert Curve?

**Trả lời:**

**Hilbert curve** là đường cong fractal được xây dựng đệ quy:

```
Bậc 1 (2×2):     Bậc 2 (4×4):         Bậc 3 (8×8):
┌─┐              ┌─┬─┐ ┌─┬─┐          (phức tạp hơn)
│ │              │ │ │ │ │ │
└─┘              ├─┘ └─┼─┘ │
                 │     │   │
                 └─────┴───┘

Thứ tự duyệt:
0 → 1            0→1→2→3              Theo pattern
↓   ↑            ↓     ↓              đệ quy
3 ← 2            7←6←5←4
                 ↓
                 8→9→...
```

**Công thức đệ quy:**
```python
def hilbert_xy2d(n, x, y):
    """Convert (x,y) to Hilbert index d"""
    d = 0
    s = n // 2
    while s > 0:
        rx = 1 if (x & s) > 0 else 0
        ry = 1 if (y & s) > 0 else 0
        d += s * s * ((3 * rx) ^ ry)
        x, y = rotate(s, x, y, rx, ry)
        s //= 2
    return d
```

**Tại sao Hilbert tốt cho TSP?**
- **Locality preservation:** Điểm gần trong 2D → index gần trong 1D
- Không có "jump" lớn như Morton curve

---

## Q5.12: So sánh Morton (Z-order) vs Hilbert curve?

**Trả lời:**

```
Morton (Z-order):              Hilbert:
0  1  4  5                     0  1  14 15
2  3  6  7                     3  2  13 12
8  9  12 13                    4  7  8  11
10 11 14 15                    5  6  9  10

Nhảy lớn: 3→4 (từ 3 sang 8)    Liên tục, không nhảy
```

| Tiêu chí | Morton | Hilbert |
|----------|--------|---------|
| **Tính toán** | Bit interleave (nhanh) | Đệ quy (chậm hơn) |
| **Locality** | Có jumps | Liên tục |
| **TSP quality** | ~80% | ~85% |
| **Implementation** | 5 dòng code | 30+ dòng code |

**Code Morton:**
```python
def morton(x, y):
    result = 0
    for i in range(16):
        result |= ((x >> i) & 1) << (2*i)
        result |= ((y >> i) & 1) << (2*i + 1)
    return result
```

---

## Q5.13: Giải thích chi tiết công thức xác suất trong ACO?

**Trả lời:**

```
            [τᵢⱼ]^α × [ηᵢⱼ]^β
P(i→j) = ──────────────────────────
          Σₖ [τᵢₖ]^α × [ηᵢₖ]^β
```

**Trong đó:**
- `τᵢⱼ` = pheromone trên cạnh (i,j), ban đầu = 1.0
- `ηᵢⱼ` = 1/distance(i,j) = heuristic (visibility)
- `α` = trọng số pheromone (mặc định = 1)
- `β` = trọng số heuristic (mặc định = 3)
- `k` chạy qua tất cả cities chưa thăm

**Ví dụ:**
```
Kiến ở city A, chưa thăm: B, C, D
- τ_AB = 2.0, d_AB = 10 → η_AB = 0.1
- τ_AC = 1.0, d_AC = 5  → η_AC = 0.2
- τ_AD = 1.5, d_AD = 8  → η_AD = 0.125

Với α=1, β=2:
- P(A→B) ∝ 2.0¹ × 0.1² = 0.02
- P(A→C) ∝ 1.0¹ × 0.2² = 0.04
- P(A→D) ∝ 1.5¹ × 0.125² = 0.023

Tổng = 0.083
P(A→B) = 0.02/0.083 = 24%
P(A→C) = 0.04/0.083 = 48%  ← Most likely
P(A→D) = 0.023/0.083 = 28%
```

---

## Q5.14: Evaporation trong ACO hoạt động thế nào và tại sao cần?

**Trả lời:**

**Công thức:**
```python
# Sau mỗi iteration
for i in range(n):
    for j in range(n):
        pheromone[i][j] *= (1 - evaporation_rate)
```

Với `evaporation_rate = 0.1`:
- Mỗi iteration, pheromone giảm 10%
- Sau 10 iterations: còn 0.9^10 ≈ 35%
- Sau 20 iterations: còn 0.9^20 ≈ 12%

**Tại sao cần evaporation?**

1. **Tránh stuck ở local optimum:**
   - Nếu không evaporate → đường cũ luôn có pheromone cao nhất
   - Kiến sẽ không khám phá đường mới

2. **Cho phép "quên" đường tệ:**
   - Đường không tốt → ít kiến đi → ít deposit
   - Evaporation làm pheromone giảm → kiến sẽ thử đường khác

3. **Cân bằng exploration/exploitation:**
   - `evaporation` cao → quên nhanh → exploration nhiều
   - `evaporation` thấp → nhớ lâu → exploitation nhiều

---

## Q5.15: Deposit pheromone hoạt động thế nào?

**Trả lời:**

**Công thức:**
```python
def deposit_pheromones(path, tour_length):
    deposit = Q / tour_length  # Q = 100 (constant)
    
    for i in range(len(path)):
        a = path[i]
        b = path[(i + 1) % len(path)]
        pheromone[a][b] += deposit
        pheromone[b][a] += deposit  # Symmetric
```

**Ví dụ:**
```
Tour 1: A→B→C→D→A, length = 100
  deposit = 100/100 = 1.0
  τ_AB += 1.0, τ_BC += 1.0, τ_CD += 1.0, τ_DA += 1.0

Tour 2: A→C→B→D→A, length = 150
  deposit = 100/150 = 0.67
  τ_AC += 0.67, τ_CB += 0.67, ...

→ Sau nhiều iterations:
  Đường ngắn → deposit nhiều → pheromone cao → kiến đi nhiều hơn
```

**Positive feedback loop:**
```
Đường tốt → Deposit nhiều → Pheromone cao → Kiến đi nhiều → Deposit nhiều hơn
```

---

## Q5.16: Tại sao ACO là stochastic? Có cách nào làm deterministic không?

**Trả lời:**

**Nguồn ngẫu nhiên trong ACO:**

1. **Roulette wheel selection:**
```python
# Chọn city tiếp theo theo xác suất
threshold = random.random() * total_weight
for candidate, weight in zip(candidates, weights):
    threshold -= weight
    if threshold <= 0:
        return candidate
```

2. **Starting position:**
```python
current = random.randrange(n)  # Random start
```

**Cách làm deterministic (không khuyến khích):**

```python
# Thay roulette wheel bằng greedy:
def choose_next_city_deterministic(current, unvisited):
    best = None
    best_score = 0
    for j in unvisited:
        score = pheromone[current][j]**alpha * (1/dist[current][j])**beta
        if score > best_score:
            best_score = score
            best = j
    return best
```

**Tại sao KHÔNG nên deterministic?**
- Mất khả năng exploration
- Dễ stuck ở local optimum
- Giống NN với pheromone bias

---

## Q5.17: ACO có hội tụ (converge) không? Bao lâu?

**Trả lời:**

**Có hội tụ**, nhưng tốc độ phụ thuộc tham số.

**Quá trình hội tụ:**
```
Iteration 1:   τ = [1.0, 1.0, 1.0, ...]     Đều nhau
Iteration 10:  τ = [0.8, 1.5, 0.9, ...]     Bắt đầu khác
Iteration 50:  τ = [0.3, 3.0, 0.4, ...]     Đường tốt nổi bật
Iteration 150: τ = [0.1, 5.0, 0.1, ...]     Gần hội tụ
```

**Yếu tố ảnh hưởng tốc độ hội tụ:**

| Tham số | Tăng | Ảnh hưởng hội tụ |
|---------|------|------------------|
| num_ants | ↑ | Nhanh hơn |
| alpha | ↑ | Nhanh hơn (nhưng dễ stuck) |
| evaporation | ↑ | Chậm hơn |
| beta | ↑ | Nhanh hơn (giống NN) |

**Làm sao biết đã hội tụ?**
```python
# Nếu best_distance không cải thiện sau k iterations
no_improvement_count = 0
for iteration in range(max_iterations):
    # ... run ants ...
    if new_best < current_best:
        current_best = new_best
        no_improvement_count = 0
    else:
        no_improvement_count += 1
    
    if no_improvement_count > 20:  # Early stopping
        break
```

---

## Q5.18: Premature convergence là gì? Cách khắc phục?

**Trả lời:**

**Premature convergence:** Hội tụ quá sớm vào local optimum, không tìm được global optimum.

**Triệu chứng:**
- Tất cả kiến đi cùng 1 đường
- Best solution không cải thiện sau nhiều iterations
- Pheromone tập trung quá mức vào một số cạnh

**Nguyên nhân:**
- `alpha` quá cao → chỉ follow pheromone
- `evaporation` quá thấp → không quên đường cũ
- `num_ants` quá ít → exploration kém

**Giải pháp:**

1. **Tăng evaporation:**
```python
evaporation = 0.3  # Thay vì 0.1
```

2. **Giới hạn pheromone (MMAS - Max-Min Ant System):**
```python
tau_min = 0.01
tau_max = 10.0
pheromone[i][j] = max(tau_min, min(tau_max, pheromone[i][j]))
```

3. **Reset pheromone khi stuck:**
```python
if no_improvement > threshold:
    pheromone = [[1.0] * n for _ in range(n)]  # Reset
```

4. **Chạy nhiều lần với random seeds khác:**
```python
ACO_RUNS = 3
best_overall = min(run_aco() for _ in range(ACO_RUNS))
```

---

## Q5.19: So sánh ACO với Genetic Algorithm?

**Trả lời:**

| Tiêu chí | ACO | Genetic Algorithm |
|----------|-----|-------------------|
| **Inspiration** | Kiến tìm thức ăn | Tiến hóa sinh học |
| **Population** | Ants | Chromosomes |
| **Memory** | Pheromone matrix | Fitness scores |
| **Operators** | Evaporate, Deposit | Crossover, Mutation |
| **Solution** | Path construction | Path encoding |
| **TSP quality** | ~95% | ~95% |
| **Convergence** | Thường nhanh hơn | Thường chậm hơn |
| **Parameters** | 5-6 | 4-5 |

**GA cho TSP:**
```python
# Chromosome = permutation của cities
# [0, 3, 1, 4, 2] = tour 0→3→1→4→2→0

# Crossover: Order crossover (OX)
# Mutation: Swap 2 cities
# Selection: Tournament selection
```

---

## Q5.20: Edge cases trong implementation?

**Trả lời:**

### 1. Cities ít (n < 3):
```python
if len(cities) < 2:
    return [city.id for city in cities]
```

### 2. Cities trùng vị trí (distance = 0):
```python
# Problem: eta = 1/0 → infinity!
# Solution:
eta = 1.0 / max(distance, 0.001)

# Hoặc filter duplicates:
seen = set()
unique = [c for c in cities if (c.x, c.y) not in seen and not seen.add((c.x, c.y))]
```

### 3. Tất cả cities trên 1 đường thẳng:
```python
# SFC có thể không tối ưu
# NN và ACO vẫn hoạt động tốt
```

### 4. Coordinates rất lớn hoặc rất nhỏ:
```python
# SFC: Cần normalize về grid
x_norm = int((city.x / max_coord) * (GRID_SIZE - 1))
```

### 5. Floating point precision:
```python
# Khi so sánh distances
if abs(d1 - d2) < 1e-9:
    # Consider equal
```

---

## Q5.21: Làm sao cải thiện NN đơn giản?

**Trả lời:**

### 1. Multi-start NN:
```python
best = min(nn_from(start) for start in range(n))
# O(n³) nhưng tốt hơn nhiều
```

### 2. NN + 2-opt:
```python
def two_opt(tour):
    improved = True
    while improved:
        improved = False
        for i in range(1, n-1):
            for j in range(i+1, n):
                if swap_improves(tour, i, j):
                    tour[i:j+1] = reversed(tour[i:j+1])
                    improved = True
    return tour

final_tour = two_opt(nearest_neighbor(cities))
```

### 3. NN + Or-opt:
```python
# Di chuyển sequence 1-3 cities sang vị trí khác
```

**So sánh kết quả:**

| Method | Quality | Time |
|--------|---------|------|
| NN | ~80% | O(n²) |
| Multi-start NN | ~85% | O(n³) |
| NN + 2-opt | ~95% | O(n³) |
| NN + 3-opt | ~98% | O(n⁴) |

---

## Q5.22: Tại sao SFC nhanh nhất?

**Trả lời:**

**Breakdown thời gian:**

| Bước | NN | SFC | ACO |
|------|-----|-----|-----|
| Distance matrix | O(n²) | ❌ | O(n²) |
| Main algorithm | O(n²) | O(n) | O(n² × iter × ants) |
| Sorting | ❌ | O(n log n) | ❌ |
| **Total** | **O(n²)** | **O(n log n)** | **O(n² × iter × ants)** |

**Tại sao SFC không cần distance matrix?**
- Chỉ cần tọa độ (x, y) → tính Hilbert index
- Không so sánh khoảng cách giữa các cặp cities

**Benchmark (n = 10,000):**
- NN: ~5 seconds
- SFC: ~0.1 seconds
- ACO: ~500 seconds

---

## Q5.23: Có thể hybrid các thuật toán không?

**Trả lời:**

**Có! Một số combinations phổ biến:**

### 1. SFC + 2-opt:
```python
initial = space_filling_curve(cities)
final = two_opt(initial)
# Nhanh + chất lượng tốt
```

### 2. NN + ACO:
```python
# Dùng NN tour để seed pheromone ban đầu
nn_tour = nearest_neighbor(cities)
for i in range(len(nn_tour)):
    a, b = nn_tour[i], nn_tour[(i+1) % n]
    pheromone[a][b] = 2.0  # Higher initial
# Sau đó chạy ACO
```

### 3. ACO + Local search:
```python
for iteration in range(max_iterations):
    for ant in range(num_ants):
        tour = construct_tour()
        tour = two_opt(tour)  # Improve each ant's tour
        # ...
```

### 4. Portfolio approach:
```python
# Chạy tất cả, lấy best
results = [nn(cities), sfc(cities), aco(cities)]
best = min(results, key=tour_length)
```

---

## Q5.24: Real-time performance - thuật toán nào phù hợp?

**Trả lời:**

**Yêu cầu real-time:** Response < 100ms

| n | NN | SFC | ACO |
|---|-----|-----|-----|
| 50 | ✅ 0.5ms | ✅ 0.1ms | ❌ 150ms |
| 100 | ✅ 2ms | ✅ 0.2ms | ❌ 500ms |
| 500 | ✅ 50ms | ✅ 1ms | ❌ 5s |
| 1000 | ⚠️ 200ms | ✅ 2ms | ❌ 20s |
| 10000 | ❌ 20s | ✅ 20ms | ❌ 30min |

**Khuyến nghị:**
- n < 100: Dùng ACO nếu có thời gian
- n < 1000: Dùng NN
- n > 1000: Dùng SFC
- Real-time mọi n: SFC

---

## Q5.25: Làm sao đo "chất lượng" của solution?

**Trả lời:**

### 1. So với optimal (nếu biết):
```python
quality = optimal_distance / solution_distance * 100
# 95% = solution dài hơn optimal 5%
```

### 2. So với lower bound:
```python
# MST lower bound
mst = minimum_spanning_tree(cities)
lower_bound = mst_weight
quality = lower_bound / solution_distance * 100
```

### 3. So với các thuật toán khác:
```python
results = {
    'NN': nn_distance,
    'SFC': sfc_distance,
    'ACO': aco_distance
}
best = min(results.values())
for algo, dist in results.items():
    print(f"{algo}: {best/dist*100:.1f}%")
```

### 4. Nhiều lần chạy (cho stochastic):
```python
runs = [aco(cities) for _ in range(10)]
print(f"Mean: {mean(runs):.2f}")
print(f"Std:  {std(runs):.2f}")
print(f"Best: {min(runs):.2f}")
```

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
