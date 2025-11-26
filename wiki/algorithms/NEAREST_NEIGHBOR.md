# 🧭 Nearest Neighbor (NN)

## 📖 Giới thiệu
**Nearest Neighbor** là một thuật toán tham lam (greedy) đơn giản cho bài toán TSP. Ý tưởng: bắt đầu từ một thành phố, lặp chọn thành phố **chưa thăm gần nhất** cho đến khi thăm hết. Thuật toán này **nhanh** nhưng kết quả không phải lúc nào cũng tối ưu.

---

## ⚙️ Pseudocode

```
function nearest_neighbor(cities):
    n = number of cities
    visited = [False] * n
    path = [0]  // bắt đầu từ thành phố 0
    visited[0] = True
    current = 0
    
    for step = 1 to n-1:
        next_city = -1
        min_distance = ∞
        
        for city = 0 to n-1:
            if not visited[city]:
                distance = dist(current, city)
                if distance < min_distance:
                    min_distance = distance
                    next_city = city
        
        path.append(next_city)
        visited[next_city] = True
        current = next_city
    
    return path
```

---

## 📊 Độ Phức Tạp

| Tiêu chí | Giá trị |
|----------|--------|
| **Time Complexity** | O(n²) |
| **Space Complexity** | O(n) |
| **Optimal** | ❌ (không đảm bảo) |
| **Speed** | ⚡ Rất nhanh |

**Giải thích:** 
- Loop ngoài: n vòng (chọn n-1 thành phố)
- Loop trong: n vòng (kiểm tra tất cả thành phố chưa thăm)
- Vì vậy: O(n × n) = O(n²)

---

## ✅ Ưu Điểm

1. **Nhanh chóng**: O(n²) là tương đối nhanh so với các thuật toán tối ưu khác
2. **Dễ hiểu & cài đặt**: Logic đơn giản, không cần tham số phức tạp
3. **Khả năng tiên đoán**: Kết quả có thể dự đoán được (lấy gần nhất lúc nào cũng gần)
4. **Baseline tốt**: Thường dùng làm điểm so sánh ban đầu

---

## ❌ Nhược Điểm

1. **Không tối ưu**: Chọn greedy không đảm bảo tìm được đường đi tốt nhất
2. **Local optima**: Có thể bị mắc vào cực tiểu địa phương (chọn gần nhất bây giờ dẫn tới xa sau)
3. **Phụ thuộc điểm bắt đầu**: Kết quả khác nhau nếu bắt đầu từ thành phố khác
4. **Không linh hoạt**: Không có cơ chế thoát khỏi quyết định sai

---

## 📈 Ví Dụ

Giả sử có 5 thành phố với tọa độ:
```
City 0: (0, 0)
City 1: (1, 1)
City 2: (5, 5)
City 3: (1, 5)
City 4: (5, 1)
```

**Chạy NN bắt đầu từ City 0:**

| Bước | Current | Chưa thăm | Gần nhất | Distance | Path |
|------|---------|-----------|---------|----------|------|
| 1 | 0 | {1,2,3,4} | 1 | 1.41 | [0] |
| 2 | 1 | {2,3,4} | 3 | 4.00 | [0,1] |
| 3 | 3 | {2,4} | 2 | 4.47 | [0,1,3] |
| 4 | 2 | {4} | 4 | 5.66 | [0,1,3,2] |
| 5 | 4 | {} | - | - | [0,1,3,2,4] |

**Kết quả:** Path = [0, 1, 3, 2, 4], Total Distance ≈ 15.54

---

## 🔧 Cài đặt (Python)

```python
import math
from typing import List, Tuple

def euclidean_distance(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def nearest_neighbor(cities: List[dict]) -> List[int]:
    """
    cities: [{"id": 0, "x": 0, "y": 0}, ...]
    return: [0, 1, 3, 2, 4] (indices)
    """
    n = len(cities)
    if n < 2:
        return list(range(n))
    
    visited = [False] * n
    path = [0]
    visited[0] = True
    current_idx = 0
    
    for _ in range(n - 1):
        current_city = cities[current_idx]
        next_idx = -1
        min_dist = float('inf')
        
        for i in range(n):
            if not visited[i]:
                dist = euclidean_distance(
                    (current_city['x'], current_city['y']),
                    (cities[i]['x'], cities[i]['y'])
                )
                if dist < min_dist:
                    min_dist = dist
                    next_idx = i
        
        path.append(next_idx)
        visited[next_idx] = True
        current_idx = next_idx
    
    return path
```

---

## 📊 So Sánh với các Thuật Toán Khác

| Thuật toán | Thời gian | Chất lượng | Dễ cài |
|-----------|----------|-----------|--------|
| **NN** | ⚡ O(n²) | ⭐⭐ trung bình | ✅ rất dễ |
| **Brute Force** | ❌ O(n!) | ⭐⭐⭐⭐⭐ tối ưu | ✅ dễ |
| **ACO** | ⏱️ O(n²·iter) | ⭐⭐⭐⭐ tốt | ❌ khó |
| **SFC** | ⚡ O(n log n) | ⭐⭐ nhanh | ✅ dễ |
| **Dynamic Programming** | ❌ O(n²·2ⁿ) | ⭐⭐⭐⭐⭐ tối ưu | ❌ rất khó |

---

## 💡 Khi Nào Dùng?

✅ **Dùng NN khi:**
- Cần kết quả nhanh (thời gian thực, demo)
- Chỉ cần một điểm so sánh ban đầu
- Dữ liệu nhỏ (n < 1000)
- Không yêu cầu tối ưu

❌ **Không dùng NN khi:**
- Cần kết quả tối ưu hoặc gần tối ưu
- Dữ liệu lớn (n > 10000) - dùng SFC nhanh hơn
- Có thời gian để tính toán - dùng ACO hay các thuật toán meta-heuristic khác

---

## 🔗 Tham chiếu

- **Backend code:** `backend/app/algorithms/nearest_neighbor.py`
- **Dataflow:** `wiki/NN_BUTTON_DATAFLOW.md`
- **Độ phức tạp:** Halting Problem, NP-Hardness

---

## 📝 Kết luận

Nearest Neighbor là một thuật toán **cơ bản, nhanh và dễ hiểu** cho TSP. Mặc dù không đảm bảo tối ưu, nhưng nó là lựa chọn tốt cho **visualization** và làm **baseline** so sánh với các thuật toán khác.
