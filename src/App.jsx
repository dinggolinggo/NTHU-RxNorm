import { useState } from "react";

const DRUGS_DB = [
  { id: 1, nameEN: "Acetaminophen", nameTW: "乙醯胺酚", brand: "Tylenol / 普拿疼", atc: "N02BE01", nhi: "A009113100", form: "Tablet 500mg", interaction: ["Warfarin"], category: "Analgesic" },
  { id: 2, nameEN: "Metformin", nameTW: "二甲雙胍", brand: "Glucophage / 庫魯化", atc: "A10BA02", nhi: "A036571100", form: "Tablet 500mg", interaction: ["Iodinated contrast"], category: "Antidiabetic" },
  { id: 3, nameEN: "Amlodipine", nameTW: "氨氯地平", brand: "Norvasc / 脈優", atc: "C08CA01", nhi: "B024561100", form: "Tablet 5mg", interaction: ["Simvastatin"], category: "Antihypertensive" },
  { id: 4, nameEN: "Warfarin", nameTW: "華法林", brand: "Coumadin", atc: "B01AA03", nhi: "B020931100", form: "Tablet 5mg", interaction: ["Acetaminophen", "Aspirin", "NSAIDs"], category: "Anticoagulant" },
  { id: 5, nameEN: "Atorvastatin", nameTW: "阿托伐他汀", brand: "Lipitor / 立普妥", atc: "C10AA05", nhi: "B024203100", form: "Tablet 20mg", interaction: ["Erythromycin", "Gemfibrozil"], category: "Statin" },
];

const pages = {
  search: "search",
  detail: "detail",
  interaction: "interaction",
  scan: "scan",
};

