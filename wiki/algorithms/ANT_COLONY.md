# 🐜 Ant Colony Optimization (ACO)

## 📖 Giới Thiệu

**Ant Colony Optimization (ACO)** là một thuật toán **meta-heuristic** bắt chước cách hành động của kiến thực sự. Kiến giao tiếp qua **pheromone** (chất hóa học): kiến để lại pheromone trên đường đã đi, kiến khác sẽ mạnh dạn đi theo đường có pheromone cao hơn. Thuật toán sử dụng cơ chế này để tìm các tour tốt trong TSP.

---

## 🔄 Cách Hoạt Động

### Bước Cơ Bản

1. **Khởi tạo** pheromone matrix (nxn) với giá trị đều nhau
2. **Mỗi iteration (vòng lặp):**
   - Mỗi con kiến xây dựng một **tour** từ điểm đầu
     - Ở mỗi bước, kiến chọn thành phố tiếp theo dựa trên xác suất:
       - P(i→j) ∝ [pheromone(i,j)]^α × [heuristic(i,j)]^β
     - `heuristic(i,j)` = 1/distance(i,j)
   - Tính độ dài tour mỗi kiến
   - Lưu **best_tour** (tour ngắn nhất)
   
3. **Cập nhật pheromone:**
   - **Evaporation** (bay hơi): `pheromone *= (1 - evaporation_rate)`
   - **Deposit** (tích tụ): kiến để lại pheromone tỷ lệ với chất lượng tour
     - `pheromone(i,j) += Q / tour_length` (nếu kiến đi từ i→j)

4. **Lặp lại** cho đến khi hội tụ

---

## ⚙️ Pseudocode

```
function ant_colony_optimization(cities):
    n = number of cities
    pheromone = init_matrix(n, n, initial_pheromone_value)
    heuristic = compute_1_over_distance(cities)
    
    best_tour = None
    best_length = ∞
    
    for iter = 1 to n_iterations:
        all_tours = []
        
        // Mỗi kiến xây dựng tour
        for ant = 1 to n_ants:
            tour = construct_solution(pheromone, heuristic, alpha, beta)
            length = tour_length(tour)
            all_tours.append((tour, length))
            
            // Cập nhật best tour
            if length < best_length:
                best_length = length
                best_tour = tour
        
        // Evaporate pheromone
        pheromone *= (1 - evaporation_rate)
        
        // Deposit pheromone từ mỗi kiến
        for (tour, length) in all_tours:
            for (i, j) in tour_edges(tour):
                pheromone[i][j] += Q / length
    
    return best_tour
```

---

## 📊 Tham Số ACO

| Tham số | Ý nghĩa | Phạm vi thông dụng |
|---------|---------|-------------------|
| **n_ants** | Số con kiến mỗi iteration | 10 - 100 |
| **n_iterations** | Số vòng lặp | 100 - 10000 |
| **alpha (α)** | Trọng số pheromone | 1.0 - 2.0 |
| **beta (β)** | Trọng số heuristic (1/distance) | 2.0 - 5.0 |
| **evaporation_rate** | Tỷ lệ pheromone bay hơi mỗi iteration | 0.01 - 0.5 |
| **Q** | Hằng số pheromone deposit | tùy chiều dài |

**Ảnh hưởng:**
- α cao → ưu tiên pheromone → tìm kiếm local (khai thác)
- β cao → ưu tiên heuristic (gần nhất) → giống NN hơn
- evaporation_rate cao → quên nhanh → tìm kiếm global hơn

---

## ✅ Ưu Điểm

1. **Chất lượng tốt**: Thường tìm được tour gần tối ưu, đặc biệt khi có đủ iteration
2. **Linh hoạt**: Có thể tùy chỉnh tham số để cân bằng tìm kiếm local vs global
3. **Thoát khỏi local optima**: Pheromone tạo ra cơ chế "ghi nhớ" và exploration
4. **Mở rộng được**: Dễ thêm các ràng buộc hoặc biến thể (ACS, MMAS, ...)

---

## ❌ Nhược Điểm

1. **Chậm**: O(n_ants × n_iterations × n²) - có thể chậm với dữ liệu lớn
2. **Tham số phức tạp**: Cần tùy chỉnh α, β, evaporation_rate để có kết quả tốt
3. **Không ổn định**: Kết quả có thể dao động tùy vào khởi tạo ngẫu nhiên
4. **Hội tụ chậm**: Có thể cần rất nhiều iteration để hội tụ

