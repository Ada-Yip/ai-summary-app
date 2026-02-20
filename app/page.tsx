'use client'

import React from "react";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Frontend running");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  async function fetchFiles() {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/documents/list');
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files || []);
      } else {
        setStatus(`取得檔案失敗：${data.error}`);
      }
    } catch (error) {
      setStatus(`取得檔案失敗：${error}`);
    }
    setLoadingFiles(false);
  }

  // 暫時註解掉刪除功能，因為沒有對應的 API
  /*
  async function handleDelete(path: string) {
    if (!window.confirm('確定要刪除這個檔案嗎？')) return;
    setStatus('刪除中...');
    const res = await fetch('/api/documents/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('刪除成功');
      fetchFiles();
    } else {
      setStatus(`刪除失敗：${data.error}`);
    }
  }
  */

  // 首次載入時取得檔案列表
  React.useEffect(() => {
    fetchFiles();
  }, []);

  async function checkBackend() {
    setStatus("Checking backend...");
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setStatus(`Backend says: ${data.message}`);
    } catch (error) {
      setStatus(`Backend error: ${error}`);
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setStatus("請選擇檔案");
      return;
    }
    setUploading(true);
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`上傳成功：${data.path}`);
        fetchFiles(); // 重新整理檔案列表
      } else {
        setStatus(`上傳失敗：${data.error}`);
      }
    } catch (error) {
      setStatus(`上傳失敗：${error}`);
    }
    setUploading(false);
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 800 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1d324b' }}>AI Summary App</h1>
      
      {/* 上傳表單 */}
      <form onSubmit={handleUpload} style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 'bold', marginRight: 8 }}>上傳文件（txt/PDF）:</label>
        <input
          type="file"
          accept=".txt,application/pdf"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          style={{ marginRight: 8 }}
        />
        <button
          type="submit"
          disabled={uploading}
          style={{
            backgroundColor: uploading ? '#9CA3AF' : '#059669',
            color: 'white',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? '上傳中...' : '上傳'}
        </button>
      </form>

      {/* 文件列表 */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 8 }}>文件列表</h2>
        {loadingFiles ? (
          <p>載入中...</p>
        ) : files.length === 0 ? (
          <p>尚無檔案</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {files.map(f => {
              const ext = f.name.split('.').pop()?.toLowerCase();
              return (
                <li key={f.name} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                  {/* PDF 檔案連結 */}
                  {ext === 'pdf' ? (
                    <a
                      href={`/documents/${encodeURIComponent(f.name)}`}
                      style={{ flex: 1, color: '#1d324b', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {f.name}（PDF）
                    </a>
                  ) : (
                    <span style={{ flex: 1 }}>{f.name}</span>
                  )}
                  
                  {/* 摘要按鈕 */}
                  <a
                    href={`/documents/${encodeURIComponent(f.name)}/summary`}
                    style={{
                      marginLeft: 8,
                      backgroundColor: '#4B5563',
                      color: 'white',
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: '4px',
                      textDecoration: 'none'
                    }}
                  >
                    摘要
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 後端檢查按鈕 */}
      <button 
        onClick={checkBackend}
        style={{
          backgroundColor: '#2563EB',
          color: 'white',
          fontWeight: 600,
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Check backend
      </button>
      
      {/* 狀態訊息 */}
      <p style={{ marginTop: 12, color: status.includes('失敗') ? 'red' : 'inherit' }}>
        {status}
      </p>
    </div>
  );
}