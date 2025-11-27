# 🎲 Luồng Dữ Liệu - Nút Random Cities

## 📋 Tổng Quan
Tài liệu này mô tả chi tiết quá trình xử lý dữ liệu từ khi người dùng ấn nút "Random" cho đến khi các điểm thành phố ngẫu nhiên được hiển thị trên canvas.

---

## 🔄 Luồng Dữ Liệu Toàn Bộ


BƯỚC 1: User Ấn Nút (Frontend - ControlPanel.tsx)
```
Người dùng nhập số: "30"
        ↓
Ấn nút "Randomize" 
        ↓
handleRandomizeClick() được gọi:
  - Lấy giá trị từ input: inputValue = "30"
  - Chuyển đổi: num = parseInt("30", 10) = 30
  - Xác thực: 3 ≤ 30 ≤ 500 ✓
  - Gọi: onRandomize(30)
```
BƯỚC 2: React State Update (App.tsx)
```
onRandomize(30) → handleRandomize(30) được gọi:
  - setIsComputing(true) → hiển thị loading
  - Lấy kích thước canvas:
      canvasContainerRef.current?.clientWidth  → 800px
      canvasContainerRef.current?.clientHeight → 600px
  - Chuẩn bị dữ liệu:
      count = 30
      width = 800
      height = 600
  - Gọi: fetchRandomCities(30, 800, 600)
```
BƯỚC 3: HTTP Request (utils/api.ts)
```
fetchRandomCities(30, 800, 600):
  - Tạo URLSearchParams:
      count=30
      width=800
      height=600
  - URL được gọi: http://localhost:8000/cities/random?count=30&width=800&height=600
  - Method: GET
  - await fetch() → gửi request
```
BƯỚC 4: Backend Xử Lý (main.py)
```
Route: @app.get("/cities/random")
  - Nhận tham số:
      count: 30
      width: 800
      height: 600
  - Xác thực tham số:
      3 ≤ count ≤ 500 ✓
      100 ≤ width ≤ 4000 ✓
      100 ≤ height ≤ 4000 ✓
  - Gọi: generate_random_cities(30, 800, 600)
```
BƯỚC 5: Tạo Dữ Liệu (randomizer.py)
```
generate_random_cities(30, 800, 600):
  - Tính toán safe zone:
      safe_width = 800 - (30×2) = 740px
      safe_height = 600 - (30×2) = 540px
  - Loop 30 lần (idx = 0 to 29):
      x = random() × 740 + 30  → ~380.5 (ví dụ)
      y = random() × 540 + 30  → ~270.3 (ví dụ)
      Tạo: City(id=0, x=380.5, y=270.3)
      Tạo: City(id=1, x=..., y=...)
      ...
      Tạo: City(id=29, x=..., y=...)
  - Return: List[City] với 30 thành phố
```
BƯỚC 6: Định Dạng Response (schemas.py)
```
Dữ liệu trả về theo schema RandomCitiesResponse:
{
  "cities": [
    {"id": 0, "x": 380.5, "y": 270.3},
    {"id": 1, "x": 450.2, "y": 150.8},
    ...
    {"id": 29, "x": 620.1, "y": 420.5}
  ]
}
```
BƯỚC 7: Frontend Nhận Response (utils/api.ts)
```
handleResponse<BackendRandomCitiesResponse>(response):
  - Kiểm tra: response.ok === true ✓
  - Parse JSON: response.json()
  - Return: data.cities
         → Array[City] với 30 phần tử
```
BƯỚC 8: Update State (App.tsx)
```
await fetchRandomCities() → cities = [30 city objects]
        ↓
setCities(cities)
        ↓
resetRunState():
  - setPath([]) → xóa đường đi cũ
  - setIsRunning(false)
        ↓
setIsComputing(false) → tắt loading
```
BƯỚC 9: Re-render UI (Canvas.tsx)
```
State thay đổi:
  cities: [30 city objects] ← NEW
  path: []

Canvas component:
  - Loop through cities
  - Vẽ 30 điểm tròn trên canvas
  - Không vẽ đường nối (path rỗng)
  
Kết quả: 30 điểm ngẫu nhiên xuất hiện trên màn hình
```

---

## 📍 CHI TIẾT TỪNG BƯỚC

### **BƯỚC 1: User Interaction (ControlPanel.tsx)**

**File:** `components/ControlPanel.tsx`

