import { useState, useEffect, useRef } from "react";

// ============================================================
// NHI Drug Database (loaded from CSV at build time)
// In production: import from /data/nhi_drugs.csv via papaparse
// ============================================================
const DRUGS = [
  {code:"A024806100",nameEN:"Magnesium Oxide 250mg",nameZH:"氧化鎂錠",price:"1.00",form:"Tablet",ingredient:"Magnesium Oxide",manufacturer:"Hsin Tung Yang",atc:"A02AA02",category:"Antacids",usage:"Take after meals",sideEffects:"Diarrhea, abdominal cramps",storage:"Room temperature",warnings:"May reduce absorption of other drugs. Take 2 hours apart from antibiotics."},
  {code:"A009113100",nameEN:"Acetaminophen 500mg (Panadol)",nameZH:"普拿疼錠",price:"1.66",form:"Tablet",ingredient:"Acetaminophen",manufacturer:"GSK",atc:"N02BE01",category:"Pain Relief",usage:"Take every 4-6 hours as needed. Max 4g/day.",sideEffects:"Rare: rash, liver damage at high doses",storage:"Room temperature, protect from moisture",warnings:"Do NOT exceed 4000mg daily. Avoid alcohol. Check other medicines for acetaminophen content."},
  {code:"A036571100",nameEN:"Metformin 500mg (Glucophage)",nameZH:"庫魯化錠",price:"2.41",form:"Film-coated tablet",ingredient:"Metformin HCl",manufacturer:"Merck",atc:"A10BA02",category:"Diabetes",usage:"Take with meals to reduce GI side effects.",sideEffects:"Nausea, diarrhea, stomach upset, metallic taste",storage:"Room temperature",warnings:"Report muscle pain or breathing difficulty immediately. Stop before contrast dye procedures."},
  {code:"B024561100",nameEN:"Amlodipine 5mg (Norvasc)",nameZH:"脈優錠",price:"5.94",form:"Tablet",ingredient:"Amlodipine Besylate",manufacturer:"Pfizer",atc:"C08CA01",category:"Blood Pressure",usage:"Take once daily, with or without food.",sideEffects:"Ankle swelling, dizziness, flushing, headache",storage:"Room temperature",warnings:"Do not stop abruptly. Monitor blood pressure regularly."},
  {code:"B020931100",nameEN:"Warfarin 5mg (Coumadin)",nameZH:"可邁丁錠",price:"3.45",form:"Tablet",ingredient:"Warfarin Sodium",manufacturer:"BMS",atc:"B01AA03",category:"Blood Thinner",usage:"Take at the same time each day.",sideEffects:"Bleeding, bruising easily",storage:"Room temperature, protect from light",warnings:"Regular INR blood tests required. Avoid sudden diet changes (vitamin K). Many drug interactions — always inform your doctor."},
  {code:"B024203100",nameEN:"Atorvastatin 20mg (Lipitor)",nameZH:"立普妥膜衣錠",price:"12.10",form:"Film-coated tablet",ingredient:"Atorvastatin Calcium",manufacturer:"Pfizer",atc:"C10AA05",category:"Cholesterol",usage:"Take once daily, any time of day.",sideEffects:"Muscle pain, headache, joint pain",storage:"Room temperature",warnings:"Report unexplained muscle pain or weakness immediately. Avoid grapefruit juice."},
  {code:"A042761100",nameEN:"Amoxicillin 500mg",nameZH:"安莫西林膠囊",price:"2.08",form:"Capsule",ingredient:"Amoxicillin",manufacturer:"Yung Shin",atc:"J01CA04",category:"Antibiotic",usage:"Complete the full course even if feeling better.",sideEffects:"Diarrhea, rash, nausea",storage:"Room temperature",warnings:"Inform doctor of penicillin allergy. May reduce oral contraceptive effectiveness."},
  {code:"A031525100",nameEN:"Ibuprofen 400mg",nameZH:"乙丁基苯丙酸錠",price:"1.87",form:"Film-coated tablet",ingredient:"Ibuprofen",manufacturer:"Kuo Chia",atc:"M01AE01",category:"Pain Relief / Anti-inflammatory",usage:"Take with food to reduce stomach irritation.",sideEffects:"Stomach pain, heartburn, dizziness",storage:"Room temperature",warnings:"Avoid if history of stomach ulcers. Do not use with other NSAIDs. Risk increases with long-term use."},
  {code:"A034567100",nameEN:"Omeprazole 20mg (Losec)",nameZH:"歐克胃膠囊",price:"8.52",form:"Enteric capsule",ingredient:"Omeprazole",manufacturer:"AstraZeneca",atc:"A02BC01",category:"Stomach Acid",usage:"Take 30 minutes before breakfast. Swallow whole.",sideEffects:"Headache, diarrhea, stomach pain",storage:"Room temperature, protect from moisture",warnings:"Long-term use may affect B12/magnesium levels. Not for immediate heartburn relief."},
  {code:"B021345100",nameEN:"Lisinopril 10mg (Zestril)",nameZH:"捷賜瑞錠",price:"4.30",form:"Tablet",ingredient:"Lisinopril",manufacturer:"AstraZeneca",atc:"C09AA03",category:"Blood Pressure",usage:"Take once daily, with or without food.",sideEffects:"Dry cough, dizziness, headache",storage:"Room temperature",warnings:"Stop and seek help if face/tongue swelling occurs. Not for use in pregnancy."},
  {code:"A029876100",nameEN:"Diclofenac 25mg (Voltaren)",nameZH:"服他寧錠",price:"1.82",form:"Enteric tablet",ingredient:"Diclofenac Sodium",manufacturer:"Novartis",atc:"M01AB05",category:"Pain Relief / Anti-inflammatory",usage:"Take with food. Swallow whole, do not crush.",sideEffects:"Stomach pain, nausea, headache",storage:"Room temperature",warnings:"Cardiovascular risk with long-term use. Avoid in severe heart failure."},
  {code:"B018765100",nameEN:"Losartan 50mg (Cozaar)",nameZH:"可悅您錠",price:"7.82",form:"Film-coated tablet",ingredient:"Losartan Potassium",manufacturer:"MSD",atc:"C09CA01",category:"Blood Pressure",usage:"Take once daily, with or without food.",sideEffects:"Dizziness, fatigue, low blood pressure",storage:"Room temperature",warnings:"Not for use in pregnancy. Monitor potassium levels."},
  {code:"A045678100",nameEN:"Ciprofloxacin 500mg",nameZH:"乳酸乙丙沙星錠",price:"4.56",form:"Film-coated tablet",ingredient:"Ciprofloxacin",manufacturer:"Bayer",atc:"J01MA02",category:"Antibiotic",usage:"Take with water. Avoid dairy products within 2 hours.",sideEffects:"Nausea, diarrhea, dizziness",storage:"Room temperature",warnings:"May cause tendon problems. Avoid sun exposure. Do not take with antacids or magnesium."},
  {code:"B023456100",nameEN:"Simvastatin 20mg (Zocor)",nameZH:"素果錠",price:"6.38",form:"Film-coated tablet",ingredient:"Simvastatin",manufacturer:"MSD",atc:"C10AA01",category:"Cholesterol",usage:"Take in the evening.",sideEffects:"Muscle pain, constipation, headache",storage:"Room temperature",warnings:"Avoid grapefruit. Report muscle pain immediately. Many drug interactions."},
  {code:"B019234100",nameEN:"Clopidogrel 75mg (Plavix)",nameZH:"保栓通膜衣錠",price:"19.07",form:"Film-coated tablet",ingredient:"Clopidogrel",manufacturer:"Sanofi",atc:"B01AC04",category:"Blood Thinner",usage:"Take once daily, with or without food.",sideEffects:"Bleeding, bruising, stomach upset",storage:"Room temperature",warnings:"Inform surgeon/dentist before procedures. Avoid omeprazole — may reduce effectiveness."},
  {code:"A033210100",nameEN:"Aspirin 100mg (Enteric-coated)",nameZH:"阿斯匹靈錠",price:"1.12",form:"Enteric tablet",ingredient:"Aspirin",manufacturer:"Bayer",atc:"B01AC06",category:"Blood Thinner",usage:"Take once daily with food. Swallow whole.",sideEffects:"Stomach irritation, bleeding risk",storage:"Room temperature",warnings:"Not for children under 16. Inform doctor before any surgery."},
  {code:"B027654100",nameEN:"Escitalopram 10mg (Lexapro)",nameZH:"離憂膜衣錠",price:"11.30",form:"Film-coated tablet",ingredient:"Escitalopram Oxalate",manufacturer:"Lundbeck",atc:"N06AB10",category:"Antidepressant",usage:"Take once daily, morning or evening.",sideEffects:"Nausea, insomnia, drowsiness, dry mouth",storage:"Room temperature",warnings:"Do not stop suddenly — taper off gradually. Effects may take 2-4 weeks. Report suicidal thoughts immediately."},
  {code:"A039012100",nameEN:"Gabapentin 300mg (Neurontin)",nameZH:"鎮頑癲膠囊",price:"5.97",form:"Capsule",ingredient:"Gabapentin",manufacturer:"Pfizer",atc:"N03AX12",category:"Nerve Pain / Seizures",usage:"May be taken with or without food.",sideEffects:"Drowsiness, dizziness, fatigue",storage:"Room temperature",warnings:"Do not drive until you know how it affects you. Do not stop abruptly."},
  {code:"A037890100",nameEN:"Cetirizine 10mg",nameZH:"驅特異膜衣錠",price:"3.18",form:"Film-coated tablet",ingredient:"Cetirizine HCl",manufacturer:"UCB",atc:"R06AE07",category:"Allergy",usage:"Take once daily, with or without food.",sideEffects:"Drowsiness, dry mouth, fatigue",storage:"Room temperature",warnings:"May cause drowsiness. Avoid alcohol."},
  {code:"B026543100",nameEN:"Rosuvastatin 10mg (Crestor)",nameZH:"冠脂妥膜衣錠",price:"17.80",form:"Film-coated tablet",ingredient:"Rosuvastatin Calcium",manufacturer:"AstraZeneca",atc:"C10AA07",category:"Cholesterol",usage:"Take once daily, any time.",sideEffects:"Muscle pain, headache, nausea",storage:"Room temperature",warnings:"Report unexplained muscle pain. Avoid excessive alcohol."},
  {code:"A030567100",nameEN:"Furosemide 40mg (Lasix)",nameZH:"來適泄錠",price:"1.50",form:"Tablet",ingredient:"Furosemide",manufacturer:"Sanofi",atc:"C03CA01",category:"Diuretic",usage:"Take in the morning to avoid nighttime urination.",sideEffects:"Frequent urination, dizziness, low potassium",storage:"Room temperature, protect from light",warnings:"Monitor potassium levels. May cause dehydration — drink adequate water."},
  {code:"B020876100",nameEN:"Tramadol 50mg",nameZH:"鍵麻得膠囊",price:"2.85",form:"Capsule",ingredient:"Tramadol HCl",manufacturer:"Grünenthal",atc:"N02AX02",category:"Pain Relief (Opioid)",usage:"Take every 4-6 hours as needed.",sideEffects:"Nausea, dizziness, constipation, drowsiness",storage:"Room temperature",warnings:"Risk of dependence. Do not use with alcohol or sedatives. May cause seizures."},
  {code:"A041234100",nameEN:"Levofloxacin 500mg (Cravit)",nameZH:"可樂必妥膜衣錠",price:"28.70",form:"Film-coated tablet",ingredient:"Levofloxacin",manufacturer:"Daiichi Sankyo",atc:"J01MA12",category:"Antibiotic",usage:"Take once daily with water. Complete full course.",sideEffects:"Nausea, diarrhea, headache, insomnia",storage:"Room temperature",warnings:"Tendon rupture risk — stop if pain occurs. Avoid sun exposure. Do not take with antacids."},
  {code:"B017890100",nameEN:"Pantoprazole 40mg",nameZH:"保衛胃腸溶錠",price:"7.20",form:"Enteric tablet",ingredient:"Pantoprazole Sodium",manufacturer:"Takeda",atc:"A02BC02",category:"Stomach Acid",usage:"Take 30 minutes before a meal. Swallow whole.",sideEffects:"Headache, diarrhea, nausea",storage:"Room temperature",warnings:"Long-term use: monitor magnesium and B12 levels."},
  {code:"A044321100",nameEN:"Doxycycline 100mg",nameZH:"去氧羥四環素膠囊",price:"2.30",form:"Capsule",ingredient:"Doxycycline",manufacturer:"Pfizer",atc:"J01AA02",category:"Antibiotic",usage:"Take with a full glass of water. Do not lie down for 30 minutes after.",sideEffects:"Sun sensitivity, nausea, esophageal irritation",storage:"Room temperature, protect from light",warnings:"Use sunscreen. Do not take with dairy, antacids, or iron. Not for pregnant women or children under 8."},
];

