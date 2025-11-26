# 📚 Thuật Toán TSP - Tài Liệu Tham Khảo

## 🎯 Tổng Quan

Tài liệu này là **index** cho ba thuật toán chính được triển khai trong TSP Visualizer:

1. **Nearest Neighbor (NN)** - Greedy, nhanh
2. **Ant Colony Optimization (ACO)** - Meta-heuristic, chất lượng cao
3. **Space Filling Curve (SFC)** - Geometric, cực nhanh

---

## 📖 Hướng Dẫn Chi Tiết

### 🧭 Nearest Neighbor (NN)
**Tệp:** [`NEAREST_NEIGHBOR.md`](./NEAREST_NEIGHBOR.md)

- **Thời gian:** O(n²)
- **Chất lượng:** ⭐⭐ Trung bình
- **Tốc độ:** ⚡ Nhanh
- **Tham số:** Không có
- **Mô tả:** Bắt đầu từ 1 điểm, lặp chọn thành phố gần nhất chưa thăm

**Phù hợp cho:** Visualization ban đầu, baseline so sánh

---

### 🐜 Ant Colony Optimization (ACO)
**Tệp:** [`ANT_COLONY.md`](./ANT_COLONY.md)

- **Thời gian:** O(n_ants × n_iterations × n²)
- **Chất lượng:** ⭐⭐⭐⭐ Tốt
- **Tốc độ:** ⏱️ Chậm
- **Tham số:** α, β, evaporation_rate, n_ants, n_iterations
- **Mô tả:** Bắt chước cách kiến giao tiếp qua pheromone, lặp đi lặp lại để tìm tour tốt

**Phù hợp cho:** Yêu cầu chất lượng cao, có thời gian tính toán

---

### 🌀 Space Filling Curve (SFC)
**Tệp:** [`SPACE_FILLING_CURVE.md`](./SPACE_FILLING_CURVE.md)

- **Thời gian:** O(n log n)
- **Chất lượng:** ⭐⭐ Trung bình
- **Tốc độ:** ⚡⚡ Cực nhanh
- **Tham số:** Không có
- **Mô tả:** Mã hóa tọa độ 2D thành 1D key (Morton/Hilbert), sắp xếp rồi lấy thứ tự

**Phù hợp cho:** Dữ liệu lớn, cần kết quả nhanh, initial tour cho thuật toán khác

---

## 📊 Bảng So Sánh Nhanh

| Tiêu chí | NN | ACO | SFC |
|----------|----|----|-----|
| **Thời gian (100 cities)** | ~5ms | ~1000ms | ~1ms |
| **Chất lượng (% optimal)** | ~85% | ~95% | ~80% |
| **Tham số tùy chỉnh** | 0 | 5+ | 0 |
| **Ổn định** | Cao | Thấp | Cao |
| **Dễ hiểu** | Dễ | Trung bình | Trung bình |
| **Dễ cài đặt** | Dễ | Khó | Khó |

---

## 🎓 So Sánh Chi Tiết

### Độ Phức Tạp Thời Gian

```
NN:  O(n²)               [tuyến tính + tuyến tính]
SFC: O(n log n)          [sort + other O(n) ops]
ACO: O(n_ants × iters × n²)  [many iterations, each building n-city tour]
```

### Chất Lượng Kết Quả (trung bình)

```
Brute Force     ████████████████████ (100%)
Dynamic Prog.   ████████████████████ (100%)
ACO             ██████████████░░░░░░ (95%)
NN              ████████░░░░░░░░░░░░ (85%)
SFC             ███████░░░░░░░░░░░░░ (80%)
Random          ███░░░░░░░░░░░░░░░░░ (30%)
```

### Tốc Độ Tính Toán (với 1000 cities)

```
SFC             ▮  (1-3ms)
NN              ████ (20-50ms)
ACO             ████████████████ (2-10s)
DP              ████████████████████... (> 1 giờ)
Brute Force     ████████████████████... (không khả thi)
```

---

## 🤔 Lựa Chọn Thuật Toán

### Tùy thuộc vào yêu cầu

**Nếu cần kết quả SẮP CHÓC (< 100ms):**
```
SFC > NN > ACO
```

