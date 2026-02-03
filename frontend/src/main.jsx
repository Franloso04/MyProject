import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Attendees from "./pages/Attendees";
import Agenda from "./pages/Agenda";
import Scanner from "./pages/Scanner";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendees" element={<Attendees />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}
