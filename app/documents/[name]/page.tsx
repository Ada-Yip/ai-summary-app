'use client'

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
      
      try {
        if (ext === "pdf") {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for entire PDF operation
          
          try {
            const res = await fetch("/api/documents/extract-text", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: `documents/${name}` }),
              signal: controller.signal,
            });
            
            const data = await res.json();
            if (res.ok && data.text) {
              setText(data.text);
            } else {
              setError(data.error || "Failed to extract text from PDF");
            }
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              setError("PDF loading timed out. The file may be too large or corrupted.");
            } else {
              setError(`Error loading PDF: ${err instanceof Error ? err.message : err}`);
            }
          } finally {
            clearTimeout(timeoutId);
          }
        } else {
          // TXT file: get public URL and fetch content with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout for entire TXT operation
          
          try {
            const urlRes = await fetch(`/api/documents/get-url`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ path: `documents/${name}` }),
              signal: controller.signal,
            });
            
            const urlData = await urlRes.json();
            if (urlRes.ok && urlData.publicUrl) {
              const txtRes = await fetch(urlData.publicUrl, { signal: controller.signal });
              if (txtRes.ok) {
                const txt = await txtRes.text();
                setText(txt);
              } else {
                setError("Failed to download file");
              }
            } else {
              setError(urlData.error || "Failed to load file");
            }
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              setError("File loading timed out.");
            } else {
              setError(`Error loading document: ${err instanceof Error ? err.message : err}`);
            }
          } finally {
            clearTimeout(timeoutId);
          }
        }
      } catch (err) {
        setError(`Error loading document: ${err instanceof Error ? err.message : err}`);
      } finally {
        setLoading(false);
      }
    }
    fetchText();
  }, [name]);

  const decodedName = decodeURIComponent(name as string);

  return (
    <div>
      {/* Header */}
      <div style={{
        marginBottom: "2rem",
        paddingBottom: "1rem",
        borderBottom: "2px solid #e5e7eb"
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#1f2937'
        }}>
          Document: {decodedName}
        </h1>
        <p style={{
          color: '#6b7280',
          margin: 0
        }}>
          Viewing document content
        </p>
      </div>

      {/* Content Area */}
      <div style={{
        padding: "1.5rem",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: '#6b7280' }}>Loading document...</p>
          </div>
        ) : error ? (
          <div style={{
            padding: "1rem",
            backgroundColor: "#fee2e2",
            borderLeft: "4px solid #ef4444",
            borderRadius: "4px",
            color: "#7f1d1d"
          }}>
            <p style={{ margin: 0 }}>Error: {error}</p>
          </div>
        ) : (
          <pre style={{
            background: '#f9fafb',
            padding: '1rem',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'auto',
            maxHeight: '600px',
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            color: '#1f2937'
          }}>
            {text}
          </pre>
        )}
      </div>
    </div>
  );
}
