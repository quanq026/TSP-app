# 🌀 Space Filling Curve (SFC) - Tài Liệu Học Thuật

## 📖 1. Giới Thiệu

**Space Filling Curve (SFC)** hay **Đường Phủ Không Gian** là một đường cong liên tục có khả năng **đi qua mọi điểm** trong một không gian nhiều chiều. Khái niệm này được **Giuseppe Peano** đề xuất năm 1890 và **David Hilbert** phát triển năm 1891.

### 1.1 Lịch sử phát triển

| Năm | Sự kiện | Tác giả |
|-----|---------|---------|
| 1890 | Peano curve - đường cong phủ không gian đầu tiên | Giuseppe Peano |
| 1891 | Hilbert curve - cải tiến locality | David Hilbert |
| 1966 | Z-order (Morton) curve cho máy tính | G.M. Morton |
| 1984 | Ứng dụng SFC cho TSP | Bartholdi & Platzman |

### 1.2 Ý tưởng cốt lõi

**Bài toán**: TSP trong không gian 2D → bài toán sắp xếp trên 1D.

```
2D points: (x₁,y₁), (x₂,y₂), ..., (xₙ,yₙ)
                    ↓ SFC mapping
1D keys:   k₁, k₂, ..., kₙ
                    ↓ Sort
1D order:  π(1), π(2), ..., π(n)
                    ↓
TSP tour:  visit cities in order π
```

---

## 📐 2. Cơ Sở Toán Học

### 2.1 Định nghĩa hình thức

**Định nghĩa**: Một Space Filling Curve là ánh xạ liên tục:
```
f: [0,1] → [0,1]ᵈ
```
sao cho f là **surjective** (phủ toàn bộ không gian đích).

### 2.2 Hilbert Curve

**Định nghĩa đệ quy**:

Hilbert curve bậc k được xây dựng từ 4 bản sao của bậc k-1:

```
Bậc 1:        Bậc 2:              Bậc 3:
┌─┐           ┌─┬─┐ ┌─┬─┐        (phức tạp hơn)
│ │           │ │ │ │ │ │
└─┘           ├─┘ └─┤ ├─┘
              │     │ │
              └─────┘ └─────┐
                            │
              ┌─────┐ ┌─────┘
              │     │ │
              ├─┐ ┌─┤ ├─┐
              │ │ │ │ │ │
              └─┴─┘ └─┴─┘
```

**Công thức chỉ số Hilbert**:

Cho điểm (x, y) trong lưới 2ᵏ × 2ᵏ, chỉ số Hilbert d được tính bằng thuật toán đệ quy:

```
function hilbert_d2xy(n, d):
    // n = kích thước lưới (2^k)
    // d = chỉ số Hilbert
    // return (x, y)
    
    x = y = 0
    s = 1
    while s < n:
        rx = 1 & (d / 2)
        ry = 1 & (d ^ rx)
        (x, y) = rotate(s, x, y, rx, ry)
        x += s * rx
        y += s * ry
        d /= 4
        s *= 2
    return (x, y)

function hilbert_xy2d(n, x, y):
    // Ngược lại: (x, y) → d
    d = 0
    s = n / 2
    while s > 0:
        rx = 1 if (x & s) > 0 else 0
        ry = 1 if (y & s) > 0 else 0
        d += s * s * ((3 * rx) ^ ry)
        (x, y) = rotate(s, x, y, rx, ry)
        s /= 2
    return d
```

### 2.3 Morton (Z-order) Curve

**Định nghĩa**: Interleave các bit của x và y:

```
Morton(x, y) = ... y₂ x₂ y₁ x₁ y₀ x₀  (binary)
```

**Ví dụ**:
```
x = 5 = 101₂
y = 3 = 011₂

Morton = 1 0 | 0 1 | 1 1
         y₂x₂ y₁x₁ y₀x₀
       = 100111₂ = 39
```

**Công thức toán học**:
```
           k-1
Morton(x,y) = Σ (bit(x,i) × 2^(2i) + bit(y,i) × 2^(2i+1))
           i=0
```

---

## 🔬 3. Tính Chất Locality

### 3.1 Định nghĩa Locality

**Locality**: Nếu hai điểm gần nhau trong không gian 2D, chúng nên có chỉ số SFC gần nhau trong 1D.

### 3.2 So sánh locality