---

## 📈 Ví Dụ

Giả sử 4 thành phố, α=1, β=2, 2 kiến, 2 iterations:

**Iteration 1:**
- Kiến 1 xây tour: [0,2,3,1] - length=20
- Kiến 2 xây tour: [0,1,3,2] - length=22
- best_tour = [0,2,3,1]
- Cập nhật pheromone: pheromone[0,2], pheromone[2,3], ... tăng

**Iteration 2:**
- Kiến 1 xây tour: [0,2,3,1] - length=20 (lại được tour tốt)
- Kiến 2 xây tour: [0,2,1,3] - length=21
- best_tour = [0,2,3,1]
- ...

---

## 🔧 Cài đặt (Python - tóm tắt)

```python
import math
import random
import numpy as np

def ant_colony_optimization(cities, n_ants=30, n_iterations=100, alpha=1.5, beta=2.0, evaporation_rate=0.2, Q=1.0):
    n = len(cities)
    
    # Tính heuristic (1/distance)
    heuristic = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            if i != j:
                d = euclidean_distance(cities[i], cities[j])
                heuristic[i][j] = 1.0 / d if d > 0 else float('inf')
    
    # Khởi tạo pheromone
    pheromone = np.ones((n, n)) * 0.1
    
    best_tour = None
    best_length = float('inf')
    
    for iteration in range(n_iterations):
        all_tours = []
        
        # Mỗi kiến xây dựng tour
        for ant in range(n_ants):
            tour = construct_tour(pheromone, heuristic, alpha, beta, n)
            length = calculate_tour_length(tour, cities)
            all_tours.append((tour, length))
            
            if length < best_length:
                best_length = length
                best_tour = tour
        
        # Evaporate pheromone
        pheromone *= (1 - evaporation_rate)
        
        # Deposit pheromone
        for tour, length in all_tours:
            for i in range(n):
                next_i = (i + 1) % n
                pheromone[tour[i]][tour[next_i]] += Q / length
    
    return best_tour

def construct_tour(pheromone, heuristic, alpha, beta, n):
    tour = [0]
    unvisited = set(range(1, n))
    current = 0
    
    while unvisited:
        # Tính xác suất
        probs = {}
        sum_prob = 0
        for j in unvisited:
            prob = (pheromone[current][j] ** alpha) * (heuristic[current][j] ** beta)
            probs[j] = prob
            sum_prob += prob
        
        # Chọn theo roulette wheel
        if sum_prob > 0:
            r = random.random() * sum_prob
            cumsum = 0
            for j, prob in probs.items():
                cumsum += prob
                if r <= cumsum:
                    next_city = j
                    break
        else:
            next_city = random.choice(list(unvisited))
        
        tour.append(next_city)
        unvisited.remove(next_city)
        current = next_city
    
    return tour
```

---

## 📊 So Sánh Hiệu Năng

Với 100 thành phố ngẫu nhiên:

| Tiêu chí | NN | SFC | ACO |
|----------|----|----|-----|
| **Thời gian (ms)** | 5 | 3 | 500-5000 |
| **Chất lượng (% optimum)** | 85% | 80% | 95%+ |
| **Ổn định** | Cao | Cao | Thấp |
| **Tham số** | 0 | 0 | 5+ |

---

## 💡 Khi Nào Dùng?

✅ **Dùng ACO khi:**
- Cần chất lượng tốt (gần tối ưu)
- Có thời gian cho tính toán
- Dữ liệu trung bình (n < 10000)
- Có thể tùy chỉnh tham số

❌ **Không dùng ACO khi:**
- Cần kết quả ngay lập tức
- Dữ liệu rất lớn (n > 100000)
- Không có thời gian tìm tham số tối ưu

---

## 🔗 Tham chiếu

- **Backend code:** `backend/app/algorithms/ant_colony.py`
- **Dataflow:** `wiki/ACO_BUTTON_DATAFLOW.md`
- **Paper gốc:** "Ant System" - Dorigo, Maniezzo, Colorni (1992)

---

## 📝 Kết luận

ACO là một thuật toán mạnh mẽ cho TSP, với khả năng **tìm được giải pháp chất lượng cao**. Tuy chậm hơn NN hay SFC, nhưng kết quả thường tốt hơn đáng kể. ACO rất phù hợp cho các bài toán yêu cầu **cân bằng giữa thời gian tính toán và chất lượng kết quả**.