**Nếu cần CHẤT LƯỢNG CAO (> 90% optimal):**
```
ACO > NN > SFC
```

**Nếu cần CÂN BẰNG:**
```
NN hoặc (SFC + 2-opt)
```

**Nếu cần DỄ HIỂU & DEMO:**
```
NN
```

### Khi dữ liệu LỚN (n > 10000)

| Thuật toán | Khả thi | Ghi chú |
|-----------|---------|--------|
| **NN** | ⚠️ Có | O(n²) = 100M ops → ~1s |
| **ACO** | ❌ Không | O(n²×iter) = quá chậm |
| **SFC** | ✅ Có | O(n log n) = 132K ops → ~1ms |

**Đề xuất:** SFC + 2-opt improvement

---

## 🔗 Luồng Dữ Liệu (Dataflow)

Mỗi thuật toán có file dataflow riêng:
- [`RANDOM_BUTTON_DATAFLOW.md`](../RANDOM_BUTTON_DATAFLOW.md) - Tạo random cities
- [`NN_BUTTON_DATAFLOW.md`](../NN_BUTTON_DATAFLOW.md) - Chạy NN
- [`ACO_BUTTON_DATAFLOW.md`](../ACO_BUTTON_DATAFLOW.md) - Chạy ACO
- [`SFC_BUTTON_DATAFLOW.md`](../SFC_BUTTON_DATAFLOW.md) - Chạy SFC

---

## 💡 Mẹo & Thủ Thuật

### 1. Chạy ACO trên dữ liệu lớn

Giảm `n_ants` và `n_iterations` thay vì dùng default:
```
n_ants: 10-20 (thay vì 50)
n_iterations: 50-100 (thay vì 500)
```

### 2. Cải tiến SFC

Dùng SFC output làm **initial tour**, rồi áp dụng **2-opt**:
```python
initial_path = solve_space_filling_curve(cities)
improved_path = two_opt(cities, initial_path)
# Result sẽ tốt hơn pure SFC, vẫn nhanh
```

### 3. So sánh công bằng

- Dùng **AnalysisModal** để chạy cả 3 thuật toán với **cùng dữ liệu**
- Đo **execution_time_ms** từ backend

### 4. Tuning ACO

Nếu chỉ 1-2 iteration:
- α cao (2.0) → khai thác pheromone cũ
- β cao (5.0) → ưu tiên greedy (gần nhất)

Nếu nhiều iterations:
- α = 1.5 (cân bằng)
- β = 2.0
- evaporation_rate = 0.2 (quên nhưng không quá nhanh)

---

## 🎯 Hướng Phát Triển

### Cải tiến hiện tại

1. **2-opt / Local Search** - Áp dụng sau khi có tour ban đầu
2. **Genetic Algorithm** - Chọn lọc tour tốt nhất
3. **Tabu Search** - Tránh revisit bad solutions

### Tối ưu hiệu năng

1. **Parallel ACO** - Chạy nhiều kiến song song
2. **GPU-accelerated** - Dùng GPU cho distance matrix & sorting
3. **Approximation** - Dùng MST, Christofides cho lower bound

---

## 📚 Tài Liệu Tham Khảo

### Sách
- *Introduction to Algorithms* - CLRS (DP, complexity theory)
- *Nature-Inspired Optimization Algorithms* - Xin-She Yang

### Papers
- "Ant System" - Dorigo et al. (1992)
- "A Fast Algorithm for Traveling Salesman Problem" - Various authors
- "Hilbert Curve" - Hilbert (1890)

### Online
- [TSP Problem](https://en.wikipedia.org/wiki/Travelling_salesman_problem)
- [Ant Colony Optimization](https://en.wikipedia.org/wiki/Ant_colony_optimization)
- [Space Filling Curve](https://en.wikipedia.org/wiki/Space-filling_curve)

---

## 📝 Kết Luận

- **Nearest Neighbor**: Đơn giản, nhanh, tốt cho visualization
- **Ant Colony Optimization**: Phức tạp, chậm, nhưng chất lượng cao
- **Space Filling Curve**: Rất nhanh, chất lượng trung bình, tốt cho dữ liệu lớn

**Chọn theo nhu cầu bạn!** 🚀
