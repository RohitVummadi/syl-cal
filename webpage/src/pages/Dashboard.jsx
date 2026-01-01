import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Dashboard() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>SC</div>
          <span style={styles.logoText}>SylCal</span>
        </div>
        
        <nav style={styles.sideNav}>
          <div style={{...styles.navItem, ...styles.navItemActive}}>
            <span style={styles.navIcon}>■</span>
            <span>Dashboard</span>
          </div>
          <div style={styles.navItem} onClick={() => window.location.href = '/sylcal'}>
            <span style={styles.navIcon}>▲</span>
            <span>Upload</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>●</span>
            <span>Calendar</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>◆</span>
            <span>Tasks</span>
          </div>
        </nav>
        
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>Overview</h1>
            <p style={styles.pageSubtitle}>Manage your academic schedule</p>
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderLeft: '4px solid #2563eb'}}>
            <div style={styles.statLabel}>Active Courses</div>
            <div style={styles.statValue}>0</div>
          </div>
          <div style={{...styles.statCard, borderLeft: '4px solid #7c3aed'}}>
            <div style={styles.statLabel}>Upcoming Tasks</div>
            <div style={styles.statValue}>0</div>
          </div>
          <div style={{...styles.statCard, borderLeft: '4px solid #059669'}}>
            <div style={styles.statLabel}>This Week</div>
            <div style={styles.statValue}>0</div>
          </div>
        </div>

        <div style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          
          <div style={styles.actionsGrid}>
            <button 
              style={styles.actionCard}
              onClick={() => window.location.href = '/sylcal'}
            >
              <div style={styles.actionHeader}>
                <div style={{...styles.actionIcon, background: '#eff6ff', color: '#2563eb'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span style={styles.actionBadge}>Primary</span>
              </div>
              <h3 style={styles.actionTitle}>Upload Syllabi</h3>
              <p style={styles.actionDesc}>Import course documents and extract key dates automatically</p>
            </button>
            
            <button style={styles.actionCard}>
              <div style={styles.actionHeader}>
                <div style={{...styles.actionIcon, background: '#faf5ff', color: '#7c3aed'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
              </div>
              <h3 style={styles.actionTitle}>View Calendar</h3>
              <p style={styles.actionDesc}>Browse all events and deadlines in a monthly view</p>
            </button>
            
            <button style={styles.actionCard}>
              <div style={styles.actionHeader}>
                <div style={{...styles.actionIcon, background: '#f0fdf4', color: '#059669'}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
              </div>
              <h3 style={styles.actionTitle}>Manage Tasks</h3>
              <p style={styles.actionDesc}>Track progress on assignments and projects</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#1a1a1a',
    padding: '2rem 0',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #2a2a2a',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 1.5rem',
    marginBottom: '3rem',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '0.875rem',
    letterSpacing: '-0.5px',
  },
  logoText: {
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  sideNav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0 1rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    color: '#888',
    fontSize: '0.9375rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.15s',
    userSelect: 'none',
  },
  navItemActive: {
    backgroundColor: '#2a2a2a',
    color: 'white',
  },
  navIcon: {
    fontSize: '0.625rem',
    opacity: 0.7,
  },
  logoutBtn: {
    margin: '2rem 1.5rem 0',
    padding: '0.75rem',
    backgroundColor: 'transparent',
    border: '1px solid #333',
    color: '#888',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.15s',
  },
  main: {
    flex: 1,
    padding: '2.5rem 3rem',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2.5rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#0a0a0a',
    margin: '0 0 0.25rem 0',
    letterSpacing: '-0.5px',
  },
  pageSubtitle: {
    fontSize: '0.9375rem',
    color: '#666',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem',
    marginBottom: '3rem',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
  },
  statLabel: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#0a0a0a',
    letterSpacing: '-1px',
  },
  quickActions: {
    marginTop: '2rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#0a0a0a',
    marginBottom: '1.25rem',
    letterSpacing: '-0.3px',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  actionCard: {
    backgroundColor: 'white',
    padding: '1.75rem',
    borderRadius: '8px',
    border: '1px solid #e5e5e5',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  actionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadge: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: '#eff6ff',
    padding: '0.25rem 0.625rem',
    borderRadius: '4px',
  },
  actionTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#0a0a0a',
    margin: '0 0 0.5rem 0',
    letterSpacing: '-0.3px',
  },
  actionDesc: {
    fontSize: '0.875rem',
    color: '#666',
    margin: 0,
    lineHeight: '1.5',
  },
};

export default Dashboard;
