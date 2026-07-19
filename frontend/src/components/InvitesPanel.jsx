import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { apiFetch } from '../api';

export default function InvitesPanel({ account, t, onInviteHandled }) {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    fetchInvites();
  }, [account]);

  const fetchInvites = async () => {
    try {
      const res = await apiFetch('/network/invites', {}, account);
      if (res.ok) setInvites(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const respond = async (inviteId, action) => {
    try {
      const res = await apiFetch(`/network/invites/${inviteId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      }, account);
      if (res.ok) {
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));
        onInviteHandled?.();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (invites.length === 0) return null;

  return (
    <div className="invites-panel">
      <div className="invites-header">
        <Bell size={18} />
        <span>{t.pendingInvites} ({invites.length})</span>
      </div>
      {invites.map((invite) => (
        <div key={invite.id} className="invite-card">
          <p>
            <strong>{invite.adminName}</strong> {t.inviteMessage}
          </p>
          <div className="invite-actions">
            <button className="btn-primary btn-sm" onClick={() => respond(invite.id, 'accept')}>
              <Check size={14} />
              {t.accept}
            </button>
            <button className="btn-secondary btn-sm" onClick={() => respond(invite.id, 'reject')}>
              <X size={14} />
              {t.decline}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