```typescript
const handleRandomizeClick = () => {
  // 1. Lấy giá trị từ input field
  let num = parseInt(inputValue, 10);  // "30" → 30
  
  // 2. Xác thực giá trị (phía client)
  if (isNaN(num) || num < 3) num = 3;     // Tối thiểu: 3 thành phố
  if (num > 500) num = 500;               // Tối đa: 500 thành phố
  
  // 3. Cập nhật input hiển thị nếu có sửa đổi
  setInputValue(num.toString());
  
  // 4. Gọi callback từ App.tsx
  onRandomize(num);  // → onRandomize(30)
};
```

**Dữ liệu được truyền:**
- Input từ user: `30` (string)
- Output: `30` (number)

---

### **BƯỚC 2: State Management (App.tsx)**

**File:** `App.tsx`

```typescript
const handleRandomize = useCallback(
  async (count: number) => {
    // 1. Bắt đầu loading
    setIsComputing(true);
    
    try {
      // 2. Đo kích thước canvas thực tế từ DOM
      const { width, height } = measureCanvas();
      // width = 800 (clientWidth)
      // height = 600 (clientHeight)
      
      // 3. Gọi API fetch dữ liệu từ backend
      const generated = await fetchRandomCities(count, width, height);
      // generated = [
      //   {id: 0, x: 380.5, y: 270.3},
      //   {id: 1, x: 450.2, y: 150.8},
      //   ...
      //   {id: 29, x: 620.1, y: 420.5}
      // ]
      
      // 4. Cập nhật state cities
      setCities(generated);
      
      // 5. Reset trạng thái chạy
      resetRunState();  // setPath([]), setIsRunning(false)
      
    } catch (error) {
      // Xử lý lỗi
      console.error('Failed to fetch random cities', error);
    } finally {
      // 6. Tắt loading state
      setIsComputing(false);
    }
  },
  [measureCanvas, resetRunState]
);
```

**Dữ liệu được truyền:**
- Input: `count = 30`
- Canvas dimensions: `width = 800`, `height = 600`
- Output: `cities = Array<City>` (30 phần tử)

---

### **BƯỚC 3: HTTP Request (utils/api.ts)**

**File:** `utils/api.ts`

```typescript
export const fetchRandomCities = async (
  count: number,
  width: number,
  height: number
): Promise<City[]> => {
  // 1. Tạo query parameters
  const params = new URLSearchParams({
    count: count.toString(),         // "30"
    width: Math.round(width).toString(),    // "800"
    height: Math.round(height).toString(),  // "600"
  });
  
  // 2. Xây dựng URL
  // withBase() = "http://localhost:8000"
  // URL = "http://localhost:8000/cities/random?count=30&width=800&height=600"
  
  // 3. Gửi HTTP GET request
  const response = await fetch(
    withBase(`/cities/random?${params.toString()}`),
    { method: 'GET' }
  );
  
  // 4. Xử lý response
  const data = await handleResponse<BackendRandomCitiesResponse>(response);
  // data = {
  //   "cities": [
  //     {"id": 0, "x": 380.5, "y": 270.3},
  //     ...
  //   ]
  // }
  
  // 5. Trả về danh sách cities
  return data.cities;
};
```

**HTTP Request Details:**
```
GET /cities/random?count=30&width=800&height=600
Host: localhost:8000
Method: GET
```

**Response Format:**
```json
{
  "cities": [
    {"id": 0, "x": 380.5, "y": 270.3},
    {"id": 1, "x": 450.2, "y": 150.8},
    ...
    {"id": 29, "x": 620.1, "y": 420.5}
  ]
}
```

---

### **BƯỚC 4: Backend API (main.py)**

**File:** `backend/app/main.py`

```python
@app.get("/cities/random", response_model=RandomCitiesResponse)
def random_cities(
    count: int = Query(30, ge=3, le=500),      # Giá trị mặc định: 30, min: 3, max: 500
    width: int = Query(800, ge=100, le=4000),  # Giá trị mặc định: 800, min: 100, max: 4000
    height: int = Query(600, ge=100, le=4000), # Giá trị mặc định: 600, min: 100, max: 4000
) -> RandomCitiesResponse:
    # 1. Xác thực tham số (FastAPI tự động kiểm tra)
    # count: 3 ≤ 30 ≤ 500 ✓
    # width: 100 ≤ 800 ≤ 4000 ✓
    # height: 100 ≤ 600 ≤ 4000 ✓
    
    # 2. Gọi hàm tạo cities
    cities = generate_random_cities(count, width, height)
    # cities = [
    #   City(id=0, x=380.5, y=270.3),
    #   City(id=1, x=450.2, y=150.8),
    #   ...
    #   City(id=29, x=620.1, y=420.5)
    # ]
    
    # 3. Trả về response (FastAPI tự động chuyển thành JSON)
    return RandomCitiesResponse(cities=cities)
```

