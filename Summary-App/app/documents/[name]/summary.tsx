import { useState } from "react";
import { useParams } from "next/navigation";

export default function SummaryPage() {
  const params = useParams();
  const name = params.name as string;
  const [text, setText] = useState("");
  const [requirement, setRequirement] = useState("");
  const [language, setLanguage] = useState("en");
  const [summary, setSummary] = useState("");
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    // 取得原始文件內容
    const urlRes = await fetch(`/api/documents/get-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: `documents/${name}` }),
    });
    const urlData = await urlRes.json();
    if (!urlRes.ok || !urlData.publicUrl) {
      setError(urlData.error);
      setLoading(false);
      return;
    }
    const txtRes = await fetch(urlData.publicUrl);
    const txt = await txtRes.text();
    setText(txt);
    // 呼叫摘要 API
    const res = await fetch(`/api/summary/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentName: name, text: txt, requirement, language }),
    });
    const data = await res.json();
    if (res.ok) {
      setSummary(data.summary);
    } else {
      setError(data.error);
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1d324b' }}>文件摘要：{name}</h1>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 'bold', marginRight: 8 }}>摘要需求：</label>
        <input value={requirement} onChange={e => setRequirement(e.target.value)} style={{ marginRight: 8 }} />
        <label style={{ fontWeight: 'bold', marginRight: 8 }}>語言：</label>
        <select value={language} onChange={e => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
        <button onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded" style={{ marginLeft: 8 }}>
          {loading ? '生成中...' : '生成摘要'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {summary && !editing && (
        <div>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>{summary}</pre>
          <button onClick={() => { setEditValue(summary); setEditing(true); }} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded" style={{ marginTop: 8 }}>
            編輯摘要
          </button>
        </div>
      )}
      {editing && (
        <div style={{ marginTop: 16 }}>
          <textarea value={editValue} onChange={e => setEditValue(e.target.value)} rows={8} style={{ width: '100%', padding: 8, borderRadius: 8 }} />
          <button
            onClick={async () => {
              setLoading(true);
              setError("");
              const res = await fetch(`/api/summary/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentName: name, summary: editValue }),
              });
              const data = await res.json();
              if (res.ok) {
                setSummary(editValue);
                setEditing(false);
              } else {
                setError(data.error);
              }
              setLoading(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded"
            style={{ marginTop: 8, marginRight: 8 }}
            disabled={loading}
          >
            儲存摘要
          </button>
          <button onClick={() => setEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded" style={{ marginTop: 8 }}>
            取消
          </button>
        </div>
      )}
    </div>
  );
}
