import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TestList } from './pages/TestList';
import { TestTaking } from './pages/TestTaking';
import { TestResult } from './pages/TestResult';
import { UserResults } from './pages/UserResults';
import { Psychologist } from './pages/Psychologist';
import { Admin } from './pages/Admin';

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tests" element={<TestList />} />
          <Route path="/tests/:id" element={<TestTaking />} />
          <Route path="/test-result" element={<TestResult />} />

          <Route
            path="/results"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/psychologist"
            element={
              <ProtectedRoute allowedRoles={['psychologist', 'admin']}>
                <Psychologist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


