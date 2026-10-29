# Building Walkthrough

Ứng dụng chuyển bản vẽ công trình (DXF/DWG từ AutoCAD) thành không gian 3D tương tác trên trình duyệt.

## Cấu trúc

- `tools/` — chuyển đổi bản vẽ (Python + ezdxf), sinh `building.json`
- `public/models/` — `building.glb` và `building.json` dùng cho web
- `src/` — ứng dụng Three.js (Vite)

## Chạy thử

```bash
npm install
npm run dev
```

Mở http://localhost:5173

## Chế độ điều khiển

- **Quan sát (Orbit):** kéo chuột để quay, cuộn để phóng to/thu nhỏ
- **Bay (Fly):** WASD di chuyển, Q/E lên xuống, Shift để bay nhanh
- **Đi bộ (Walk):** WASD đi lại, Shift để chạy, ESC để thoát
- **Ngoại thất:** quay về góc nhìn tổng thể
- **Nút tầng:** chuyển giữa các tầng với hiệu ứng thang máy

## Chuyển đổi bản vẽ

```bash
cd tools
py -m pip install -r requirements.txt   # Windows; trên macOS/Linux dùng pip3
py dxf_to_json.py sample/plan.dxf ../public/models/building.json
```

Bản vẽ DWG cần chuyển sang DXF bằng ODA File Converter trước.
Phần dựng `building.glb` từ DXF được thực hiện bằng Blender hoặc script bổ sung.
