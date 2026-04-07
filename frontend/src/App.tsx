import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import CasesList from './pages/CasesList';
import CaseForm from './pages/CaseForm';
import CaseDetail from './pages/CaseDetail';
import { getRole, setRole } from './services/api';

export default function App() {
  const [role, setRoleState] = useState(getRole());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setRoleState(e.target.value);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
    }`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Left side: Brand & Desktop Links */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-600">
                <span className="text-2xl">⚖️</span> 
                <span className="hidden sm:inline">Legixo</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/cases" className={navLinkClass}>Cases</NavLink>
                <NavLink to="/cases/new" className={navLinkClass}>New Case</NavLink>
              </div>
            </div>

            {/* Right side: Role Switcher & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <label className="hidden lg:block text-[11px] uppercase tracking-wider font-bold text-slate-500">Role</label>
                <select 
                  value={role} 
                  onChange={onRoleChange}
                  className="bg-transparent text-sm font-semibold outline-none cursor-pointer focus:ring-0 border-none p-0"
                >
                  <option value="Intern">Intern</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <NavLink to="/" end onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-600">Dashboard</NavLink>
            <NavLink to="/cases" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-600">Cases</NavLink>
            <NavLink to="/cases/new" onClick={() => setIsMenuOpen(false)} className="block text-base font-medium text-slate-600">New Case</NavLink>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<CasesList />} />
            <Route path="/cases/new" element={<CaseForm mode="create" />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            <Route path="/cases/:id/edit" element={<CaseForm mode="edit" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}