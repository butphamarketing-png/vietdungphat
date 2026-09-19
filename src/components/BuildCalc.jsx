import { useMemo, useState } from "react";
import { useCms } from "../lib/cms.js";

const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const UNITS = {
  tho: { tb: 3650000, kha: 3950000, plus: 4350000 },
  tron: { tb: 5550000, kha: 5950000, plus: 6950000 },
};

const MONG = { bang: 0.5, coc: 0.3, don: 0.4 };
const HAM = { 0: 0, 12: 1.5, 15: 1.7, 17: 2.0, 20: 2.2, 25: 2.5, 30: 3.0 };
const MAI = { ton: 0.2, btct: 0.5, ngoi: 0.6, btctngoi: 0.85 };
const HOUSE = { pho: 1, bietthu: 1.08, cap4: 0.9 };
const ALLEY = { wide: 1, mid: 1.05, narrow: 1.1 };

export default function BuildCalc() {
  const { site } = useCms();
  const [house, setHouse] = useState("pho");
  const [service, setService] = useState("tron");
  const [level, setLevel] = useState("kha");
  const [front, setFront] = useState(1);
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [floors, setFloors] = useState("");
  const [alley, setAlley] = useState("wide");
  const [mezz, setMezz] = useState("");
  const [tum, setTum] = useState("");
  const [roofDeck, setRoofDeck] = useState("open");
  const [balcony, setBalcony] = useState("0");
  const [foundation, setFoundation] = useState("bang");
  const [basement, setBasement] = useState("0");
  const [roof, setRoof] = useState("ton");
  const [garden, setGarden] = useState("");
  const [done, setDone] = useState(false);

  const result = useMemo(() => {
    const w = Number(width) || 0;
    const l = Number(length) || 0;
    const t = Number(floors) || 0;
    const base = w * l;
    if (!base || !t) return null;

    const floorArea = base * t;
    const mezzArea = (Number(mezz) || 0) * 0.5;
    const tumArea = (Number(tum) || 0) * 0.5;
    const deckArea = base * (roofDeck === "covered" ? 0.75 : 0.5);
    const balconyArea = balcony === "1" ? w * 1.2 * 0.5 : 0;
    const mongArea = base * MONG[foundation];
    const hamArea = base * (HAM[basement] || 0);
    const maiArea = base * MAI[roof];
    const gardenArea = (Number(garden) || 0) * 0.5;
    const area = floorArea + mezzArea + tumArea + deckArea + balconyArea + mongArea + hamArea + maiArea + gardenArea;

    let unit = UNITS[service][level];
    unit *= HOUSE[house];
    unit *= ALLEY[alley];
    if (Number(front) === 2) unit *= 1.04;

    return { area, unit, total: area * unit };
  }, [house, service, level, front, width, length, floors, alley, mezz, tum, roofDeck, balcony, foundation, basement, roof, garden]);

  function onSubmit(e) {
    e.preventDefault();
    setDone(true);
  }

  const tel = String(site.phone || "").replace(/\./g, "");

  return (
    <section className="pad calc-block" id="tinh-gia">
      <div className="section-head">
        <p className="kicker">Tính giá xây dựng</p>
        <h2>Công cụ tính diện tích và chi phí xây dựng</h2>
      </div>
      <p className="calc-note">
        Quý khách vui lòng nhập đầy đủ thông tin bên dưới; hạng mục không có thì để trống. Nhập kích thước mặt sàn (không
        phải diện tích đất). Đơn giá phụ thuộc diện tích, quy mô, điều kiện thi công và chủng loại vật liệu. Kết quả chỉ
        mang tính tham khảo — để tư vấn chính xác vui lòng gọi{" "}
        <a href={`tel:${tel}`}>{site.phone}</a>.
      </p>
      <form className="tinhgia" onSubmit={onSubmit}>
        <h3>Thông tin cơ bản</h3>
        <div className="calc-form">
          <label>
            Chọn loại nhà
            <select value={house} onChange={(e) => setHouse(e.target.value)}>
              <option value="pho">Nhà phố</option>
              <option value="bietthu">Biệt thự</option>
              <option value="cap4">Nhà cấp bốn</option>
            </select>
          </label>
          <label>
            Dịch vụ xây nhà
            <select value={service} onChange={(e) => setService(e.target.value)}>
              <option value="tho">Xây nhà phần thô</option>
              <option value="tron">Xây nhà trọn gói</option>
            </select>
          </label>
          <label>
            Mức đầu tư
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="tb">Trung bình</option>
              <option value="kha">TB - Khá</option>
              <option value="plus">Khá+</option>
            </select>
          </label>
          <label>
            Mặt tiền
            <select value={front} onChange={(e) => setFront(e.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </label>
          <label>
            Chiều rộng (ví dụ 2.5m)
            <input type="number" min="2" step="0.1" placeholder="Nhập chiều rộng" value={width} onChange={(e) => setWidth(e.target.value)} />
          </label>
          <label>
            Chiều dài (ví dụ 10.5m)
            <input type="number" min="2" step="0.1" placeholder="Nhập chiều dài" value={length} onChange={(e) => setLength(e.target.value)} />
          </label>
          <label>
            Số tầng (trừ tum, lửng)
            <input type="number" min="1" max="10" placeholder="Nhập số tầng" value={floors} onChange={(e) => setFloors(e.target.value)} />
          </label>
          <label>
            Hẻm
            <select value={alley} onChange={(e) => setAlley(e.target.value)}>
              <option value="wide">Rộng hơn 5m</option>
              <option value="mid">Rộng từ 3m - 5m</option>
              <option value="narrow">Nhỏ hơn 3m</option>
            </select>
          </label>
        </div>

        <h3>Thông tin công năng</h3>
        <div className="calc-form">
          <label>
            Lửng (ví dụ 30m²)
            <input type="number" min="0" step="0.1" placeholder="Nhập diện tích" value={mezz} onChange={(e) => setMezz(e.target.value)} />
          </label>
          <label>
            Tum / tầng thượng (ví dụ 30m²)
            <input type="number" min="0" step="0.1" placeholder="Nhập diện tích" value={tum} onChange={(e) => setTum(e.target.value)} />
          </label>
          <label>
            Sân thượng
            <select value={roofDeck} onChange={(e) => setRoofDeck(e.target.value)}>
              <option value="open">Sân thượng</option>
              <option value="covered">Sân thượng có mái</option>
            </select>
          </label>
          <label>
            Ban công
            <select value={balcony} onChange={(e) => setBalcony(e.target.value)}>
              <option value="0">Không có</option>
              <option value="1">Có ban công</option>
            </select>
          </label>
          <label>
            Móng
            <select value={foundation} onChange={(e) => setFoundation(e.target.value)}>
              <option value="bang">Móng băng</option>
              <option value="coc">Móng cọc (móng đài)</option>
              <option value="don">Móng đơn</option>
            </select>
          </label>
          <label>
            Tầng hầm
            <select value={basement} onChange={(e) => setBasement(e.target.value)}>
              <option value="0">Không hầm</option>
              <option value="12">Độ sâu 1.0 - 1.2</option>
              <option value="15">Độ sâu 1.2 - 1.5</option>
              <option value="17">Độ sâu 1.5 - 1.7</option>
              <option value="20">Độ sâu 1.7 - 2.0</option>
              <option value="25">Độ sâu 2.0 - 2.5</option>
              <option value="30">Độ sâu 2.5 - 3.0</option>
            </select>
          </label>
          <label>
            Mái
            <select value={roof} onChange={(e) => setRoof(e.target.value)}>
              <option value="ton">Mái tôn</option>
              <option value="btct">Mái BTCT</option>
              <option value="ngoi">Xà gồ + ngói</option>
              <option value="btctngoi">BTCT + ngói</option>
            </select>
          </label>
          <label>
            Sân vườn (ví dụ 10m²)
            <input type="number" min="0" step="0.1" placeholder="Nhập diện tích" value={garden} onChange={(e) => setGarden(e.target.value)} />
          </label>
        </div>
        <button className="btn calc-submit" type="submit">
          Tính kết quả
        </button>
      </form>

      {result ? (
        <div className="calc-result">
          <p>
            Diện tích xây dựng ước tính: <strong>{result.area.toFixed(1)} m²</strong>
          </p>
          <p>
            Đơn giá áp dụng: <strong>{fmt(result.unit)}/m²</strong>
          </p>
          <p className="total">
            Thành tiền tham khảo: <strong>{fmt(result.total)}</strong>
          </p>
        </div>
      ) : done ? (
        <div className="calc-result">
          <p>Vui lòng nhập chiều rộng, chiều dài và số tầng để tính kết quả.</p>
        </div>
      ) : null}
    </section>
  );
}
