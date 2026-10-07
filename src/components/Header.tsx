import React from 'react';
import {
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { APP_CONFIG } from '../constants/canteen.constants';
import type { IUser } from '../types/canteen.types';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentUser: IUser | null;
  activeRole: string;
  onRoleSwitch: (role: string) => void;
  onOpenPaymentInfo: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  currentUser,
  activeRole,
  onRoleSwitch,
  onOpenPaymentInfo,
  onLogout,
}) => {
  const [currentDate] = React.useState(() =>
    new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  );

  return (
    <header className="masthead">
      <div className="masthead-inner">
        <div className="masthead-brand">
          <img
            src="/baf_crest.png"
            alt="Bangladesh Air Force RTS Crest"
            className="masthead-crest"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/favicon.svg';
            }}
          />
          <div className="masthead-titles">
            <h1>{APP_CONFIG.appName}</h1>
            <p>
              {APP_CONFIG.institution} • {APP_CONFIG.organization}
            </p>
          </div>
        </div>

        <div className="masthead-actions">
          {/* Active Date */}
          <div className="tactical-badge">
            <span style={{ color: 'var(--baf-gold)' }}>DATE:</span> {currentDate}
          </div>

          {/* Quick Payment Credentials from suggestions.txt */}
          <button
            className="btn btn-sm btn-outline"
            style={{ color: 'var(--baf-gold)', borderColor: 'var(--baf-gold)' }}
            onClick={onOpenPaymentInfo}
            title="View admin bKash & Bank account details"
          >
            <CreditCard size={14} />
            PAYMENT INFO
          </button>

          {/* Duty Manager Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#CBD5E1',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              DUTY:
            </span>
            <button
              className={`btn btn-sm ${
                activeRole === 'NCOIC' ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => onRoleSwitch('NCOIC')}
            >
              NCOIC
            </button>
            <button
              className={`btn btn-sm ${
                activeRole === 'JCOIC' ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => onRoleSwitch('JCOIC')}
            >
              JCOIC
            </button>
          </div>

          {/* Operator Profile Badge */}
          {currentUser ? (
            <div
              className="tactical-badge badge-navy"
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <ShieldCheck size={14} color="var(--baf-gold)" />
              <span>
                {currentUser.rank} {currentUser.name} ({currentUser.bdNo})
              </span>
              <button
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--baf-red)',
                  cursor: 'pointer',
                  marginLeft: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Log out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="tactical-badge">
              <UserCheck size={13} color="var(--baf-green)" />
              <span>DUTY OPERATOR ACTIVE</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            className="btn btn-sm btn-outline"
            onClick={onToggleTheme}
            title={
              theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
            }
          >
            {theme === 'dark' ? (
              <Sun size={14} color="var(--baf-gold)" />
            ) : (
              <Moon size={14} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
