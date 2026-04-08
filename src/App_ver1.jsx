import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";

const CSV_FILE_PATH = "/nhi_data.csv";
const RX_API = "https://rxnav.nlm.nih.gov/REST";

export default function App() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: Search, 1: DDI Check
  const [query, setQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [checkedList, setCheckedList] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const cuiCache = useRef({});

  // --- 1. โหลดข้อมูลจากไฟล์ CSV (Mapping ตามหัวตารางภาษาจีน) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(CSV_FILE_PATH);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Mapping ข้อมูลจากหัวตารางภาษาจีนที่คุณส่งมา
            const parsedData = results.data
              .map((item) => ({
                code: item["藥品代號"] || "",
                nameEN: item["藥品英文名稱"] || "",
                nameZH: item["藥品中文名稱"] || "",
                ingredient: item["成分"] || "",
                price: item["支付價"] || "0",
                atc: item["ATC代碼"] || "",
              }))
              .filter((d) => d.nameEN || d.nameZH); // กรองเอาเฉพาะแถวที่มีชื่อยา

            setDrugs(parsedData);
            setLoading(false);
          },
        });
      } catch (err) {
        console.error("Error loading CSV:", err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- 2. ฟังก์ชันเรียก RxNorm API ---
  const getRxCui = async (drugName) => {
    const mainName = drugName.split(" ")[0]; // ใช้ชื่อยาตัวแรก (Generic Name)
    if (cuiCache.current[mainName]) return cuiCache.current[mainName];
    try {
      const res = await fetch(
        `${RX_API}/rxcui.json?name=${encodeURIComponent(mainName)}&search=1`,
      );
      const data = await res.json();
      const cui = data?.idGroup?.rxnormId?.[0];
      if (cui) cuiCache.current[mainName] = cui;
      return cui;
    } catch {
      return null;
    }
  };

  const checkInteractions = async () => {
    if (checkedList.length < 2) return;
    setIsChecking(true);
    setInteractions([]);

    const cuis = [];
    for (const d of checkedList) {
      const cui = await getRxCui(d.nameEN);
      if (cui) cuis.push(cui);
    }

    if (cuis.length >= 2) {
      try {
        const res = await fetch(
          `${RX_API}/interaction/list.json?rxcuis=${cuis.join("+")}`,
        );
        const data = await res.json();
        const found = (data?.fullInteractionTypeGroup || []).flatMap((g) =>
          (g.fullInteractionType || []).flatMap((t) =>
            (t.interactionPair || []).map((p) => ({
              description: p.description,
              names:
                p.interactionConcept?.map((c) => c.minConceptItem?.name) || [],
            })),
          ),
        );
        setInteractions(found);
      } catch (e) {
        console.error(e);
      }
    }
    setIsChecking(false);
  };

  // --- 3. ส่วนการกรองข้อมูลเพื่อแสดงผล ---
  const filteredDrugs = query
    ? drugs
        .filter(
          (d) =>
            d.nameEN.toLowerCase().includes(query.toLowerCase()) ||
            d.nameZH.includes(query) ||
            d.code.includes(query),
        )
        .slice(0, 50)
    : drugs.slice(0, 25);

  // --- 4. UI Rendering ---
  const cardStyle = {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
    border: "1px solid #eee",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };
  const pillStyle = (color) => ({
    fontSize: "10px",
    fontWeight: "bold",
    padding: "2px 8px",
    borderRadius: "10px",
    background: color,
    color: "#fff",
    marginRight: "5px",
  });

  return (
    <div
      style={{
        maxWidth: 450,
        margin: "0 auto",
        background: "#f5f7fb",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1d4ed8, #1e40af)",
          color: "#fff",
          padding: "25px 20px",
        }}
      >
        <h2 style={{ margin: 0, letterSpacing: "1px" }}>💊 Rx-Norm Taiwan</h2>
        <p style={{ margin: "5px 0 0", fontSize: "12px", opacity: 0.8 }}>
          Standardized Drug Information System
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          background: "#fff",
          borderBottom: "1px solid #ddd",
        }}
      >
        {["Search", "DDI Check"].map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              flex: 1,
              padding: "15px",
              border: "none",
              background: tab === i ? "#eff6ff" : "#fff",
              borderBottom: tab === i ? "3px solid #1d4ed8" : "none",
              color: tab === i ? "#1d4ed8" : "#666",
              fontWeight: tab === i ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "15px" }}>
        {loading ? (
          <div
            style={{ textAlign: "center", marginTop: "50px", color: "#666" }}
          >
            กำลังโหลดฐานข้อมูล NHI...
          </div>
        ) : tab === 0 ? (
          /* SEARCH TAB */
          <>
            <input
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "15px",
                boxSizing: "border-box",
              }}
              placeholder="ค้นหาชื่อยา, รหัส NHI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {filteredDrugs.map((d, i) => (
              <div key={i} style={cardStyle}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={pillStyle("#3b82f6")}>{d.code}</span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#10b981",
                      fontWeight: "bold",
                    }}
                  >
                    NT$ {d.price}
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    marginTop: "8px",
                  }}
                >
                  {d.nameEN}
                </div>
                <div style={{ color: "#666", fontSize: "14px" }}>
                  {d.nameZH}
                </div>
                <div
                  style={{ fontSize: "11px", color: "#999", marginTop: "8px" }}
                >
                  <strong>Ingredient:</strong> {d.ingredient} <br />
                  <strong>ATC:</strong> {d.atc}
                </div>
              </div>
            ))}
          </>
        ) : (
          /* DDI CHECK TAB */
          <>
            <p style={{ fontSize: "13px", color: "#666" }}>
              เลือกยาอย่างน้อย 2 ตัวเพื่อเช็คปฏิกิริยาระหว่างยา:
            </p>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                background: "#fff",
                borderRadius: "8px",
                border: "1px solid #ddd",
                padding: "5px",
              }}
            >
              {drugs.slice(0, 30).map((d, i) => (
                <label
                  key={i}
                  style={{
                    display: "flex",
                    padding: "10px",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ marginRight: "10px" }}
                    onChange={() => {
                      setCheckedList((prev) =>
                        prev.find((x) => x.code === d.code)
                          ? prev.filter((x) => x.code !== d.code)
                          : [...prev, d],
                      );
                    }}
                  />
                  <div style={{ fontSize: "13px" }}>
                    <strong>{d.nameEN}</strong> <br /> <small>{d.nameZH}</small>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={checkInteractions}
              disabled={checkedList.length < 2 || isChecking}
              style={{
                width: "100%",
                padding: "15px",
                background: checkedList.length < 2 ? "#ccc" : "#1d4ed8",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                marginTop: "15px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {isChecking
                ? "กำลังตรวจสอบกับ RxNorm API..."
                : `ตรวจสอบยา ${checkedList.length} รายการ`}
            </button>

            {interactions.map((x, i) => (
              <div
                key={i}
                style={{
                  background: "#fffbeb",
                  border: "1px solid #f59e0b",
                  padding: "12px",
                  borderRadius: "8px",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    color: "#92400e",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  ⚠️ {x.names.join(" ↔ ")}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#b45309",
                    marginTop: "4px",
                  }}
                >
                  {x.description}
                </div>
              </div>
            ))}
            {!isChecking &&
              checkedList.length >= 2 &&
              interactions.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "15px",
                    color: "#10b981",
                    fontSize: "13px",
                  }}
                >
                  ✅ ไม่พบปฏิกิริยารุนแรงที่บันทึกไว้
                </div>
              )}
          </>
        )}
      </div>
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          fontSize: "10px",
          color: "#999",
        }}
      >
        NTHU Software Studio Midterm Prototype · Group 6
      </div>
    </div>
  );
}
