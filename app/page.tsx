'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface DocumentFile {
  name: string;
  id: string;
  updated_at?: string;
}

export default function Home() {
  const [status, setStatus] = useState("Ready");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  // Fetch the list of documents
  async function fetchFiles() {
    setLoadingFiles(true);
    try {
      const res = await fetch('/api/documents/list');
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setStatus(`Error loading documents: Invalid JSON response`);
        setLoadingFiles(false);
        console.error('API response is not valid JSON:', text);
        return;
      }
      if (res.ok) {
        setFiles(data.files || []);
        setStatus("Documents loaded successfully");
      } else {
        setStatus(`Error loading documents: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error loading documents: ${error}`);
    }
    setLoadingFiles(false);
  }

  // Delete a document
  async function handleDelete(fileName: string) {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This will also delete its summary.`)) {
      return;
    }

    setDeletingFile(fileName);
    try {
      const res = await fetch('/api/documents/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `documents/${fileName}` }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Document "${fileName}" deleted successfully`);
        fetchFiles(); // Refresh the list
      } else {
        setStatus(`Error deleting document: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Error deleting document: ${error}`);
    }
    setDeletingFile(null);
  }

  // Load files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle file upload
  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setStatus("Please select a file");
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
        setStatus(`File "${file.name}" uploaded successfully`);
        setFile(null);
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchFiles(); // Refresh the list
      } else {
        setStatus(`Upload error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`Upload failed: ${error}`);
    }
    setUploading(false);
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (ext === 'txt') return 'TXT';
    return 'FILE';
  };

  return (
    <div style={{ 
      fontFamily: "system-ui, -apple-system, sans-serif", 
      padding: "2rem", 
      maxWidth: "1000px",
      margin: "0 auto",
      minHeight: "100vh",
      backgroundColor: "#f9fafb"
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: "2rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "1rem" }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem', 
          color: '#1f2937' 
        }}>
          Document Summary App
        </h1>
        <p style={{ 
          color: '#6b7280',
          margin: 0 
        }}>
          Upload documents, generate AI-powered summaries, and edit them as needed
        </p>
      </div>

      {/* Upload Section */}
      <div style={{
        marginBottom: "2rem",
        padding: "1.5rem",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Upload Document
        </h2>
        <form onSubmit={handleUpload}>
          <div style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <input
              type="file"
              accept=".txt,application/pdf"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                flex: 1,
                minWidth: "200px"
              }}
            />
            <button
              type="submit"
              disabled={uploading || !file}
              style={{
                backgroundColor: uploading || !file ? '#9ca3af' : '#10b981',
                color: 'white',
                fontWeight: '600',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: 'none',
                cursor: uploading || !file ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginTop: '0.5rem'
          }}>
            Supported formats: TXT, PDF (Max 50MB)
          </p>
        </form>
      </div>

      {/* Status Message */}
      {status && (
        <div style={{
          marginBottom: "1.5rem",
          padding: "1rem",
          backgroundColor: status.includes('Error') || status.includes('error') ? '#fee2e2' : '#dcfce7',
          borderLeft: `4px solid ${status.includes('Error') || status.includes('error') ? '#ef4444' : '#22c55e'}`,
          borderRadius: "4px",
          color: status.includes('Error') || status.includes('error') ? '#7f1d1d' : '#166534'
        }}>
          {status}
        </div>
      )}

      {/* Documents List Section */}
      <div style={{
        padding: "1.5rem",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Your Documents
        </h2>

        {loadingFiles ? (
          <p style={{ color: '#6b7280' }}>Loading documents...</p>
        ) : files.length === 0 ? (
          <p style={{ color: '#9ca3af' }}>No documents yet. Upload one to get started.</p>
        ) : (
          <div style={{
            overflow: "x-auto"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", color: "#374151", fontWeight: "600" }}>
                    File Name
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "left", color: "#374151", fontWeight: "600" }}>
                    Type
                  </th>
                  <th style={{ padding: "0.75rem", textAlign: "center", color: "#374151", fontWeight: "600" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr 
                    key={file.name} 
                    style={{ 
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: deletingFile === file.name ? "#fef2f2" : "transparent"
                    }}
                  >
                    <td style={{ padding: "0.75rem", color: "#1f2937" }}>
                      {file.name}
                    </td>
                    <td style={{ padding: "0.75rem", color: "#6b7280" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "4px",
                        fontSize: "0.875rem"
                      }}>
                        {getFileIcon(file.name)}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                        {/* View Document Link */}
                        <Link
                          href={`/documents/${encodeURIComponent(file.name)}`}
                          style={{
                            padding: "0.4rem 0.8rem",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          View
                        </Link>

                        {/* Summary Link */}
                        <Link
                          href={`/documents/${encodeURIComponent(file.name)}/summary`}
                          style={{
                            padding: "0.4rem 0.8rem",
                            backgroundColor: "#8b5cf6",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          Summary
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(file.name)}
                          disabled={deletingFile === file.name}
                          style={{
                            padding: "0.4rem 0.8rem",
                            backgroundColor: deletingFile === file.name ? "#d1d5db" : "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: deletingFile === file.name ? "not-allowed" : "pointer"
                          }}
                        >
                          {deletingFile === file.name ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: "2rem",
        paddingTop: "1rem",
        borderTop: "1px solid #e5e7eb",
        color: "#6b7280",
        fontSize: "0.875rem",
        textAlign: "center"
      }}>
        <p>
          All documents and summaries are securely stored in Supabase
        </p>
      </div>
    </div>
  );
}