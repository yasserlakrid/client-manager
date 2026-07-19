import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, BarChart2 } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekLabel(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return `W${Math.ceil(start.getDate() / 7)} ${start.toLocaleString('default', { month: 'short' })}`;
}

function getMonthLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('default', { month: 'short', year: '2-digit' });
}

function aggregatePayments(clients, mode) {
  const map = {};

  clients.forEach((client) => {
    const payments = client.payments || [];
    payments
      .filter((p) => p.status === 'Paid' && p.date)
      .forEach((p) => {
        let key;
        if (mode === 'days') key = p.date;
        else if (mode === 'weeks') key = getWeekLabel(p.date);
        else key = getMonthLabel(p.date);

        if (!map[key]) map[key] = { label: key, total: 0, count: 0 };
        map[key].total += Number(p.amount) || 0;
        map[key].count += 1;
      });
  });

  // Sort chronologically
  return Object.values(map).sort((a, b) => {
    if (mode === 'days') return new Date(a.label) - new Date(b.label);
    return a.label.localeCompare(b.label);
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '4px' }}>
          {label}
        </p>
        <p style={{ color: '#6366f1', fontWeight: '700', fontSize: '1rem' }}>
          {payload[0].value.toLocaleString()} DA
        </p>
        {payload[1] && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {payload[1].value} payments
          </p>
        )}
      </div>
    );
  }
  return null;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '12px',
          background: `${color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>
          {label}
        </p>
        <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.3rem' }}>
          {value}
        </p>
        {sub && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FinanceView({ clients, t }) {
  const [mode, setMode] = useState('days'); // 'days' | 'weeks' | 'months'
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'

  const data = useMemo(() => aggregatePayments(clients, mode), [clients, mode]);

  const totalRevenue = useMemo(
    () =>
      clients.reduce((acc, c) => {
        const paid = (c.payments || [])
          .filter((p) => p.status === 'Paid')
          .reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return acc + paid;
      }, 0),
    [clients]
  );

  const totalPayments = useMemo(
    () => clients.reduce((acc, c) => acc + (c.payments || []).filter((p) => p.status === 'Paid').length, 0),
    [clients]
  );

  const pendingRevenue = useMemo(
    () =>
      clients.reduce((acc, c) => {
        const pending = (c.payments || [])
          .filter((p) => p.status === 'Pending')
          .reduce((s, p) => s + (Number(p.amount) || 0), 0);
        return acc + pending;
      }, 0),
    [clients]
  );

  const avgPerPayment = totalPayments > 0 ? Math.round(totalRevenue / totalPayments) : 0;

  const TAB = [
    { key: 'days', label: t.daily },
    { key: 'weeks', label: t.weekly },
    { key: 'months', label: t.monthly },
  ];

  const CHART_TYPES = [
    { key: 'area', label: t.area },
    { key: 'bar', label: t.bar },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h2
          style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}
        >
          {t.financeOverview}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {t.financeSubtitle}
        </p>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <StatCard
          icon={DollarSign}
          label={t.totalRevenue}
          value={`${totalRevenue.toLocaleString()} DA`}
          sub={t.allPaidInvoices}
          color="#6366f1"
        />
        <StatCard
          icon={TrendingUp}
          label={t.avgPerPayment}
          value={`${avgPerPayment.toLocaleString()} DA`}
          sub={`${totalPayments} ${t.paymentsTotal}`}
          color="#10b981"
        />
        <StatCard
          icon={Calendar}
          label={t.pendingRevenue}
          value={`${pendingRevenue.toLocaleString()} DA`}
          sub={t.awaitingCollection}
          color="#f59e0b"
        />
        <StatCard
          icon={BarChart2}
          label={t.activePatients}
          value={clients.filter((c) => c.status === 'Active').length}
          sub={`${t.ofTotal} ${clients.length} ${t.total}`}
          color="#ec4899"
        />
      </div>

      {/* Chart Card */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '24px',
        }}
      >
        {/* Chart Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem' }}>
            {t.paymentTimeline}
          </h3>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Period toggle */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                padding: '4px',
                gap: '2px',
              }}
            >
              {TAB.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: mode === key ? '#6366f1' : 'transparent',
                    color: mode === key ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Chart type toggle */}
            <div
              style={{
                display: 'flex',
                background: 'var(--bg-secondary)',
                borderRadius: '10px',
                padding: '4px',
                gap: '2px',
              }}
            >
              {['area', 'bar'].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: chartType === type ? '#6366f1' : 'transparent',
                    color: chartType === type ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                  }}
                >
                  {type === 'area' ? t.area : t.bar}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        {data.length === 0 ? (
          <div
            style={{
              height: 320,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            {t.noPaymentData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue (DA)"
                />
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} name="Revenue (DA)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Per-patient breakdown */}
      {clients.length > 0 && (
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            marginTop: '20px',
          }}
        >
          <h3
            style={{
              color: 'var(--text-primary)',
              fontWeight: '700',
              fontSize: '1rem',
              marginBottom: '16px',
            }}
          >
            {t.perPatientRevenue}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...clients]
              .map((c) => ({
                name: c.name,
                paid: (c.payments || [])
                  .filter((p) => p.status === 'Paid')
                  .reduce((s, p) => s + (Number(p.amount) || 0), 0),
              }))
              .filter((c) => c.paid > 0)
              .sort((a, b) => b.paid - a.paid)
              .map(({ name, paid }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.85rem',
                      width: 140,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {name}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: 'var(--bg-secondary)',
                      borderRadius: 99,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (paid / totalRevenue) * 100)}%`,
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        borderRadius: 99,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      width: 100,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {paid.toLocaleString()} DA
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