```
2D space:                Morton order:       Hilbert order:
┌───┬───┬───┬───┐
│ 0 │ 1 │ 4 │ 5 │       0→1→4→5            0→1→2→3
├───┼───┼───┼───┤           ↓ (nhảy!)          ↓
│ 2 │ 3 │ 6 │ 7 │       2→3→6→7            5→4→7→6
├───┼───┼───┼───┤           ↓ (nhảy!)          ↓
│ 8 │ 9 │12 │13 │       8→9→12→13          8→9→10→11
├───┼───┼───┼───┤           ↓                  ↓
│10 │11 │14 │15 │       10→11→14→15        15→14→13→12
└───┴───┴───┴───┘
```

**Nhận xét**:
- **Morton**: Có "nhảy" giữa các quadrant → locality kém
- **Hilbert**: Liên tục, không nhảy → locality tốt hơn

### 3.3 Đo lường locality

**Metric**: Average distance between consecutive SFC indices

```
Locality(SFC) = (1/n) × Σᵢ d₂D(pointᵢ, pointᵢ₊₁)
```

| Curve | Avg. locality (unit square) |
|-------|----------------------------|
| Random | O(1) |
| Morton | O(1/√n) |
| Hilbert | O(1/n^(1/d)) với d=2 |

**Hilbert tốt hơn** vì luôn đi giữa các điểm liền kề trong lưới.

---

## ⏱️ 4. Phân Tích Độ Phức Tạp

### 4.1 Độ phức tạp thời gian

```
T(n) = O(n log n)
```

**Breakdown**:

| Bước | Complexity | Giải thích |
|------|------------|------------|
| Normalize coordinates | O(n) | Tìm max, scale |
| Compute SFC index | O(n × log n) | Mỗi điểm O(log n) bits |
| Sort by index | O(n log n) | Comparison sort |
| Extract path | O(n) | Linear scan |

**Dominant term**: Sorting → O(n log n)

### 4.2 Độ phức tạp không gian

```
S(n) = O(n)
```

| Cấu trúc | Kích thước |
|----------|------------|
| Index array | n |
| Sorted indices | n |
| Path | n |

### 4.3 So sánh với các thuật toán khác

| Algorithm | Time | Space | Quality |
|-----------|------|-------|---------|
| Brute force | O(n!) | O(n) | Optimal |
| NN | O(n²) | O(n) | ~75-80% |
| **SFC** | **O(n log n)** | O(n) | ~70-85% |
| ACO | O(n² × iter) | O(n²) | ~95%+ |

**SFC là nhanh nhất** (trừ brute force với n nhỏ).

---

## 📊 5. Phân Tích Chất Lượng

### 5.1 Approximation bound

**Định lý (Bartholdi & Platzman, 1988)**:

Với các điểm phân bố đều trong hình vuông đơn vị, SFC tour có độ dài kỳ vọng:

```
E[L_SFC] = O(√n)
E[L_OPT] = Θ(√n)

→ E[L_SFC / L_OPT] ≤ C (hằng số)
```

Thực nghiệm: C ≈ 1.2 - 1.4 (SFC tệ hơn optimal 20-40%)

### 5.2 Worst-case

SFC **không có worst-case bound tốt**. Với phân bố đặc biệt, SFC có thể rất tệ:

```
Ví dụ xấu: Các điểm nằm trên đường chéo

(0,0) → (1,1) → (2,2) → (3,3)

Hilbert order có thể không theo đường chéo
→ Tour dài hơn cần thiết
```

### 5.3 So sánh thực nghiệm

**Với random uniform distribution (n=1000)**:

| Method | Avg. L/L_OPT | Std. dev |
|--------|--------------|----------|
| NN | 1.22 | 0.05 |
| Morton SFC | 1.35 | 0.08 |
| Hilbert SFC | 1.25 | 0.06 |
| NN + 2-opt | 1.05 | 0.02 |
| SFC + 2-opt | 1.04 | 0.02 |

**Nhận xét**: SFC alone không tốt bằng NN, nhưng SFC + local search tốt tương đương.

---

## 💻 6. Implementation Chi Tiết

### 6.1 Hilbert curve trong code hiện tại

