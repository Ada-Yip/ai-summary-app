import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DocumentPage() {
  const params = useParams();
  const name = params.name as string;
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchText() {
      setLoading(true);
      setError("");
      const ext = name.split('.').pop();
      if (ext === "pdf") {
        const res = await fetch("/api/documents/extract-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `documents/${name}` }),
        });
        const data = await res.json();
        if (res.ok) {
          setText(data.text);
        } else {
          setError(data.error);
        }
      } else {
        // txt 檔案直接取得 public URL
        const res = await fetch(`/api/documents/list`);
        const data = await res.json();
        const file = data.files.find((f: any) => f.name === name);
        if (file) {
          const urlRes = await fetch(`/api/documents/get-url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: `documents/${name}` }),
          });
          const urlData = await urlRes.json();
          if (urlRes.ok && urlData.publicUrl) {
            const txtRes = await fetch(urlData.publicUrl);
            const txt = await txtRes.text();
            setText(txt);
          } else {
            setError(urlData.error);
          }
        } else {
          setError("找不到檔案");
        }
      }
      setLoading(false);
    }
    fetchText();
  }, [name]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1d324b' }}>文件內容：{name}</h1>
      {loading ? <p>載入中...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>{text}</pre>
      )}
    </div>
  );
}
