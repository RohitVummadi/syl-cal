import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import '../components/app-shell.css';
import './dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppShell active="dashboard">
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome to SylCal</h1>
          <p>Turn course syllabi into an organized calendar in a few minutes.</p>
        </header>

        <section className="dashboard-start" aria-labelledby="start-title">
          <div>
            <h2 id="start-title">Start with your syllabi</h2>
            <p>Upload one or more course PDFs. SylCal pulls out deadlines, exams, and important dates into a calendar file you can import.</p>
          </div>
          <button type="button" className="dashboard-action" onClick={() => navigate('/sylcal')}>
            Upload syllabi
          </button>
        </section>
      </main>
    </AppShell>
  );
}

export default Dashboard;
