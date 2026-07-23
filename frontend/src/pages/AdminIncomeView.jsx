import React, { useState, useEffect } from 'react';
import { DollarSign, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '../api';
  import { useMemo } from "react";

import BarChartDisplay from '../components/Barchart';
export default function AdminIncomeView({ account, t }) {
  const [incomeData, setIncomeData] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncome();
  }, []);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/income', {}, account);
      if (res.ok) setIncomeData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


const data = useMemo(() => {
  const days = Array.from({ length: 8 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);

    return {
      name: date.toISOString().split("T")[0]
    };
  });

  days.forEach(day => {
    for (const [, client] of Object.entries(incomeData)) {
      client.payments.forEach(payment => {
        if (payment.date.slice(0, 10) === day.name) {
          day[client.coworkerName] =
            (day[client.coworkerName] || 0) +
            Number(payment.amount);
        }
      });
    }
  });

  return days.reverse();
}, [incomeData]);

  const coworkers = Object.entries(incomeData);
  const grandTotal = coworkers.reduce((sum, [, data]) => sum + (Number(data.totalIncome) || 0), 0);

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>{t.loading}</p>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{t.adminIncomeTitle}</h1>
        <p>{t.adminIncomeSubtitle}</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <p className="stat-label">{t.totalNetworkIncome}</p>
            <p className="stat-value">{grandTotal.toLocaleString()} DA</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
            <Users size={22} />
          </div>
          <div>
            <p className="stat-label">{t.trackedCoworkers}</p>
            <p className="stat-value">{coworkers.length}</p>
          </div>
        </div>
      </div>

      {coworkers.length === 0 ? (
        <div className="card">
          <p style={{ color: 'var(--text-muted)' }}>{t.noIncomeData}</p>
        </div>
      ) : (
        coworkers.map(([coworkerId, data]) => (
          <div key={coworkerId} className="card" style={{ marginBottom: '16px' }}>
            <div
              className="income-coworker-header"
              onClick={() => setExpandedId(expandedId === coworkerId ? null : coworkerId)}
            >
              <div>
                <h3>{data.coworkerName}</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {data.coworkerEmail}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="income-total">{(Number(data.totalIncome) || 0).toLocaleString()} DA</span>
                {expandedId === coworkerId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedId === coworkerId && (
              <div className="income-timeline">
                {(data.payments || []).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', padding: '12px 0' }}>{t.noPaymentsYet}</p>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t.transactionDate}</th>
                        <th>{t.patient}</th>
                        <th>{t.receiptNo}</th>
                        <th>{t.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payments.map((p) => (
                        <tr key={p.id}>
                          <td>{p.date.slice(0, 10)}</td>
                          <td>{p.clientName}</td>
                          <td>{p.receiptNumber}</td>
                          <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                            +{Number(p.amount).toLocaleString()} DA
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))
      )}
      
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' , flexDirection: 'column', alignItems: 'center'}}>
      <h2>{t.adminIncomeweek}</h2>
      <BarChartDisplay data = {data}/>
      </div>
    </div>
  );
}
