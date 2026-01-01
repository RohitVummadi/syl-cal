import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SylCal from "./pages/SylCal";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>  
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sylcal" element={<SylCal />} />
      </Routes>
    </Router>
  );
}

export default App;