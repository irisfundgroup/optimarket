import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Shield, HelpCircle, FileText, Mail } from 'lucide-react';

export default function HomeFooter() {
  return (
    <footer className="mt-16 px-4 pb-8"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-6xl mx-auto pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-base" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                OptiMarket
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
              La marketplace intelligente qui connecte acheteurs, vendeurs et prestataires de services.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>Légal</p>
            <ul className="space-y-2">
              <li>
                <Link to="/CGU" className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  <FileText className="w-3.5 h-3.5" /> Conditions Générales d'Utilisation
                </Link>
              </li>
              <li>
                <Link to="/CGU" className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  <Shield className="w-3.5 h-3.5" /> Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>Support</p>
            <ul className="space-y-2">
              <li>
                <Link to="/Assistance" className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  <HelpCircle className="w-3.5 h-3.5" /> Centre d'aide & FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@optimarket.app" className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: '#475569' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                  <Mail className="w-3.5 h-3.5" /> support@optimarket.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <p className="text-xs" style={{ color: '#1e2d4a' }}>© 2026 OptiMarket · Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}