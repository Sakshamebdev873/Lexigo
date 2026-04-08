import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import CasesList from './pages/CasesList';
import CaseForm from './pages/CaseForm';
import CaseDetail from './pages/CaseDetail';
import { getRole, setRole } from './services/api';

export default function App() {
  // State Initialization
  const [role, setRoleState] = useState(getRole());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Handlers
  const handleRoleSelect = (newRole: string) => {
    setRole(newRole);
    setRoleState(newRole);
    setIsRoleDropdownOpen(false); // Close menu after selection
  };

  // NavLink styling utility
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-bold transition-colors duration-200 ${
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
              <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-indigo-600">
                <span className="text-2xl">⚖️</span> 
                <span className="hidden sm:inline">Legixo</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6">
                <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
                {/* Added 'end' here to prevent partial matching with /cases/new */}
                <NavLink to="/cases" end className={navLinkClass}>Cases</NavLink>
                <NavLink to="/cases/new" className={navLinkClass}>New Case</NavLink>
              </div>
            </div>

            {/* Right side: Role Switcher & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              
              {/* Premium Custom Dropdown */}
              <div className="relative">
                {/* Dropdown Trigger Button */}
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Current Role</span>
                    <span className="text-sm font-extrabold text-slate-700">{role}</span>
                  </div>
                  {/* Chevron that flips when open */}
                  <svg 
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu Panel */}
                {isRoleDropdownOpen && (
                  <>
                    {/* Invisible overlay to close dropdown when clicking outside */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsRoleDropdownOpen(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl bg-white shadow-xl border border-slate-100 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="py-1">
                        {['Intern', 'Admin'].map((r) => (
                          <button
                            key={r}
                            onClick={() => handleRoleSelect(r)}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-bold transition-colors ${
                              role === r 
                                ? 'bg-indigo-50 text-indigo-700' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {r}
                            {role === r && (
                              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
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
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg">
            <NavLink to="/" end onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-bold ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>Dashboard</NavLink>
            <NavLink to="/cases" end onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-bold ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>Cases</NavLink>
            <NavLink to="/cases/new" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-bold ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>New Case</NavLink>
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