'use client'

import Link from "next/link";
import { ReactNode } from "react";

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f9fafb"
    }}>
      {/* Navigation Bar */}
      <div style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 2rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <div style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Link
            href="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#1f2937",
              textDecoration: "none"
            }}
          >
            Document Summary App
          </Link>
          <Link
            href="/"
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "500"
            }}
          >
            Back to Documents
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        padding: "2rem",
        maxWidth: "1000px",
        margin: "0 auto"
      }}>
        {children}
      </div>
    </div>
  );
}
