import React, { useState } from 'react';

function SylCal() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    setFiles(droppedFiles);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file');
      return;
    }

    setProcessing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      // Replace with your actual backend endpoint
      const response = await fetch('http://localhost:5000/api/process-syllabi', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process syllabi');
      }

      const data = await response.json();
      setResults(data);
      setFiles([]);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the syllabi');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.title}>📚 Syl-Cal</h1>
        <button 
          onClick={() => window.location.href = '/dashboard'} 
          style={styles.backBtn}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <main style={styles.main}>
        <div style={styles.header}>
          <h2>Upload Your Syllabi</h2>
          <p>Upload multiple PDF syllabi and we'll extract all important dates and assignments</p>
        </div>

        {/* Upload Area */}
        <div
          style={{
            ...styles.dropZone,
            ...(files.length > 0 ? styles.dropZoneActive : {})
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div style={styles.dropZoneContent}>
            <svg style={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p style={styles.dropZoneText}>
              {files.length > 0 
                ? `${files.length} file(s) selected` 
                : 'Drag and drop PDF files here, or click to select'}
            </p>
            <p style={styles.dropZoneSubtext}>PDF files only</p>
          </div>
          <input
            id="fileInput"
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            style={styles.fileInput}
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={styles.fileList}>
            <h3 style={styles.fileListTitle}>Selected Files:</h3>
            {files.map((file, index) => (
              <div key={index} style={styles.fileItem}>
                <div style={styles.fileInfo}>
                  <span style={styles.fileIcon}>📄</span>
                  <span style={styles.fileName}>{file.name}</span>
                  <span style={styles.fileSize}>
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={processFiles}
          disabled={processing || files.length === 0}
          style={{
            ...styles.processBtn,
            ...(processing || files.length === 0 ? styles.processBtnDisabled : {})
          }}
        >
          {processing ? (
            <>
              <span style={styles.spinner}></span>
              Processing...
            </>
          ) : (
            'Process Syllabi'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={styles.results}>
            <h3 style={styles.resultsTitle}>✅ Processing Complete!</h3>
            <div style={styles.resultsContent}>
              <p><strong>Events Extracted:</strong> {results.eventCount || 0}</p>
              <p><strong>Files Processed:</strong> {results.filesProcessed || 0}</p>
              {results.calendarUrl && (
                <a 
                  href={results.calendarUrl} 
                  download 
                  style={styles.downloadBtn}
                >
                  📅 Download Calendar File
                </a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#1a202c',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  main: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  dropZone: {
    border: '2px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '3rem 2rem',
    textAlign: 'center',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '2rem',
  },
  dropZoneActive: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f9ff',
  },
  dropZoneContent: {
    pointerEvents: 'none',
  },
  uploadIcon: {
    width: '64px',
    height: '64px',
    margin: '0 auto 1rem',
    color: '#94a3b8',
  },
  dropZoneText: {
    fontSize: '1.125rem',
    color: '#475569',
    margin: '0.5rem 0',
    fontWeight: '500',
  },
  dropZoneSubtext: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    margin: '0.5rem 0',
  },
  fileInput: {
    display: 'none',
  },
  fileList: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  fileListTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1rem',
    color: '#1a202c',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    marginBottom: '0.5rem',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
  },
  fileIcon: {
    fontSize: '1.5rem',
  },
  fileName: {
    fontSize: '0.875rem',
    color: '#1a202c',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  removeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '1.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  processBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  processBtnDisabled: {
    backgroundColor: '#cbd5e1',
    cursor: 'not-allowed',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    borderLeft: '4px solid #dc2626',
  },
  results: {
    marginTop: '2rem',
    padding: '2rem',
    backgroundColor: '#ecfdf5',
    borderRadius: '8px',
    borderLeft: '4px solid #10b981',
  },
  resultsTitle: {
    margin: '0 0 1rem 0',
    color: '#065f46',
    fontSize: '1.25rem',
  },
  resultsContent: {
    color: '#047857',
  },
  downloadBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#10b981',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default SylCal;
