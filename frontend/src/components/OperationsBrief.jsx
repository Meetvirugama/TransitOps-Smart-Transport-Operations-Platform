import { useState } from 'react';
import api from '../config/api';

const RISK_CONFIG = {
  Low:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  glow: '0 0 20px rgba(34,197,94,0.3)',  icon: '🟢', bar: '#22c55e' },
  Medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', glow: '0 0 20px rgba(245,158,11,0.3)', icon: '🟡', bar: '#f59e0b' },
  High:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', glow: '0 0 20px rgba(249,115,22,0.3)', icon: '🟠', bar: '#f97316' },
  Critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  glow: '0 0 20px rgba(239,68,68,0.4)',  icon: '🔴', bar: '#ef4444' },
};

function RiskGauge({ score, level }) {
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.Medium;
  const pct = (score / 10) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        position: 'relative',
        width: 120,
        height: 120,
        margin: '0 auto 12px',
      }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Background arc */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          {/* Score arc */}
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke={cfg.color}
            strokeWidth="10"
            strokeDasharray={`${(pct / 100) * 314} 314`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ filter: `drop-shadow(0 0 6px ${cfg.color})`, transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>/ 10</div>
        </div>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: cfg.bg,
        border: `1px solid ${cfg.color}40`,
        borderRadius: 20, padding: '4px 14px',
        boxShadow: cfg.glow,
      }}>
        <span>{cfg.icon}</span>
        <span style={{ color: cfg.color, fontWeight: 700, fontSize: 13 }}>{level} Risk</span>
      </div>
    </div>
  );
}

function FlagChip({ text, severity }) {
  const colors = {
    High:   { bg: 'rgba(239,68,68,0.15)',   border: '#ef444450', text: '#fca5a5' },
    Medium: { bg: 'rgba(245,158,11,0.15)',  border: '#f59e0b50', text: '#fcd34d' },
    Low:    { bg: 'rgba(99,102,241,0.15)',  border: '#6366f150', text: '#a5b4fc' },
  };
  const c = colors[severity] || colors.Low;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 8, padding: '5px 12px',
      color: c.text, fontSize: 12, fontWeight: 500,
    }}>
      {text}
    </div>
  );
}

