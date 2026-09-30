import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Sparkles, Scale, Heart, Bell, PlusCircle, 
  User as UserIcon, LogOut, CheckCircle2, ShieldCheck, ChevronDown,
  Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShortlist } from '../context/ShortlistContext';
import { api } from '../services/api';

export default function Navbar({ onOpenAuth, onNavigate, currentPage }) {
  const { user, logout, demoLogin } = useAuth();
  const { shortlistedIds, compareIds } = useShortlist();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(data => setNotifications(data))
        .catch(err => console.log("Notifs err:", err.message));
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch(e) {}
  };

  const handleMobileNav = (page) => {
    setMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-card)',
      padding: '0.75rem 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
          }}>
            <Building2 size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Prop<span style={{ color: '#818cf8' }}>Intel</span> AI
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Cloud Real Estate Analysis
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="desktop-only" style={{ alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => onNavigate('search')}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === 'search' ? '#818cf8' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <Search size={16} /> Explore Properties
          </button>

          <button 
            onClick={() => onNavigate('compare')}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === 'compare' ? '#818cf8' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Scale size={16} /> Compare
            {compareIds.length > 0 && (
              <span style={{
                background: 'var(--accent-primary)',
                color: '#fff',
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                fontWeight: 700
              }}>
                {compareIds.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => onNavigate('shortlist')}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === 'shortlist' ? '#818cf8' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Heart size={16} /> Shortlist
            {shortlistedIds.size > 0 && (
              <span style={{
                background: 'var(--accent-rose)',
                color: '#fff',
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px',
                fontWeight: 700
              }}>
                {shortlistedIds.size}
              </span>
            )}
          </button>

          {/* Quick AI Valuation Sandbox */}
          <button 
            onClick={() => onNavigate('valuation-tool')}
            style={{
              background: 'none',
              border: 'none',
              color: currentPage === 'valuation-tool' ? '#818cf8' : 'var(--text-main)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <Sparkles size={16} color="#a855f7" /> AI Valuator
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Post Property CTA */}
          <div className="desktop-only">
            <button 
              className="btn btn-emerald btn-sm"
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  onNavigate('post-property');
                }
              }}
            >
              <PlusCircle size={16} /> Post Property
            </button>
          </div>

          {/* Notification Bell */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-secondary btn-icon"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '9px',
                    height: '9px',
                    background: 'var(--accent-rose)',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-card)'
                  }} />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="glass-panel animate-fade" style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '320px',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 200
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications ({notifications.length})</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                          borderBottom: '1px solid var(--border-subtle)',
                          marginBottom: '0.35rem'
                        }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff' }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth State (Desktop) */}
          <div className="desktop-only">
            {!user ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenAuth}
                >
                  Sign In
                </button>

                {/* Quick Demo Switcher */}
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => demoLogin('buyer')}
                  title="Login with 1-click test credentials"
                >
                  Demo Login
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {user.fullName.charAt(0)}
                  </div>
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.fullName.split(' ')[0]}
                  </span>
                  <span className="badge badge-ai" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {user.role}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {showUserMenu && (
                  <div className="glass-panel animate-fade" style={{
                    position: 'absolute',
                    right: 0,
                    top: '115%',
                    width: '200px',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 200
                  }}>
                    <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>

                    {user.role === 'seller' && (
                      <button 
                        onClick={() => { setShowUserMenu(false); onNavigate('seller-dashboard'); }}
                        style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px' }}
                      >
                        Seller Dashboard
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button 
                        onClick={() => { setShowUserMenu(false); onNavigate('admin-dashboard'); }}
                        style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '4px' }}
                      >
                        Admin Moderation
                      </button>
                    )}

                    <button 
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-rose)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button 
            className="mobile-only btn btn-secondary btn-icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{ width: '38px', height: '38px' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Overlay & Sliding Panel */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Building2 size={18} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
                    Prop<span style={{ color: '#818cf8' }}>Intel</span> AI
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* User Profile Card (Mobile) */}
            {user ? (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{user.fullName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>
                <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>Role: {user.role}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                  style={{ width: '100%' }}
                >
                  Sign In / Register
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => { setMobileMenuOpen(false); demoLogin('buyer'); }}
                  style={{ width: '100%' }}
                >
                  1-Click Demo Login
                </button>
              </div>
            )}

            {/* Post Property Mobile CTA */}
            <button 
              className="btn btn-emerald btn-sm"
              onClick={() => {
                setMobileMenuOpen(false);
                if (!user) onOpenAuth();
                else onNavigate('post-property');
              }}
              style={{ width: '100%', marginBottom: '1.25rem', padding: '0.65rem' }}
            >
              <PlusCircle size={16} /> Post Property
            </button>

            {/* Navigation Links (Mobile) */}
            <div style={{ flexGrow: 1, overflowY: 'auto' }}>
              <button 
                className={`mobile-nav-item ${currentPage === 'home' ? 'active' : ''}`}
                onClick={() => handleMobileNav('home')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Building2 size={16} color="#818cf8" /> Home
                </span>
              </button>

              <button 
                className={`mobile-nav-item ${currentPage === 'search' ? 'active' : ''}`}
                onClick={() => handleMobileNav('search')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Search size={16} color="#818cf8" /> Explore Properties
                </span>
              </button>

              <button 
                className={`mobile-nav-item ${currentPage === 'compare' ? 'active' : ''}`}
                onClick={() => handleMobileNav('compare')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Scale size={16} color="#818cf8" /> Compare Properties
                </span>
                {compareIds.length > 0 && (
                  <span className="badge badge-ai" style={{ fontSize: '0.68rem' }}>
                    {compareIds.length}
                  </span>
                )}
              </button>

              <button 
                className={`mobile-nav-item ${currentPage === 'shortlist' ? 'active' : ''}`}
                onClick={() => handleMobileNav('shortlist')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Heart size={16} color="#f43f5e" /> Saved Shortlist
                </span>
                {shortlistedIds.size > 0 && (
                  <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>
                    {shortlistedIds.size}
                  </span>
                )}
              </button>

              <button 
                className={`mobile-nav-item ${currentPage === 'valuation-tool' ? 'active' : ''}`}
                onClick={() => handleMobileNav('valuation-tool')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Sparkles size={16} color="#a855f7" /> AI Valuation Tool
                </span>
              </button>

              {user?.role === 'seller' && (
                <button 
                  className={`mobile-nav-item ${currentPage === 'seller-dashboard' ? 'active' : ''}`}
                  onClick={() => handleMobileNav('seller-dashboard')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={16} color="#10b981" /> Seller Dashboard
                  </span>
                </button>
              )}

              {user?.role === 'admin' && (
                <button 
                  className={`mobile-nav-item ${currentPage === 'admin-dashboard' ? 'active' : ''}`}
                  onClick={() => handleMobileNav('admin-dashboard')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <ShieldCheck size={16} color="#f59e0b" /> Admin Moderation
                  </span>
                </button>
              )}
            </div>

            {/* Logout (Mobile) */}
            {user && (
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            )}

          </div>
        </div>
      )}

    </header>
  );
}
