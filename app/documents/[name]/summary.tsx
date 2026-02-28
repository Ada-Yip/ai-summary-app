'use client'

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePreferences } from "@/lib/usePreferences";

export default function SummaryPage() {
  const params = useParams();
  const name = params.name as string;
  const { preferences, isLoaded, updateLanguage, updateSummaryRequirement } = usePreferences();
  
  const [text, setText] = useState("");
  const [requirement, setRequirement] = useState("");
  const [language, setLanguage] = useState("");
  const [summary, setSummary] = useState("");
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize language and requirement from preferences
  useEffect(() => {
    if (isLoaded) {
      setLanguage(preferences.language || "en");
      setRequirement(preferences.summaryRequirement || "");
    }
  }, [isLoaded, preferences]);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    
    try {
      // Create a single controller and timeout for the entire operation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for entire operation
      
      try {
        // Download the file content from server-side API
        const downloadRes = await fetch(`/api/documents/download`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `documents/${name}` }),
          signal: controller.signal,
        });
        
        const downloadData = await downloadRes.json();
        if (!downloadRes.ok || !downloadData.text) {
          setError(downloadData.error || "Failed to download file");
          setLoading(false);
          return;
        }
        
        const txt = downloadData.text;
        setText(txt);
        
        // Call the summary API
        const summaryRes = await fetch(`/api/summary/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentName: name, text: txt, requirement, language }),
          signal: controller.signal,
        });
        
        const summaryData = await summaryRes.json();
        if (summaryRes.ok) {
          setSummary(summaryData.summary);
          setError("");
        } else {
          setError(summaryData.error || "Failed to generate summary");
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError("Request timed out. Please try again.");
        } else {
          setError(`Error: ${err instanceof Error ? err.message : err}`);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1d324b' }}>文件摘要：{name}</h1>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 'bold', marginRight: 8 }}>摘要需求：</label>
        <input 
          value={requirement} 
          onChange={e => {
            setRequirement(e.target.value);
            updateSummaryRequirement(e.target.value);
          }} 
          style={{ marginRight: 8 }}
          disabled={loading}
        />
        <label style={{ fontWeight: 'bold', marginRight: 8 }}>語言：</label>
        <select 
          value={language} 
          onChange={e => {
            setLanguage(e.target.value);
            updateLanguage(e.target.value);
          }}
          disabled={loading}
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
        <button 
          onClick={handleGenerate} 
          disabled={loading} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded" 
          style={{ marginLeft: 8, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? '生成中...' : '生成摘要'}
        </button>
      </div>
      {error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "#fee2e2",
          borderLeft: "4px solid #ef4444",
          borderRadius: "4px",
          color: "#7f1d1d",
          marginBottom: "1rem"
        }}>
          <p style={{ margin: 0 }}>錯誤: {error}</p>
        </div>
      )}
      {summary && !editing && (
        <div>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap', marginBottom: 16 }}>{summary}</pre>
          <button 
            onClick={() => { setEditValue(summary); setEditing(true); }} 
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded"
            disabled={loading}
          >
            編輯摘要
          </button>
        </div>
      )}
      {editing && (
        <div style={{ marginTop: 16 }}>
          <textarea 
            value={editValue} 
            onChange={e => setEditValue(e.target.value)} 
            rows={8} 
            style={{ width: '100%', padding: 8, borderRadius: 8, fontFamily: 'monospace' }}
            disabled={loading}
          />
          <button
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const res = await fetch(`/api/summary/update`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ documentName: name, summary: editValue }),
                });
                const data = await res.json();
                if (res.ok) {
                  setSummary(editValue);
                  setEditing(false);
                  setError("");
                } else {
                  setError(data.error || "Failed to save summary");
                }
              } catch (err) {
                setError(`Error: ${err}`);
              } finally {
                setLoading(false);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded"
            style={{ marginTop: 8, marginRight: 8, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
          >
            儲存摘要
          </button>
          <button 
            onClick={() => setEditing(false)} 
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1 px-3 rounded" 
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