**Validation Rules:**
- `count`: 3 ≤ value ≤ 500
- `width`: 100 ≤ value ≤ 4000
- `height`: 100 ≤ value ≤ 4000

---

### **BƯỚC 5: Business Logic (randomizer.py)**

**File:** `backend/app/randomizer.py`

```python
PADDING = 30  # Lề an toàn (pixels)

def generate_random_cities(count: int, width: int, height: int) -> List[City]:
    """Tạo `count` thành phố giả ngẫu nhiên trong hình chữ nhật có lề."""
    
    # 1. Tính vùng an toàn (có lề)
    safe_width = max(width - PADDING * 2, 1)   # 800 - 60 = 740
    safe_height = max(height - PADDING * 2, 1) # 600 - 60 = 540
    
    # 2. Hàm tạo tọa độ ngẫu nhiên
    def random_coord(range_size: int) -> float:
        return random.random() * range_size + PADDING
        # random.random() trả về [0.0, 1.0)
        # Kết quả: [PADDING, PADDING + range_size)
    
    # 3. Loop tạo từng thành phố
    cities: List[City] = []
    for idx in range(count):  # idx = 0 to 29
        x = random_coord(safe_width)
        # Ví dụ: 0.5 * 740 + 30 = 400.0
        # hoặc: 0.75 * 740 + 30 = 585.0
        
        y = random_coord(safe_height)
        # Ví dụ: 0.3 * 540 + 30 = 192.0
        # hoặc: 0.9 * 540 + 30 = 516.0
        
        # Tạo City object
        cities.append(City(id=idx, x=x, y=y))
    
    # 4. Trả về danh sách cities
    return cities
```

**Ví dụ Kết Quả (5 thành phố):**
```
Iteration 0: City(id=0, x=150.3, y=320.5)
Iteration 1: City(id=1, x=580.7, y=450.2)
Iteration 2: City(id=2, x=400.1, y=200.8)
Iteration 3: City(id=3, x=720.4, y=480.3)
Iteration 4: City(id=4, x=250.9, y=100.6)
```

**Phạm Vi Tọa Độ:**
```
X: [30, 770]     (PADDING to PADDING + safe_width)
Y: [30, 570]     (PADDING to PADDING + safe_height)
```

---

### **BƯỚC 6: Data Models (schemas.py)**

**File:** `backend/app/schemas.py`

```python
from pydantic import BaseModel, Field

class City(BaseModel):
    """Mô hình dữ liệu cho một thành phố"""
    id: int = Field(..., ge=0)      # ID ≥ 0
    x: float = Field(...)           # Tọa độ X
    y: float = Field(...)           # Tọa độ Y

class RandomCitiesResponse(BaseModel):
    """Mô hình response cho endpoint /cities/random"""
    cities: List[City]              # Danh sách các thành phố
```

**JSON Serialization:**
```json
{
  "cities": [
    {"id": 0, "x": 150.3, "y": 320.5},
    {"id": 1, "x": 580.7, "y": 450.2},
    {"id": 2, "x": 400.1, "y": 200.8},
    {"id": 3, "x": 720.4, "y": 480.3},
    {"id": 4, "x": 250.9, "y": 100.6}
  ]
}
```

---

### **BƯỚC 7: Response Parsing (utils/api.ts)**

**File:** `utils/api.ts`

```typescript
const handleResponse = async <T>(response: Response): Promise<T> => {
  // 1. Kiểm tra HTTP status
  if (!response.ok) {  // status không phải 2xx
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  
  // 2. Parse JSON response
  return response.json() as Promise<T>;
};

// Gọi: handleResponse<BackendRandomCitiesResponse>(response)
// Input: Response object
// Output: { cities: City[] }
```

**Type Definitions:**
```typescript
type BackendRandomCitiesResponse = {
    cities: City[];
};

interface City {
    id: number;
    x: number;
    y: number;
}
```

---

### **BƯỚC 8: State Update (App.tsx)**

**File:** `App.tsx`

```typescript
// Sau khi nhận cities từ API
setCities(generated);
// State update trigger re-render

const resetRunState = useCallback(() => {
  setPath([]);           // Xóa đường đi cũ
  setIsRunning(false);   // Dừng animation
}, []);

setIsComputing(false);   // Tắt loading indicator
```

**State Changes:**
```javascript
Before:
{
  cities: [],
  path: [0, 5, 2, ...],
  isRunning: true,
  isComputing: false
}

After:
{
  cities: [{id:0, x:150.3, y:320.5}, ..., {id:29, x:620.1, y:420.5}],
  path: [],
  isRunning: false,
  isComputing: false
}
```

