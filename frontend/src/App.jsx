import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import JobsPage from "./pages/JobsPage";
import Applications from "./pages/Applications";
import ProtectedRoute from "./components/ProtectedRoute";
import './styles/Base.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { useAuth } from "./hooks/useAuth";


function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterUser() {
  localStorage.clear();
  return <Register />;
}

function App() {
  useAuth();
  return (
    <>
    <LanguageProvider>
      <BrowserRouter>
        <Navbar />
        <div className="app-container">
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/jobs" element={<JobsPage />} />
            
              <Route path="/applications" element={
                <ProtectedRoute>
                <Applications />
                </ProtectedRoute> 
              } />
            
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
    </>
  );
}

export default App;