```python
# File: backend/app/algorithms/space_filling_curve.py

GRID_SIZE = 4096  # 2^12 grid

def _rotate_quadrant(size: int, x: int, y: int, rx: int, ry: int) -> Tuple[int, int]:
    """Rotate a quadrant to follow the Hilbert curve ordering."""
    if ry == 0:
        if rx == 1:
            x = size - 1 - x
            y = size - 1 - y
        x, y = y, x
    return x, y

def _hilbert_distance(size: int, x: int, y: int) -> int:
    """Map 2D grid coordinates to 1D Hilbert curve distance."""
    d = 0
    step = size // 2
    while step > 0:
        rx = 1 if (x & step) else 0
        ry = 1 if (y & step) else 0
        d += step * step * ((3 * rx) ^ ry)
        x, y = _rotate_quadrant(step, x, y, rx, ry)
        step //= 2
    return d
```

### 6.2 Tham số và đặc điểm

| Parameter | Value | Explanation |
|-----------|-------|-------------|
| GRID_SIZE | 4096 | 2¹² - độ phân giải lưới |
| Curve type | Hilbert | Locality tốt hơn Morton |
| Normalization | max(x,y) | Scale về [0, GRID_SIZE-1] |

### 6.3 Tại sao chọn Hilbert thay vì Morton?

1. **Locality tốt hơn**: Consecutive indices luôn adjacent trong grid
2. **Không có "jumps"**: Morton có discontinuity tại quadrant boundaries
3. **Chất lượng TSP**: Hilbert tour ngắn hơn Morton ~5-10%

---

## 🚀 7. Ứng Dụng Khác của SFC

### 7.1 Ngoài TSP

| Lĩnh vực | Ứng dụng | Lý do dùng SFC |
|----------|----------|----------------|
| Databases | Spatial indexing (R-tree) | Range queries hiệu quả |
| Image processing | Dithering, compression | Locality preservation |
| Parallel computing | Load balancing | Locality trong memory |
| GIS | Geocoding (Geohash) | Morton-based |
| Machine learning | Dimensionality reduction | Preserve neighborhoods |

### 7.2 Trong TSP

- **Initial solution**: Dùng SFC tour làm điểm bắt đầu cho local search
- **Large-scale TSP**: Với n > 100,000, SFC là lựa chọn thực tế nhất
- **Real-time**: Route planning với latency requirement

---

## 📚 8. Tài Liệu Tham Khảo

### Papers học thuật

1. **Hilbert, D. (1891)**. "Über die stetige Abbildung einer Linie auf ein Flächenstück". *Mathematische Annalen*, 38, 459-460.

2. **Bartholdi, J. J., & Platzman, L. K. (1988)**. "Heuristics Based on Spacefilling Curves for Combinatorial Problems in Euclidean Space". *Management Science*, 34(3), 291-305.

3. **Sagan, H. (1994)**. *Space-Filling Curves*. Springer-Verlag.

4. **Moon, B., Jagadish, H. V., Faloutsos, C., & Saltz, J. H. (2001)**. "Analysis of the Clustering Properties of the Hilbert Space-Filling Curve". *IEEE TKDE*, 13(1), 124-141.

### Tài liệu online

- [Hilbert Curve - Wikipedia](https://en.wikipedia.org/wiki/Hilbert_curve)
- [Space-filling curve - Wikipedia](https://en.wikipedia.org/wiki/Space-filling_curve)
- [Geohash - Morton-based geocoding](https://en.wikipedia.org/wiki/Geohash)

---

## 📝 9. Kết Luận

### Tóm tắt đặc điểm

| Tiêu chí | Đánh giá |
|----------|----------|
| **Tốc độ** | ⭐⭐⭐⭐⭐ O(n log n) - Nhanh nhất |
| **Chất lượng** | ⭐⭐⭐ ~70-85% optimal |
| **Độ phức tạp cài đặt** | ⭐⭐⭐⭐ Trung bình |
| **Tính ổn định** | ⭐⭐⭐⭐⭐ Deterministic |
| **Khả năng mở rộng** | ⭐⭐⭐⭐⭐ Xuất sắc (n > 1,000,000) |

### So sánh Morton vs Hilbert

| Aspect | Morton | Hilbert |
|--------|--------|---------|
| Speed | Nhanh hơn | Chậm hơn một chút |
| Locality | Trung bình | Tốt |
| TSP quality | ~80% | ~85% |
| Implementation | Đơn giản | Phức tạp hơn |

### Khuyến nghị sử dụng

- ✅ **Dùng** cho large-scale TSP (n > 10,000)
- ✅ **Dùng** làm initial solution cho local search
- ✅ **Dùng** khi cần real-time response
- ❌ **Không dùng** khi cần near-optimal và có thời gian