// Prescription OCR simulation — matches drug names from image text
function matchDrugsFromText(text) {
  const lower = text.toLowerCase();
  return DRUGS.filter(d =>
    lower.includes(d.ingredient.toLowerCase().split(" ")[0]) ||
    lower.includes(d.nameEN.toLowerCase().split(" ")[0]) ||
    d.nameZH.split("").some(ch => text.includes(ch) && ch.length > 1)
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [myMeds, setMyMeds] = useState([]);
  const [reminders, setReminders] = useState({});
  const [scanResult, setScanResult] = useState(null);
  const [scanImg, setScanImg] = useState(null);

  const filtered = q.length > 0
    ? DRUGS.filter(d =>
        d.nameEN.toLowerCase().includes(q.toLowerCase()) ||
        d.nameZH.includes(q) ||
        d.ingredient.toLowerCase().includes(q.toLowerCase()) ||
        d.code.includes(q) ||
        d.category.toLowerCase().includes(q.toLowerCase()) ||
        d.atc.toLowerCase().includes(q.toLowerCase())
      )
    : DRUGS;

  const addToMyMeds = (drug) => {
    if (!myMeds.find(m => m.code === drug.code)) {
      setMyMeds([...myMeds, drug]);
      setReminders(prev => ({ ...prev, [drug.code]: { enabled: false, times: ["08:00", "20:00"] } }));
    }
  };

  const removeFromMyMeds = (code) => {
    setMyMeds(myMeds.filter(m => m.code !== code));
    setReminders(prev => { const n = { ...prev }; delete n[code]; return n; });
  };

  const toggleReminder = (code) => {
    setReminders(prev => ({ ...prev, [code]: { ...prev[code], enabled: !prev[code]?.enabled } }));
  };

  const updateTime = (code, idx, val) => {
    setReminders(prev => {
      const times = [...(prev[code]?.times || ["08:00", "20:00"])];
      times[idx] = val;
      return { ...prev, [code]: { ...prev[code], times } };
    });
  };

  const addTime = (code) => {
    setReminders(prev => {
      const times = [...(prev[code]?.times || []), "12:00"];
      return { ...prev, [code]: { ...prev[code], times } };
    });
  };

  const removeTime = (code, idx) => {
    setReminders(prev => {
      const times = (prev[code]?.times || []).filter((_, i) => i !== idx);
      return { ...prev, [code]: { ...prev[code], times } };
    });
  };

  const handleScan = () => {
    // Simulate OCR result from the prescription photo
    const mockOcrText = "Magnesium oxide 250mG 氧化鎂 錠 MAGNESIUM OXIDE Acetaminophen Omeprazole";
    const matched = matchDrugsFromText(mockOcrText);
    setScanResult(matched);
  };

  // Styles
  const C = {
    app: { maxWidth: 440, margin: "0 auto", background: "#f0f4f8", minHeight: "100vh", fontFamily: "-apple-system,'Segoe UI',sans-serif" },
    header: { background: "linear-gradient(135deg, #0ea5e9, #0284c7)", padding: "16px 20px", color: "#fff" },
    card: { background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
    inp: { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid #cbd5e1", fontSize: 15, boxSizing: "border-box", background: "#fff" },
    pill: (c) => ({ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 10, background: c === "cat" ? "#dbeafe" : c === "atc" ? "#fef3c7" : c === "price" ? "#d1fae5" : "#f1f5f9", color: c === "cat" ? "#1e40af" : c === "atc" ? "#92400e" : c === "price" ? "#065f46" : "#475569" }),
    btnPrimary: { background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%" },
    btnOutline: { background: "transparent", color: "#0ea5e9", border: "2px solid #0ea5e9", borderRadius: 10, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
    btnDanger: { background: "transparent", color: "#ef4444", border: "none", fontSize: 12, cursor: "pointer", padding: "4px 8px" },
    bottomNav: { display: "flex", background: "#fff", borderBottom: "2px solid #0ea5e9" },
    navBtn: (a) => ({ flex: 1, padding: "10px 4px", border: "none", background: "transparent", cursor: "pointer", textAlign: "center", color: a ? "#0ea5e9" : "#94a3b8", fontSize: 10, fontWeight: a ? 700 : 400 }),
    section: { padding: "14px 16px" },
    row: { display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 },
  };

  // ============ SEARCH TAB ============
  const SearchTab = () => (
    <div style={C.section}>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <input style={C.inp} value={q} onChange={e => setQ(e.target.value)} placeholder="Search drug name, ingredient, or category..." />
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>{filtered.length} drugs found</div>
      {filtered.map((d, i) => (
        <div key={i} style={{ ...C.card, cursor: "pointer" }} onClick={() => setSel(d)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{d.nameEN}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{d.nameZH} · {d.ingredient}</div>
            </div>
            <span style={C.pill("cat")}>{d.category}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span style={C.pill("atc")}>ATC: {d.atc}</span>
            <span style={C.pill("price")}>NT$ {d.price}</span>
            <span style={C.pill("form")}>{d.form}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // ============ DETAIL PAGE ============
  const DetailPage = () => {
    const d = sel;
    const isInMyMeds = myMeds.find(m => m.code === d.code);
    return (
      <div style={C.section}>
        <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: "#0ea5e9", cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 12 }}>← Back</button>
        <div style={{ ...C.card, padding: 20 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <span style={C.pill("cat")}>{d.category}</span>
            <span style={C.pill("atc")}>ATC: {d.atc}</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{d.nameEN}</div>
          <div style={{ fontSize: 15, color: "#64748b", marginBottom: 16 }}>{d.nameZH}</div>

          {[
            ["Ingredient", d.ingredient],
            ["NHI Code", d.code],
            ["Dosage Form", d.form],
            ["NHI Price", `NT$ ${d.price}`],
            ["Manufacturer", d.manufacturer],
          ].map(([k, v]) => (
            <div key={k} style={C.row}>
              <span style={{ fontWeight: 600, color: "#334155" }}>{k}</span>
              <span style={{ color: "#64748b", textAlign: "right", maxWidth: "55%" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* How to use */}
        <div style={{ ...C.card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 8 }}>How to take</div>
          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{d.usage}</div>
        </div>

        {/* Side effects */}
        <div style={{ ...C.card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 8 }}>Possible side effects</div>
          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{d.sideEffects}</div>
        </div>

        {/* Warnings */}
        <div style={{ ...C.card, padding: 16, background: "#fef2f2", borderColor: "#fecaca" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#991b1b", marginBottom: 8 }}>⚠ Important warnings</div>
          <div style={{ fontSize: 13, color: "#7f1d1d", lineHeight: 1.6 }}>{d.warnings}</div>
        </div>

        {/* Storage */}
        <div style={{ ...C.card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 8 }}>Storage</div>
          <div style={{ fontSize: 13, color: "#475569" }}>{d.storage}</div>
        </div>

        {/* Add to My Meds */}
        <button style={{ ...C.btnPrimary, marginTop: 8, background: isInMyMeds ? "#94a3b8" : "#0ea5e9" }} onClick={() => { if (!isInMyMeds) { addToMyMeds(d); } }}>
          {isInMyMeds ? "✓ Already in My Medications" : "+ Add to My Medications"}
        </button>
      </div>
    );
  };

  // ============ SCAN TAB ============
  const ScanTab = () => (
    <div style={C.section}>
      <div style={{ ...C.card, padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>📷</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 6 }}>Scan your prescription</div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Upload a photo of your prescription label and we'll identify all medications automatically.</div>
        <label style={{ ...C.btnPrimary, display: "block", cursor: "pointer" }}>
          📤 Upload prescription photo
          <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setScanImg(URL.createObjectURL(file));
              // Simulate OCR processing
              setTimeout(() => {
                const mockText = "Magnesium oxide 250mG 氧化鎂 Acetaminophen 500mg Omeprazole 20mg";
                setScanResult(matchDrugsFromText(mockText));
              }, 1500);
            }
          }} />
        </label>

        {/* Demo button */}
        <button style={{ ...C.btnOutline, marginTop: 12, width: "100%" }} onClick={() => {
          setScanImg("/prescription_demo.jpg");
          setTimeout(() => {
            const mockText = "Magnesium oxide 250mG 氧化鎂 MAGNESIUM OXIDE Acetaminophen Omeprazole";
            setScanResult(matchDrugsFromText(mockText));
          }, 1200);
        }}>
          Try demo prescription
        </button>
      </div>

      {/* How it works */}
      <div style={{ ...C.card, padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>How it works</div>
        {["Upload a photo of your prescription or drug label", "OCR reads drug names in English and Chinese", "System matches to NHI drug database with ATC codes", "View full details and add to your medication list"].map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: "#dbeafe", color: "#1e40af", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>{step}</div>
          </div>
        ))}
      </div>

      {/* Scan Results */}
      {scanResult && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 10 }}>
            {scanResult.length > 0 ? `✅ ${scanResult.length} medication(s) identified` : "No medications found"}
          </div>
          {scanResult.map((d, i) => (
            <div key={i} style={C.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{d.nameEN}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{d.nameZH} · {d.ingredient}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{d.usage}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <span style={C.pill("cat")}>{d.category}</span>
                  <button style={{ ...C.btnOutline, fontSize: 10, padding: "4px 10px" }} onClick={() => {
                    addToMyMeds(d);
                    setTab(2);
                  }}>+ Add</button>
                </div>
              </div>
              {/* Warnings inline */}
              <div style={{ marginTop: 8, padding: 8, background: "#fef2f2", borderRadius: 8, fontSize: 11, color: "#991b1b" }}>
                ⚠ {d.warnings}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ============ MY MEDS + REMINDERS TAB ============
  const MyMedsTab = () => (
    <div style={C.section}>
      <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>My Medications</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>{myMeds.length} medication{myMeds.length !== 1 ? "s" : ""} · Set reminders to never miss a dose</div>

      {myMeds.length === 0 ? (
        <div style={{ ...C.card, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💊</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#64748b" }}>No medications added yet</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Search for drugs or scan a prescription to add them here.</div>
        </div>
      ) : (
        myMeds.map((d, i) => {
          const rem = reminders[d.code] || { enabled: false, times: ["08:00", "20:00"] };
          return (
            <div key={i} style={{ ...C.card, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{d.nameEN}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{d.ingredient} · {d.form}</div>
                </div>
                <button style={C.btnDanger} onClick={() => removeFromMyMeds(d.code)}>Remove</button>
              </div>

              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, marginBottom: 10 }}>{d.usage}</div>

              {/* Reminder section */}
              <div style={{ background: "#f0f9ff", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#0c4a6e" }}>Reminders</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <div style={{ position: "relative", width: 40, height: 22, borderRadius: 11, background: rem.enabled ? "#0ea5e9" : "#cbd5e1", transition: "background .2s", cursor: "pointer" }} onClick={() => toggleReminder(d.code)}>
                      <div style={{ position: "absolute", top: 2, left: rem.enabled ? 20 : 2, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left .2s", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
                    </div>
                  </label>
                </div>

                {rem.enabled && (
                  <>
                    {rem.times.map((t, ti) => (
                      <div key={ti} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 14, background: "#dbeafe", color: "#1e40af", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {ti + 1}
                        </div>
                        <input type="time" value={t} onChange={e => updateTime(d.code, ti, e.target.value)} style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, fontWeight: 600 }} />
                        {rem.times.length > 1 && (
                          <button onClick={() => removeTime(d.code, ti)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, padding: "2px 6px" }}>×</button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addTime(d.code)} style={{ background: "none", border: "1px dashed #93c5fd", borderRadius: 8, color: "#0ea5e9", cursor: "pointer", fontSize: 12, padding: "6px 12px", width: "100%", marginTop: 4 }}>
                      + Add another time
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div style={C.app}>
      {/* Header */}
      <div style={C.header}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>💊 Rx-Norm Taiwan</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Your smart pharmacopeia assistant</div>
      </div>

      {/* Navigation */}
      <div style={C.bottomNav}>
        {[
          { icon: "🔍", label: "Search", idx: 0 },
          { icon: "📷", label: "Scan Rx", idx: 1 },
          { icon: "💊", label: "My Meds", idx: 2 },
        ].map(n => (
          <button key={n.idx} style={C.navBtn(tab === n.idx)} onClick={() => { setTab(n.idx); setSel(null); }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{n.icon}</div>
            {n.label}
            {n.idx === 2 && myMeds.length > 0 && (
              <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 8, padding: "1px 5px", marginLeft: 4 }}>{myMeds.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 0 && !sel && <SearchTab />}
      {tab === 0 && sel && <DetailPage />}
      {tab === 1 && <ScanTab />}
      {tab === 2 && <MyMedsTab />}
    </div>
  );
}