function PipelineStep({ label, model, active, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? 'rgba(34,197,94,0.2)' : active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
        border: `2px solid ${done ? '#22c55e' : active ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
        transition: 'all 0.4s ease',
        boxShadow: active ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
      }}>
        {done ? '✓' : active ? (
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: '#6366f1',
            animation: 'pulse 1s infinite',
          }} />
        ) : '○'}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: done ? '#22c55e' : active ? '#a5b4fc' : 'rgba(255,255,255,0.4)' }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{model}</div>
      </div>
    </div>
  );
}

export default function OperationsBrief() {
  const [brief, setBrief]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage]     = useState(0); // 0=idle, 1=groq, 2=gemini, 3=done
  const [error, setError]     = useState('');

  async function generateBrief() {
    setLoading(true);
    setError('');
    setBrief(null);
    setStage(1);

    try {
      // Simulate pipeline stages visually
      setTimeout(() => setStage(2), 2500);
      const { data } = await api.get('/ai/operations-brief');
      setStage(3);
      setBrief(data); // 'data' is the response data, which might have { success: true, data: ... }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate brief. Check your API keys and try again.');
      setStage(0);
    } finally {
      setLoading(false);
    }
  }

  const riskCfg = brief ? (RISK_CONFIG[brief.groq?.riskLevel] || RISK_CONFIG.Medium) : null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(20,20,50,0.95) 100%)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 20,
      padding: 28,
      marginTop: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🧠</span>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
              Operations Intelligence Brief
            </h3>
          </div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'linear-gradient(90deg, #f97316, #ef4444)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontWeight: 700, fontSize: 11, letterSpacing: 0.5,
            }}>GROQ</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>×</span>
            <span style={{
              background: 'linear-gradient(90deg, #4f9ef8, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontWeight: 700, fontSize: 11, letterSpacing: 0.5,
            }}>GEMINI</span>
            <span style={{
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 6, padding: '1px 8px',
              color: '#a5b4fc', fontSize: 10, fontWeight: 600,
            }}>DUAL-AI PIPELINE</span>
          </div>
        </div>

        <button
          id="generate-ops-brief-btn"
          onClick={generateBrief}
          disabled={loading}
          style={{
            background: loading
              ? 'rgba(99,102,241,0.2)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', borderRadius: 12, padding: '10px 22px',
            color: '#fff', fontWeight: 700, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
            transition: 'all 0.3s ease',
            display: 'flex', alignItems: 'center', gap: 8,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Analyzing...
            </>
          ) : (
            <>⚡ Generate Brief</>
          )}
        </button>
      </div>

      {/* Pipeline loading state */}
      {loading && (
        <div style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 14, padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14, fontWeight: 600, letterSpacing: 1 }}>
            AI PIPELINE RUNNING
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <PipelineStep label="Risk Analysis" model="Groq · Llama 3.3 70B" active={stage === 1} done={stage >= 2} />
            <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.1)', marginLeft: 15 }} />
            <PipelineStep label="Narrative Generation" model="Gemini 2.5 Flash" active={stage === 2} done={stage >= 3} />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 16,
          color: '#fca5a5', fontSize: 13,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {brief && (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>

          {/* Top row: risk gauge + flags */}
          <div style={{
            display: 'grid', gridTemplateColumns: '160px 1fr',
            gap: 20, marginBottom: 20,
          }}>
            {/* Gauge */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${riskCfg.color}30`,
              borderRadius: 16, padding: 20,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              boxShadow: riskCfg.glow,
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>
                GROQ RISK SCORE
              </div>
              <RiskGauge score={brief.groq.riskScore} level={brief.groq.riskLevel} />
              <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Utilization: <span style={{ color: '#fff', fontWeight: 600 }}>{brief.groq.utilization}%</span>
              </div>
            </div>

            {/* Flags and risks */}
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>
                GROQ FLAGS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {brief.groq.flags.map((flag, i) => (
                  <div key={i} style={{
                    background: 'rgba(99,102,241,0.12)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: 8, padding: '5px 12px',
                    color: '#c7d2fe', fontSize: 12,
                  }}>
                    🏷 {flag}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>
                RISK BREAKDOWN
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {brief.groq.risks.slice(0, 3).map((risk, i) => (
                  <FlagChip key={i} text={`${risk.category}: ${risk.description}`} severity={risk.severity} />
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
            margin: '20px 0',
          }} />

          {/* Gemini narrative */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(79,158,248,0.2), rgba(167,139,250,0.2))',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: 8, padding: '3px 10px',
                fontSize: 10, color: '#c4b5fd', fontWeight: 700, letterSpacing: 1,
              }}>
                GEMINI NARRATIVE
              </div>
            </div>
            <p style={{
              margin: 0, fontSize: 14, lineHeight: 1.7,
              color: 'rgba(255,255,255,0.85)',
              background: 'rgba(167,139,250,0.05)',
              border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: 12, padding: '14px 18px',
            }}>
              {brief.gemini.narrative}
            </p>
          </div>

          {/* Action items */}
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 12, fontWeight: 600 }}>
              GEMINI ACTION ITEMS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {brief.gemini.actionItems.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '12px 16px',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top priority callout */}
          {brief.groq.topPriority && (
            <div style={{
              marginTop: 16,
              background: `${riskCfg.bg}`,
              border: `1px solid ${riskCfg.color}40`,
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <div>
                <div style={{ fontSize: 10, color: riskCfg.color, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>
                  GROQ TOP PRIORITY
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                  {brief.groq.topPriority}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: 16, paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              Generated {new Date(brief.generatedAt).toLocaleTimeString()} · Groq key #{brief.groq.keyUsed}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#fb923c', fontWeight: 600,
              }}>Groq · {brief.groq.model}</span>
              <span style={{
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#a5b4fc', fontWeight: 600,
              }}>Gemini · {brief.gemini.model}</span>
            </div>
          </div>
        </div>
      )}

      {/* Idle state */}
      {!brief && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 6 }}>
            No brief generated yet
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            Click <strong style={{ color: 'rgba(255,255,255,0.5)' }}>⚡ Generate Brief</strong> to run the dual-AI pipeline
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>⚡</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Groq analyzes risk</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>✍️</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Gemini writes brief</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 18 }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>📋</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>You get actions</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
