import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth-context';
import './app-shell.css';

export default function AppShell({ active, children }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link to="/dashboard" className="app-brand" aria-label="SylCal dashboard">
          <span className="app-brand-mark" aria-hidden="true">SC</span>
          <span>SylCal</span>
        </Link>
        <nav className="app-nav" aria-label="Main navigation">
          <Link to="/dashboard" className={`app-nav-link${active === 'dashboard' ? ' is-active' : ''}`} aria-current={active === 'dashboard' ? 'page' : undefined}>Dashboard</Link>
          <Link to="/sylcal" className={`app-nav-link${active === 'upload' ? ' is-active' : ''}`} aria-current={active === 'upload' ? 'page' : undefined}>Upload syllabi</Link>
        </nav>
        <button type="button" className="app-sign-out" onClick={handleSignOut}>Sign out</button>
      </aside>
      {children}
    </div>
  );
}