export default function RxNormPrototype() {
  const [page, setPage] = useState(pages.search);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [checkList, setCheckList] = useState([]);

  const filtered = query.length > 0
    ? DRUGS_DB.filter(d =>
        d.nameEN.toLowerCase().includes(query.toLowerCase()) ||
        d.nameTW.includes(query) ||
        d.brand.toLowerCase().includes(query.toLowerCase()) ||
        d.nhi.includes(query)
      )
    : DRUGS_DB;

  const toggleCheck = (drug) => {
    setCheckList(prev =>
      prev.find(d => d.id === drug.id)
        ? prev.filter(d => d.id !== drug.id)
        : [...prev, drug]
    );
  };

  const getInteractions = () => {
    const results = [];
    for (let i = 0; i < checkList.length; i++) {
      for (let j = i + 1; j < checkList.length; j++) {
        if (checkList[i].interaction.includes(checkList[j].nameEN)) {
          results.push({ a: checkList[i], b: checkList[j] });
        }
        if (checkList[j].interaction.includes(checkList[i].nameEN)) {
          results.push({ a: checkList[j], b: checkList[i] });
        }
      }
    }
    return results;
  };

  const Nav = () => (
    <div style={{ display: "flex", borderBottom: "2px solid #0d6efd", background: "#fff" }}>
      {[
        { key: pages.search, icon: "🔍", label: "Drug Search" },
        { key: pages.interaction, icon: "⚠️", label: "Interaction Check" },
        { key: pages.scan, icon: "📷", label: "Scan / OCR" },
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setPage(tab.key)}
          style={{
            flex: 1, padding: "12px 8px", border: "none", cursor: "pointer",
            background: page === tab.key ? "#0d6efd" : "transparent",
            color: page === tab.key ? "#fff" : "#333",
            fontWeight: page === tab.key ? 700 : 400,
            fontSize: 13, transition: "all .2s",
          }}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );

  const Header = () => (
    <div style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)", color: "#fff", padding: "18px 20px" }}>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>💊 Rx-Norm Taiwan</div>
      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>Drug Standardization & Smart Pharmacopeia Platform</div>
    </div>
  );

  const SearchPage = () => (
    <div style={{ padding: 16 }}>
      <input
        value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Search drug name, NHI code, or brand..."
        style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", marginBottom: 12 }}
      />
      <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
        {filtered.length} result{filtered.length !== 1 ? "s" : ""} — Tap a drug for details
      </div>
      {filtered.map(drug => (
        <div
          key={drug.id}
          onClick={() => { setSelected(drug); setPage(pages.detail); }}
          style={{
            background: "#fff", borderRadius: 10, padding: "14px 16px", marginBottom: 10,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)", cursor: "pointer",
            border: "1px solid #eee", transition: "box-shadow .2s",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{drug.nameEN}</div>
              <div style={{ fontSize: 13, color: "#555" }}>{drug.nameTW} · {drug.brand}</div>
            </div>
            <span style={{ background: "#e7f1ff", color: "#0d6efd", padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{drug.category}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#888" }}>ATC: {drug.atc} | NHI: {drug.nhi} | {drug.form}</div>
        </div>
      ))}
    </div>
  );

  const DetailPage = () => selected && (
    <div style={{ padding: 16 }}>
      <button onClick={() => setPage(pages.search)} style={{ background: "none", border: "none", color: "#0d6efd", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 12 }}>← Back to search</button>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{selected.nameEN}</div>
        <div style={{ fontSize: 16, color: "#555", marginBottom: 16 }}>{selected.nameTW} — {selected.brand}</div>
        {[
          ["ATC Code", selected.atc],
          ["NHI Code", selected.nhi],
          ["Form / Strength", selected.form],
          ["Category", selected.category],
          ["Known Interactions", selected.interaction.join(", ") || "None"],
        ].map(([label, val]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f0f0" }}>
            <span style={{ fontWeight: 600, color: "#333", fontSize: 13 }}>{label}</span>
            <span style={{ color: "#555", fontSize: 13, textAlign: "right", maxWidth: "55%" }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const InteractionPage = () => {
    const interactions = getInteractions();
    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Select drugs to check interactions</div>
        {DRUGS_DB.map(drug => (
          <label key={drug.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", borderRadius: 8, marginBottom: 6, cursor: "pointer", border: checkList.find(d=>d.id===drug.id) ? "2px solid #0d6efd" : "1px solid #eee" }}>
            <input type="checkbox" checked={!!checkList.find(d=>d.id===drug.id)} onChange={() => toggleCheck(drug)} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{drug.nameEN}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{drug.nameTW}</div>
            </div>
          </label>
        ))}
        {checkList.length >= 2 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              {interactions.length > 0 ? "⚠️ Interactions Found" : "✅ No Interactions Detected"}
            </div>
            {interactions.map((pair, i) => (
              <div key={i} style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: "#856404" }}>🔺 {pair.a.nameEN} ↔ {pair.b.nameEN}</div>
                <div style={{ fontSize: 12, color: "#856404", marginTop: 4 }}>
                  Potential interaction detected. Consult pharmacist or physician before co-prescribing.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ScanPage = () => (
    <div style={{ padding: 16, textAlign: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Scan Prescription / Drug Label</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Use OCR to automatically identify drugs from images of prescriptions or packaging.</div>
        <button style={{ background: "#0d6efd", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          📤 Upload Image
        </button>
        <div style={{ marginTop: 24, padding: 16, background: "#f8f9fa", borderRadius: 8, textAlign: "left" }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>How it works:</div>
          {["1. Upload a photo of a prescription or drug label", "2. OCR extracts drug names and codes", "3. System maps to standardized Rx-Norm Taiwan entries", "4. View results with interaction warnings"].map(step => (
            <div key={step} style={{ fontSize: 12, color: "#555", padding: "3px 0" }}>{step}</div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", background: "#f5f6fa", minHeight: "100vh", fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>
      <Header />
      <Nav />
      {page === pages.search && <SearchPage />}
      {page === pages.detail && <DetailPage />}
      {page === pages.interaction && <InteractionPage />}
      {page === pages.scan && <ScanPage />}
      <div style={{ textAlign: "center", padding: "16px", fontSize: 11, color: "#aaa" }}>
        Rx-Norm Taiwan v0.1 — Group 6 Midterm Prototype
      </div>
    </div>
  );
}
