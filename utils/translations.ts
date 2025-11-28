import { AlgorithmType, Language } from "../types";

export const translations = {
  en: {
    title: "TSP Visualizer",
    subtitle: "Select an algorithm and run the simulation to see how it solves the Traveling Salesperson Problem.",
    algorithm: "Algorithm",
    cities: "Cities",
    distance: "Distance",
    run: "Run Visualization",
    running: "Running...",
    analyze: "Analyze",
    randomize: "Randomize",
    clear: "Clear Board",
    clickToAdd: "Click anywhere to add cities",
    algoNames: {
      [AlgorithmType.NEAREST_NEIGHBOR]: "Nearest Neighbor",
      [AlgorithmType.ACO]: "Ant Colony Optimization",
      [AlgorithmType.SPACE_FILLING_CURVE]: "Space Filling Curve"
    },
    algoDescriptions: {
      [AlgorithmType.NEAREST_NEIGHBOR]: "A greedy approach. Visits the closest unvisited city next. Fast but rarely optimal.",
      [AlgorithmType.ACO]: "Simulates ants searching for food. Uses pheromones to find better paths over time. Strong meta-heuristic.",
      [AlgorithmType.SPACE_FILLING_CURVE]: "Maps 2D points to a 1D Hilbert Curve. Sorts cities by this 1D index. Very fast spatial clustering."
    },
    sfcDebugOn: "Debug Hilbert",
    sfcDebugOff: "Hide Debug",
    analysis: {
      title: "Analysis Results",
      winnerTitle: "Most Efficient Route",
      totalDist: "Total Distance",
      executionTime: "Execution Time",
      chartDist: "Distance (Lower is Better)",
      chartTime: "Execution Time (Lower is Better)",
      note: "Note: ACO is a meta-heuristic and results may vary per run. Nearest Neighbor is deterministic but often suboptimal.",
      close: "Close"
    }
  },
  vi: {
    title: "Mô Phỏng TSP",
    subtitle: "Chọn thuật toán và chạy mô phỏng để xem cách giải quyết bài toán Người bán hàng (TSP).",
    algorithm: "Thuật toán",
    cities: "Thành phố",
    distance: "Khoảng cách",
    run: "Chạy Mô Phỏng",
    running: "Đang chạy...",
    analyze: "Phân tích",
    randomize: "Ngẫu nhiên",
    clear: "Xóa bàn cờ",
    clickToAdd: "Nhấn vào bất kỳ đâu để thêm thành phố",
    algoNames: {
      [AlgorithmType.NEAREST_NEIGHBOR]: "Láng giềng gần nhất (NN)",
      [AlgorithmType.ACO]: "Tối ưu hóa đàn kiến (ACO)",
      [AlgorithmType.SPACE_FILLING_CURVE]: "Đường điền đầy (Hilbert)"
    },
    algoDescriptions: {
      [AlgorithmType.NEAREST_NEIGHBOR]: "Phương pháp tham lam. Luôn đi đến thành phố gần nhất chưa ghé thăm. Nhanh nhưng ít khi tối ưu.",
      [AlgorithmType.ACO]: "Mô phỏng loài kiến tìm thức ăn. Sử dụng mùi hương (pheromone) để tìm đường tốt hơn theo thời gian.",
      [AlgorithmType.SPACE_FILLING_CURVE]: "Ánh xạ điểm 2D sang đường cong Hilbert 1D. Sắp xếp thành phố theo chỉ số này. Rất nhanh."
    },
    sfcDebugOn: "Debug Hilbert",
    sfcDebugOff: "Tắt Debug",
    analysis: {
      title: "Kết Quả Phân Tích",
      winnerTitle: "Lộ trình hiệu quả nhất",
      totalDist: "Tổng quãng đường",
      executionTime: "Thời gian chạy",
      chartDist: "Khoảng cách (Thấp hơn là tốt hơn)",
      chartTime: "Thời gian chạy (Thấp hơn là tốt hơn)",
      note: "Lưu ý: ACO là thuật toán meta-heuristic nên kết quả có thể đổi sau mỗi lần chạy. NN có kết quả cố định nhưng thường không tối ưu.",
      close: "Đóng"
    }
  }
};
