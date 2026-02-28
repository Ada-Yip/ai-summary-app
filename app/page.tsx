'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import { usePreferences } from "@/lib/usePreferences";
import type { Components } from 'react-markdown';
import type { HeadingProps, CodeProps } from 'react-markdown/lib/ast-to-react';

interface DocumentFile {
  name: string;
  id: string;
  updated_at?: string;
}

interface DocumentDetail {
  name: string;
  text: string;
  summary: string;
  error?: string;
}

export default function Home() {
  const { preferences, isLoaded, updateLanguage, updateSummaryRequirement } = usePreferences();
  
  const [status, setStatus] = useState("Ready");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [documentDetails, setDocumentDetails] = useState<{ [key: string]: DocumentDetail }>({});
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null);
  const [requirement, setRequirement] = useState("");
  const [language, setLanguage] = useState("");
  const [editingSummary, setEditingSummary] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [viewMode, setViewMode] = useState<{ [key: string]: 'original' | 'markdown' }>({});
  const [regeneratingFile, setRegeneratingFile] = useState<string | null>(null);
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({});

  // Initialize language and requirement from preferences
  useEffect(() => {
    if (isLoaded) {
      setLanguage(preferences.language || "en");
      setRequirement(preferences.summaryRequirement || "");
    }
  }, [isLoaded, preferences]);

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

  // Load document content
  async function loadDocumentContent(fileName: string) {
    if (documentDetails[fileName]) {
      return;
    }
    
    setLoadingDetail(fileName);
    try {
      const ext = fileName.split('.').pop();
      let text = "";
      
      if (ext === "pdf") {
        const res = await fetch("/api/documents/extract-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `documents/${fileName}` }),
        });
        const data = await res.json();
        if (res.ok && data.text) {
          text = data.text;
        } else {
          throw new Error(data.error || "Failed to extract text from PDF");
        }
      } else {
        // TXT file: download content directly from API
        const res = await fetch(`/api/documents/download`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: `documents/${fileName}` }),
        });
        const data = await res.json();
        if (res.ok && data.text) {
          text = data.text;
        } else {
          throw new Error(data.error || "Failed to download file");
        }
      }

      setDocumentDetails(prev => ({
        ...prev,
        [fileName]: { name: fileName, text, summary: "" }
      }));
    } catch (error) {
      setDocumentDetails(prev => ({
        ...prev,
        [fileName]: { name: fileName, text: "", summary: "", error: error instanceof Error ? error.message : String(error) }
      }));
    } finally {
      setLoadingDetail(null);
    }
  }

  // Load existing summary
  async function loadExistingSummary(fileName: string) {
    try {
      const res = await fetch('/api/summary/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentName: fileName }),
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setDocumentDetails(prev => ({
          ...prev,
          [fileName]: { ...prev[fileName], summary: data.summary }
        }));
      }
    } catch (err) {
      // No existing summary found
    }
  }

  // Load file URL for viewing
  async function loadFileUrl(fileName: string) {
    if (fileUrls[fileName]) {
      return;
    }
    
    try {
      // Generate a server-side URL that serves the file directly
      const fileUrl = `/api/documents/serve?path=documents/${encodeURIComponent(fileName)}`;
      setFileUrls(prev => ({
        ...prev,
        [fileName]: fileUrl
      }));
    } catch (error) {
      setStatus(`Error loading file: ${error}`);
    }
  }

  // Generate summary
  async function handleGenerateSummary(fileName: string) {
    try {
      setLoadingDetail(fileName);
      const detail = documentDetails[fileName];
      if (!detail.text) {
        await loadDocumentContent(fileName);
      }
      
      const textToUse = documentDetails[fileName]?.text || detail.text;
      const res = await fetch(`/api/summary/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: fileName, text: textToUse, requirement, language }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setDocumentDetails(prev => ({
          ...prev,
          [fileName]: { ...prev[fileName], summary: data.summary }
        }));
      } else {
        throw new Error(data.error || "Failed to generate summary");
      }
    } catch (error) {
      setStatus(`Error generating summary: ${error}`);
    } finally {
      setLoadingDetail(null);
    }
  }

  // Handle edit summary
  async function handleEditSummary(fileName: string) {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/summary/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: fileName, summary: editValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setDocumentDetails(prev => ({
          ...prev,
          [fileName]: { ...prev[fileName], summary: editValue }
        }));
        setEditingSummary(null);
        setStatus(`Summary for "${fileName}" updated successfully`);
      } else {
        throw new Error(data.error || "Failed to save summary");
      }
    } catch (error) {
      setStatus(`Error saving summary: ${error}`);
    } finally {
      setSavingEdit(false);
    }
  }

  // Delete a document
  async function handleDelete(fileName: string) {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This will also delete its summary.`)) {
      return;
    }

    setDeletingFile(fileName);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const res = await fetch('/api/documents/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `documents/${fileName}` }),
          signal: controller.signal,
        });
        
        const data = await res.json();
        if (res.ok) {
          setStatus(`Document "${fileName}" deleted successfully`);
          // Add a small delay before refreshing to ensure the delete is processed
          setTimeout(() => fetchFiles(), 300);
        } else {
          setStatus(`Error deleting document: ${data.error || 'Unknown error'}`);
          setDeletingFile(null);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus(`Error deleting document: Request timed out`);
        } else {
          setStatus(`Error deleting document: ${err}`);
        }
        setDeletingFile(null);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      setStatus(`Error deleting document: ${error}`);
      setDeletingFile(null);
    }
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

  // Convert plain text to markdown format
  const textToMarkdown = (text: string) => {
    if (!text) return text;
    
    // Add basic markdown formatting
    let markdown = text;
    
    // Convert lines that look like headings (all caps or short lines with colons)
    markdown = markdown.replace(/^([A-Z][A-Z0-9\s]+)$/gm, '## $1');
    
    // Convert lines with colons followed by content (key-value pairs)
    markdown = markdown.replace(/^([^:\n]+):\s+(.+)$/gm, '**$1:** $2');
    
    // Add line breaks for better formatting
    markdown = markdown.replace(/\n\n+/g, '\n\n');
    
    return markdown;
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
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => {
                            if (expandedFile === file.name) {
                              setExpandedFile(null);
                            } else {
                              setExpandedFile(file.name);
                              loadDocumentContent(file.name);
                              loadExistingSummary(file.name);
                            }
                          }}
                          style={{
                            padding: "0.4rem 0.8rem",
                            backgroundColor: "#06b6d4",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          {expandedFile === file.name ? "Hide" : "View"}
                        </button>

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

        {/* Expanded Document View */}
        {expandedFile && (
          <div style={{
            marginTop: "2rem",
            padding: "1.5rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            border: "2px solid #e5e7eb"
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              {expandedFile}
            </h3>

            {/* Document Text Viewer */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h4 style={{
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  color: '#374151',
                  margin: 0
                }}>
                  Document Content
                </h4>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => {
                      setViewMode(prev => ({ ...prev, [expandedFile]: 'original' }));
                      loadFileUrl(expandedFile);
                    }}
                    style={{
                      padding: "0.4rem 0.8rem",
                      backgroundColor: viewMode[expandedFile] !== 'markdown' ? "#06b6d4" : "#e5e7eb",
                      color: viewMode[expandedFile] !== 'markdown' ? "white" : "#374151",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setViewMode(prev => ({ ...prev, [expandedFile]: 'markdown' }))}
                    style={{
                      padding: "0.4rem 0.8rem",
                      backgroundColor: viewMode[expandedFile] === 'markdown' ? "#06b6d4" : "#e5e7eb",
                      color: viewMode[expandedFile] === 'markdown' ? "white" : "#374151",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    Markdown View
                  </button>
                </div>
              </div>
              {loadingDetail === expandedFile ? (
                <div style={{ textAlign: "center", padding: "1rem", color: '#6b7280' }}>
                  Loading document...
                </div>
              ) : documentDetails[expandedFile]?.error ? (
                <div style={{
                  padding: "1rem",
                  backgroundColor: "#fee2e2",
                  borderLeft: "4px solid #ef4444",
                  borderRadius: "4px",
                  color: "#7f1d1d"
                }}>
                  <p style={{ margin: 0 }}>Error: {documentDetails[expandedFile]?.error}</p>
                </div>
              ) : viewMode[expandedFile] === 'markdown' ? (
                <div style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  overflow: 'auto',
                  maxHeight: '400px',
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  color: '#1f2937'
                }}>
                  <ReactMarkdown
  components={{
    h1: (props: any) => {
      const { node, children, ...rest } = props;
      return <h1 style={{ marginTop: '1rem', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }} {...rest}>{children}</h1>;
    },
    h2: (props: any) => {
      const { node, children, ...rest } = props;
      return <h2 style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }} {...rest}>{children}</h2>;
    },
    h3: (props: any) => {
      const { node, children, ...rest } = props;
      return <h3 style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold' }} {...rest}>{children}</h3>;
    },
    p: (props: any) => {
      const { node, children, ...rest } = props;
      return <p style={{ margin: '0.5rem 0' }} {...rest}>{children}</p>;
    },
    ul: (props: any) => {
      const { node, ordered, children, ...rest } = props;
      return <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...rest}>{children}</ul>;
    },
    ol: (props: any) => {
      const { node, ordered, children, ...rest } = props;
      return <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }} {...rest}>{children}</ol>;
    },
    li: (props: any) => {
      const { node, ordered, children, ...rest } = props;
      return <li style={{ margin: '0.25rem 0' }} {...rest}>{children}</li>;
    },
    strong: (props: any) => {
      const { node, children, ...rest } = props;
      return <strong style={{ fontWeight: 'bold' }} {...rest}>{children}</strong>;
    },
    em: (props: any) => {
      const { node, children, ...rest } = props;
      return <em style={{ fontStyle: 'italic' }} {...rest}>{children}</em>;
    },
    code: (props: any) => {
      const { node, inline, className, children, ...rest } = props;
      return (
        <code 
          style={{ 
            backgroundColor: '#f3f4f6', 
            padding: inline ? '0.25rem 0.5rem' : '0.5rem',
            borderRadius: '3px', 
            fontFamily: 'monospace', 
            fontSize: '0.85em',
            display: inline ? 'inline' : 'block'
          }} 
          {...rest}
        >
          {children}
        </code>
      );
    },
  }}
>
  {textToMarkdown(documentDetails[expandedFile]?.text || "")}
</ReactMarkdown>
                </div>
              ) : (
                <div style={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  overflow: 'auto',
                  maxHeight: '600px',
                  fontSize: '0.875rem',
                  color: '#1f2937'
                }}>
                  {expandedFile.toLowerCase().endsWith('.pdf') ? (
                    fileUrls[expandedFile] ? (
                      <iframe
                        src={fileUrls[expandedFile]}
                        style={{
                          width: '100%',
                          height: '600px',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                        title={expandedFile}
                      />
                    ) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                        Loading PDF...
                      </div>
                    )
                  ) : (
                    <pre style={{
                      padding: '1rem',
                      margin: 0,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      color: '#1f2937',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      backgroundColor: '#ffffff'
                    }}>
                      {documentDetails[expandedFile]?.text || "No content loaded"}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{
                fontSize: '0.95rem',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: '#374151'
              }}>
                Document Summary
              </h4>

              {/* Summary Generation Controls */}
              {!documentDetails[expandedFile]?.summary && !editingSummary && (
                <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                      Summary Requirement (optional):
                    </label>
                    <textarea
                      value={requirement}
                      onChange={e => {
                        setRequirement(e.target.value);
                        updateSummaryRequirement(e.target.value);
                      }}
                      disabled={loadingDetail === expandedFile}
                      placeholder="e.g., Focus on key findings..."
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontFamily: "sans-serif",
                        fontSize: "0.875rem",
                        minHeight: "60px"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                      Language:
                    </label>
                    <select
                      value={language}
                      onChange={e => {
                        setLanguage(e.target.value);
                        updateLanguage(e.target.value);
                      }}
                      disabled={loadingDetail === expandedFile}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "0.875rem"
                      }}
                    >
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleGenerateSummary(expandedFile)}
                    disabled={loadingDetail === expandedFile}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: loadingDetail === expandedFile ? '#9ca3af' : '#8b5cf6',
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      cursor: loadingDetail === expandedFile ? "not-allowed" : "pointer"
                    }}
                  >
                    {loadingDetail === expandedFile ? "Generating..." : "Generate Summary"}
                  </button>
                </div>
              )}

              {/* Display Summary */}
              {documentDetails[expandedFile]?.summary && !editingSummary && (
                <div>
                  <pre style={{
                    background: '#ffffff',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflow: 'auto',
                    maxHeight: '300px',
                    margin: '0 0 1rem 0',
                    fontFamily: 'sans-serif',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    color: '#1f2937'
                  }}>
                    {documentDetails[expandedFile]?.summary}
                  </pre>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setEditingSummary(expandedFile);
                        setEditValue(documentDetails[expandedFile]?.summary || "");
                      }}
                      disabled={savingEdit || loadingDetail === expandedFile}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#eab308",
                        color: "#1f2937",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        cursor: savingEdit || loadingDetail === expandedFile ? "not-allowed" : "pointer"
                      }}
                    >
                      Edit Summary
                    </button>
                    <button
                      onClick={() => setRegeneratingFile(expandedFile)}
                      disabled={loadingDetail === expandedFile}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: loadingDetail === expandedFile ? '#9ca3af' : '#f59e0b',
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        cursor: loadingDetail === expandedFile ? "not-allowed" : "pointer"
                      }}
                    >
                      {loadingDetail === expandedFile ? "Regenerating..." : "Regenerate Summary"}
                    </button>
                  </div>
                </div>
              )}

              {/* Regenerate Summary Mode */}
              {regeneratingFile === expandedFile && (
                <div style={{ marginBottom: "1rem", padding: "1rem", backgroundColor: "#fef3c7", borderLeft: "4px solid #f59e0b", borderRadius: "8px", marginTop: "1rem" }}>
                  <h5 style={{ marginTop: 0, marginBottom: "0.75rem", color: "#92400e", fontSize: "0.95rem", fontWeight: "600" }}>Regenerate Summary</h5>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                      Summary Requirement (optional):
                    </label>
                    <textarea
                      value={requirement}
                      onChange={e => {
                        setRequirement(e.target.value);
                        updateSummaryRequirement(e.target.value);
                      }}
                      disabled={loadingDetail === expandedFile}
                      placeholder="e.g., Focus on key findings..."
                      style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontFamily: "sans-serif",
                        fontSize: "0.875rem",
                        minHeight: "60px"
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                      Language:
                    </label>
                    <select
                      value={language}
                      onChange={e => {
                        setLanguage(e.target.value);
                        updateLanguage(e.target.value);
                      }}
                      disabled={loadingDetail === expandedFile}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        fontSize: "0.875rem"
                      }}
                    >
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setRegeneratingFile(null);
                        handleGenerateSummary(expandedFile);
                      }}
                      disabled={loadingDetail === expandedFile}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: loadingDetail === expandedFile ? '#9ca3af' : '#f59e0b',
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        cursor: loadingDetail === expandedFile ? "not-allowed" : "pointer"
                      }}
                    >
                      {loadingDetail === expandedFile ? "Regenerating..." : "Confirm Regenerate"}
                    </button>
                    <button
                      onClick={() => setRegeneratingFile(null)}
                      disabled={loadingDetail === expandedFile}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        cursor: loadingDetail === expandedFile ? "not-allowed" : "pointer"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Edit Summary Mode */}
              {editingSummary === expandedFile && (
                <div>
                  <div style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#ffffff"
                  }}>
                    {/* Editor Header */}
                    <div style={{
                      backgroundColor: "#f3f4f6",
                      padding: "0.75rem 1rem",
                      borderBottom: "1px solid #d1d5db",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span style={{
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        color: "#374151"
                      }}>
                        Summary Editor
                      </span>
                      <span style={{
                        fontSize: "0.75rem",
                        color: "#6b7280"
                      }}>
                        {editValue.length} characters
                      </span>
                    </div>
                    
                    {/* Editor Textarea */}
                    <textarea
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      disabled={savingEdit}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        border: "none",
                        borderRadius: "0",
                        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        backgroundColor: "#ffffff",
                        color: "#1f2937",
                        resize: "vertical",
                        minHeight: "300px",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                    <button
                      onClick={() => handleEditSummary(expandedFile)}
                      disabled={savingEdit}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        cursor: savingEdit ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      {savingEdit ? "Saving..." : "Save Summary"}
                    </button>
                    <button
                      onClick={() => setEditingSummary(null)}
                      disabled={savingEdit}
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        fontWeight: "600",
                        cursor: savingEdit ? "not-allowed" : "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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