---

### **BƯỚC 9: UI Rendering (Canvas.tsx)**

**File:** `components/Canvas.tsx`

```typescript
interface CanvasProps {
  cities: City[];      // 30 thành phố
  path: number[];      // [] (rỗng)
  onCanvasClick: (x: number, y: number) => void;
  isRunning: boolean;
  language: Language;
}

// Khi cities thay đổi, component re-render
// Canvas loop through cities array:
//   for each city in cities:
//     - Vẽ điểm tròn tại (x, y)
//     - Vẽ ID hoặc label
//
// path rỗng → không vẽ đường nối
```

**Rendering Output:**
- 30 điểm tròn ngẫu nhiên trên canvas
- Không có đường nối
- Mỗi điểm hiển thị ID hoặc số thứ tự

---

## 📊 Bảng Tóm Tắt Dữ Liệu

| Bước | Component | Input | Output | Loại |
|------|-----------|-------|--------|------|
| 1 | ControlPanel | "30" (string) | 30 (number) | User Input |
| 2 | App | 30, 800, 600 | Promise<City[]> | State Setup |
| 3 | api.ts | count, width, height | HTTP Request | Network |
| 4 | main.py | Query params | Response Model | Backend |
| 5 | randomizer.py | count, width, height | List[City] | Logic |
| 6 | schemas.py | List[City] | JSON | Data Model |
| 7 | api.ts | JSON Response | City[] | Parsing |
| 8 | App | City[] | State Update | React |
| 9 | Canvas | City[] | SVG Elements | Rendering |

---

## 🔐 Validation Layers

### **Frontend Validation (ControlPanel.tsx)**
```typescript
if (val === '' || /^\d+$/.test(val)) {
  // Chỉ cho phép số
}
if (num < 3) num = 3;
if (num > 500) num = 500;
```

### **Backend Validation (main.py)**
```python
count: int = Query(30, ge=3, le=500)      # 3 ≤ count ≤ 500
width: int = Query(800, ge=100, le=4000)  # 100 ≤ width ≤ 4000
height: int = Query(600, ge=100, le=4000) # 100 ≤ height ≤ 4000
```

### **Data Structure Validation (schemas.py)**
```python
class City(BaseModel):
    id: int = Field(..., ge=0)  # ID ≥ 0
    x: float = Field(...)       # Bất kỳ float nào
    y: float = Field(...)       # Bất kỳ float nào
```

---

## ⚠️ Error Handling

### **Frontend Errors**
```typescript
try {
  const generated = await fetchRandomCities(count, width, height);
  setCities(generated);
  resetRunState();
} catch (error) {
  console.error('Failed to fetch random cities', error);
  // State không thay đổi
  // User vẫn thấy cities cũ
}
```

### **Backend Errors**
```python
# FastAPI tự động trả về lỗi nếu:
# - count < 3 hoặc > 500 → 422 Unprocessable Entity
# - width/height ngoài phạm vi → 422 Unprocessable Entity
# - Server error → 500 Internal Server Error
```

---

## 📈 Performance Considerations

1. **Canvas Measurement**: `measureCanvas()` đọc DOM - O(1)
2. **HTTP Request**: ~50-200ms (tùy network)
3. **Random Generation**: O(n) với n=30
4. **JSON Serialization**: O(n) với n=30
5. **DOM Rendering**: O(n) với n=30
6. **Total Time**: ~100-300ms (dominated by network latency)

---

## 🔗 Tham Chiếu File

| File | Vai Trò | Dòng Chính |
|------|---------|----------|
| `components/ControlPanel.tsx` | UI Button & Input | 161-169 |
| `App.tsx` | State Management | 73-85 |
| `utils/api.ts` | API Client | 50-61 |
| `backend/app/main.py` | API Endpoint | 64-75 |
| `backend/app/randomizer.py` | Logic | 13-31 |
| `backend/app/schemas.py` | Data Models | 14-44 |
| `components/Canvas.tsx` | Rendering | - |

---

## 📝 Kết Luận

Nút Random là một ví dụ hoàn hảo về kiến trúc client-server:

1. **User** nhập số và ấn nút
2. **Frontend** xác thực và gửi request
3. **Backend** tạo dữ liệu ngẫu nhiên
4. **Frontend** nhận dữ liệu và cập nhật UI
5. **User** thấy 30 điểm mới xuất hiện

Toàn bộ quá trình được xử lý không đồng bộ (async) và có các lớp validation ở cả frontend và backend.
