import React from 'react';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Settings,
} from 'lucide-react';
import type { ISquadron, IUser, IEntry } from '../../types/canteen.types';

interface SettingsHubProps {
  squadrons: ISquadron[];
  operators: IUser[];
  entries: IEntry[];
  activeEntryNo: string;
  onNavigateToSquadrons: () => void;
  onNavigateToOperators: () => void;
}

export const SettingsHub: React.FC<SettingsHubProps> = ({
  squadrons,
  operators,
  entries,
  activeEntryNo,
  onNavigateToSquadrons,
  onNavigateToOperators,
}) => {
  const ncoic = operators.find((op) => op.role === 'NCOIC');
  const jcoic = operators.find((op) => op.role === 'JCOIC');
  const totalRooms = squadrons.reduce((acc, s) => acc + s.rooms.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Welcome Card */}
      <div className="room-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--baf-gold)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
          <Settings size={22} color="var(--baf-gold)" />
          <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Canteen Configuration &amp; Administration</h2>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '800px', lineHeight: 1.5 }}>
          Manage Bangladesh Air Force RTS Canteen operational hierarchy, barrack room registries, and official personnel duty assignments through dedicated management portals.
        </p>
      </div>

      {/* 2 Primary Dedicated Hub Navigation Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: Squadron Management */}
        <div
          className="room-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid var(--baf-sky-blue)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onClick={onNavigateToSquadrons}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(11, 44, 90, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={24} color="var(--baf-sky-blue)" />
              </div>
              <span className="tactical-badge" style={{ backgroundColor: 'rgba(11, 44, 90, 0.15)', color: 'var(--baf-sky-blue)' }}>
                DEDICATED PAGE
              </span>
            </div>

            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>Squadrons &amp; Barracks Structure</h3>
            <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Configure recruit intake batches, inspect registered squadrons, perform squadron renames with automated ledger cascade, and safely adjust barrack room allocations.
            </p>

            {/* Quick Metrics */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '0.75rem',
                backgroundColor: 'var(--surface-hover)',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE ENTRY</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--baf-gold)' }}>Entry {activeEntryNo} ({entries.length} Batches)</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SQUADRONS</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{squadrons.length} Squadrons</div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL ROOMS</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>{totalRooms} Rooms</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToSquadrons();
            }}
          >
            <span>OPEN SQUADRON DIRECTORY</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Card 2: Duty Appointments */}
        <div
          className="room-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderTop: '4px solid var(--baf-gold)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onClick={onNavigateToOperators}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={24} color="var(--baf-gold)" />
              </div>
              <span className="tactical-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--baf-gold)' }}>
                DEDICATED PAGE
              </span>
            </div>

            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>Canteen Duty Appointments</h3>
            <p style={{ margin: '0 0 1.25rem', color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.5 }}>
              Assign official Bangladesh Air Force operators (NCOIC &amp; JCOIC), manage signing authority credentials, and execute secure appointment revocations with strict warnings.
            </p>

            {/* Quick Metrics */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                padding: '0.75rem',
                backgroundColor: 'var(--surface-hover)',
                borderRadius: '6px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>NCOIC Canteen:</span>
                <span style={{ fontWeight: 800, color: ncoic ? 'var(--baf-green)' : 'var(--baf-gold)' }}>
                  {ncoic ? `${ncoic.rank} ${ncoic.name} (${ncoic.bdNo})` : 'VACANT'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>JCOIC Canteen:</span>
                <span style={{ fontWeight: 800, color: jcoic ? 'var(--baf-green)' : 'var(--baf-gold)' }}>
                  {jcoic ? `${jcoic.rank} ${jcoic.name} (${jcoic.bdNo})` : 'VACANT'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigateToOperators();
            }}
          >
            <span>MANAGE DUTY APPOINTMENTS</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Security & Audit Protocol Summary Card */}
      <div className="room-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <ShieldAlert size={18} color="var(--baf-gold)" />
          <h4 style={{ margin: 0, fontSize: '1rem' }}>BAF RTS Canteen Operational Integrity Mandates</h4>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginTop: '0.75rem',
          }}
        >
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '6px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--baf-gold)', marginBottom: '0.2rem' }}>
              Historical Ledger Cascade
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Renaming a squadron preserves existing meal history by automatically cascading through recruit matrix expenses and pre-dues.
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '6px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--baf-gold)', marginBottom: '0.2rem' }}>
              Dual Occupancy Enforcement
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Strict single-operator slots per role prevent conflicting ledger edits between active NCOIC and JCOIC officers.
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '6px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--baf-gold)', marginBottom: '0.2rem' }}>
              Audit Trail Permanence
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              All daily room expense records and staff payments log the responsible operator&apos;s BD number in compliance with RTS financial standards.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
