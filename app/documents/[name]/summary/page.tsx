'use client'

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usePreferences } from "@/lib/usePreferences";

export default function SummaryPage() {
  const params = useParams();
  const name = params.name as string;
  const { preferences, isLoaded, updateLanguage, updateSummaryRequirement } = usePreferences();
  
  const [documentText, setDocumentText] = useState("");
  const [requirement, setRequirement] = useState("");
  const [language, setLanguage] = useState("");
  const [summary, setSummary] = useState("");
  const [existingSummary, setExistingSummary] = useState("");
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatingNew, setGeneratingNew] = useState(false);

  // Initialize language and requirement from preferences
  useEffect(() => {
    if (isLoaded) {
      setLanguage(preferences.language || "en");
      setRequirement(preferences.summaryRequirement || "");
    }
  }, [isLoaded, preferences]);

  // Load existing summary on mount
  useEffect(() => {
    async function loadExistingSummary() {
      try {
        const res = await fetch('/api/summary/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentName: name }),
        });
        const data = await res.json();
        if (res.ok && data.summary) {
          setExistingSummary(data.summary);
          setSummary(data.summary);
        }
      } catch (err) {
        // No existing summary found
      }
    }
    loadExistingSummary();
  }, [name]);

  // Fetch document text
  async function fetchDocumentText() {
    try {
      const ext = name.split('.').pop();
      let text = "";
      
      if (ext === "pdf") {
        const res = await fetch("/api/documents/extract-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `documents/${name}` }),
        });
        const data = await res.json();
        if (res.ok) {
          text = data.text;
        } else {
          throw new Error(data.error || "Failed to extract PDF text");
        }
      } else {
        const urlRes = await fetch('/api/documents/get-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `documents/${name}` }),
        });
        const urlData = await urlRes.json();
        if (urlRes.ok && urlData.publicUrl) {
          const txtRes = await fetch(urlData.publicUrl);
          text = await txtRes.text();
        } else {
          throw new Error(urlData.error || "Failed to load document");
        }
      }
      return text;
    } catch (err) {
      throw err;
    }
  }

  // Generate a new summary
  async function handleGenerate() {
    try {
      setGeneratingNew(true);
      setError("");
      
      // Fetch the document text
      const docText = await fetchDocumentText();
      setDocumentText(docText);
      
      // Call the summary generation API
      const res = await fetch('/api/summary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: name,
          text: docText,
          requirement: requirement || undefined,
          language: language || 'en'
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setSummary(data.summary);
        setExistingSummary(data.summary);
        setError("");
      } else {
        setError(data.error || "Failed to generate summary");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Error: ${errorMsg}`);
    } finally {
      setGeneratingNew(false);
    }
  }

  // Save edited summary
  async function handleSave() {
    if (!editValue.trim()) {
      setError("Summary cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await fetch('/api/summary/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentName: name, summary: editValue }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setSummary(editValue);
        setExistingSummary(editValue);
        setEditing(false);
        setError("");
      } else {
        setError(data.error || "Failed to save summary");
      }
    } catch (err) {
      setError(`Error saving summary: ${err}`);
    } finally {
      setLoading(false);
    }
  }

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
          Document Summary
        </h1>
        <p style={{
          color: '#6b7280',
          margin: 0
        }}>
          {decodedName}
        </p>
      </div>

      {/* Summary Generation Section */}
      <div style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{
          fontSize: '1rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#374151'
        }}>
          Generate New Summary
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem",
          gridAutoFlow: "row"
        }}>
          <div>
            <label style={{
              display: "block",
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.25rem',
              color: '#374151'
            }}>
              Summary Requirements (Optional):
            </label>
            <textarea
              value={requirement}
              onChange={e => {
                setRequirement(e.target.value);
                updateSummaryRequirement(e.target.value);
              }}
              placeholder="Enter any specific requirements for the summary..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.25rem',
              color: '#374151'
            }}>
              Output Language:
            </label>
            <select
              value={language}
              onChange={e => {
                setLanguage(e.target.value);
                updateLanguage(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="en">English</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generatingNew}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: generatingNew ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: generatingNew ? 'not-allowed' : 'pointer'
          }}
        >
          {generatingNew ? 'Generating Summary...' : 'Generate New Summary'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          backgroundColor: "#fee2e2",
          borderLeft: "4px solid #ef4444",
          borderRadius: "4px",
          color: "#7f1d1d"
        }}>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Summary Display Section */}
      {summary && !editing && (
        <div style={{
          padding: "1.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#374151'
          }}>
            Current Summary
          </h2>
          <pre style={{
            background: '#f9fafb',
            padding: '1rem',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowX: 'auto',
            maxHeight: '400px',
            margin: '0 0 1rem 0',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            color: '#1f2937'
          }}>
            {summary}
          </pre>
          <button
            onClick={() => {
              setEditValue(summary);
              setEditing(true);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Edit Summary
          </button>
        </div>
      )}

      {/* Edit Mode */}
      {editing && (
        <div style={{
          padding: "1.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#374151'
          }}>
            Edit Summary
          </h2>
          <textarea
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              resize: 'vertical',
              minHeight: '300px',
              marginBottom: '1rem'
            }}
          />
          <div style={{
            display: "flex",
            gap: '0.75rem'
          }}>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save Summary'}
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* No Summary Message */}
      {!summary && !generatingNew && (
        <div style={{
          padding: "1.5rem",
          backgroundColor: "#eff6ff",
          borderLeft: "4px solid #3b82f6",
          borderRadius: "4px",
          color: "#1e40af"
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600' }}>No summary generated yet</p>
          <p style={{ margin: 0 }}>Generate a summary of this document by using the form above.</p>
        </div>
      )}
    </div>
  );
}
