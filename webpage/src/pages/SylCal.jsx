import React, { useState } from 'react';
import { downloadCalendar, processSyllabi } from '../api';
import AppShell from '../components/AppShell';
import '../components/app-shell.css';
import './sylcal.css';

function SylCal() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const invalidFiles = selectedFiles.filter((file) => !file.name.toLowerCase().endsWith('.pdf') || file.size > 20 * 1024 * 1024);
    setFiles(selectedFiles.filter((file) => !invalidFiles.includes(file)));
    setError(invalidFiles.length ? 'Choose PDF files no larger than 20 MB each.' : null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const validFiles = droppedFiles.filter((file) => file.name.toLowerCase().endsWith('.pdf') && file.size <= 20 * 1024 * 1024);
    setFiles(validFiles);
    setError(validFiles.length !== droppedFiles.length ? 'Only PDF files up to 20 MB can be uploaded.' : null);
  };

  const removeFile = (index) => setFiles(files.filter((_, fileIndex) => fileIndex !== index));

  const processFiles = async () => {
    if (files.length === 0) {
      setError('Choose at least one PDF to continue.');
      return;
    }

    setProcessing(true);
    setError(null);
    setResults(null);

    try {
      const data = await processSyllabi(files);
      setResults(data);
      setFiles([]);
    } catch (err) {
      setError(err.message || 'We couldn’t create your calendar.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!results?.calendarId) return;
    setError(null);
    setDownloading(true);
    try {
      await downloadCalendar(results.calendarId);
    } catch (err) {
      setError(err.message || 'We could not download your calendar.');
    } finally {
      setDownloading(false);
    }
  };

  const startAnotherUpload = () => {
    setResults(null);
    setError(null);
  };

  return (
    <AppShell active="upload">
      <main className="upload-main" aria-busy={processing}>
        <header style={styles.header}>
          <h1 style={styles.title}>Upload syllabi</h1>
          <p style={styles.subtitle}>Add your PDFs. We’ll pull out deadlines, exams, and important dates.</p>
        </header>

        <div
          style={{ ...styles.dropZone, ...(files.length > 0 ? styles.dropZoneActive : {}) }}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => document.getElementById('fileInput').click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') document.getElementById('fileInput').click();
          }}
          aria-label="Choose PDF syllabi"
        >
          <svg style={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p style={styles.dropZoneText}>{files.length > 0 ? `${files.length} PDF${files.length === 1 ? '' : 's'} ready` : 'Drop PDFs here or choose files'}</p>
          <p style={styles.dropZoneSubtext}>PDF only · Up to 20 MB each · Multiple files supported</p>
          <input id="fileInput" type="file" accept="application/pdf" multiple onChange={handleFileChange} style={styles.fileInput} />
        </div>

        {files.length > 0 && (
          <section style={styles.fileList} aria-labelledby="files-title">
            <h2 id="files-title" style={styles.fileListTitle}>{files.length} file{files.length === 1 ? '' : 's'} selected</h2>
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} style={styles.fileItem}>
                <div style={styles.fileInfo}>
                  <span style={styles.fileName}>{file.name}</span>
                  <span style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button type="button" onClick={() => removeFile(index)} style={styles.removeBtn} aria-label={`Remove ${file.name}`}>Remove</button>
              </div>
            ))}
          </section>
        )}

        <button type="button" onClick={processFiles} disabled={processing || files.length === 0} style={{ ...styles.processBtn, ...(processing || files.length === 0 ? styles.processBtnDisabled : {}) }}>
          {processing ? 'Extracting dates…' : 'Create calendar'}
        </button>

        <p className="upload-status" role="status" aria-live="polite">
          {processing ? 'Extracting important dates from your syllabi. This can take a minute.' : files.length > 0 ? 'Review your selected PDFs, then create your calendar.' : ''}
        </p>

        {error && <div style={styles.error} role="alert">{error}</div>}

        {results && (
          <section style={styles.results} aria-labelledby="results-title" role="status" aria-live="polite">
            <h2 id="results-title" style={styles.resultsTitle}>Your calendar is ready</h2>
            <p style={styles.resultsContent}>{results.eventCount || 0} events from {results.filesProcessed || 0} file{results.filesProcessed === 1 ? '' : 's'}.</p>
            <p className="results-help">Download the ICS file, then open it with Apple Calendar, Google Calendar, or Outlook to import your dates.</p>
            <div className="results-actions">
              {results.calendarId && <button type="button" onClick={handleDownload} disabled={downloading} style={styles.downloadBtn}>{downloading ? 'Preparing download…' : 'Download .ics calendar'}</button>}
              <button type="button" className="upload-reset" onClick={startAnotherUpload}>Upload another syllabus</button>
            </div>
          </section>
        )}
      </main>
    </AppShell>
  );
}

const styles = {
  header: { marginBottom: '2rem' },
  title: { margin: 0, color: '#1a202c', fontSize: '2rem', lineHeight: '1.2', letterSpacing: '-0.5px' },
  subtitle: { margin: '0.5rem 0 0', color: '#64748b', fontSize: '0.9375rem', lineHeight: '1.6', maxWidth: '60ch' },
  dropZone: { border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'white', cursor: 'pointer', transition: 'border-color 0.2s ease, background-color 0.2s ease' },
  dropZoneActive: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  uploadIcon: { width: '48px', height: '48px', margin: '0 auto 1rem', color: '#64748b' },
  dropZoneText: { fontSize: '1rem', color: '#334155', margin: '0.5rem 0', fontWeight: '600' },
  dropZoneSubtext: { fontSize: '0.875rem', color: '#64748b', margin: '0.5rem 0 0' },
  fileInput: { display: 'none' },
  fileList: { marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' },
  fileListTitle: { margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#334155', fontWeight: '600' },
  fileItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' },
  fileInfo: { display: 'flex', alignItems: 'baseline', gap: '0.75rem', minWidth: 0 },
  fileName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1a202c', fontSize: '0.875rem', fontWeight: '500' },
  fileSize: { flexShrink: 0, color: '#64748b', fontSize: '0.75rem' },
  removeBtn: { flexShrink: 0, padding: 0, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8125rem', textDecoration: 'underline', textUnderlineOffset: '3px' },
  processBtn: { width: '100%', marginTop: '1.5rem', padding: '0.875rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.9375rem', fontWeight: '600', cursor: 'pointer' },
  processBtnDisabled: { backgroundColor: '#cbd5e1', cursor: 'not-allowed' },
  error: { marginTop: '1rem', padding: '0.875rem 1rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.875rem' },
  results: { marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '8px' },
  resultsTitle: { margin: '0 0 0.5rem', color: '#065f46', fontSize: '1.125rem' },
  resultsContent: { margin: 0, color: '#047857', fontSize: '0.875rem' },
  downloadBtn: { display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer' },
};

export default SylCal;
