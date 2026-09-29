import React from 'react';
import { usePoaStay } from '../../context/PoaStayContext';
import { X, MessageSquare, Smartphone, Bell, CheckCircle2, Clock } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { notifications } = usePoaStay();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">WhatsApp & SMS Live Dispatch</h3>
              <p className="text-[11px] text-stone-500">Automated Kenyan guest & staff notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No recent alerts dispatched</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Notifications will appear here when you book stays, trigger M-Pesa STK prompts, or assign duties.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {notif.channel === 'whatsapp' ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        WhatsApp
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-amber-600" />
                        SMS Gateway
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-stone-800 truncate max-w-[140px]">
                      {notif.recipientName}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400">{notif.timestamp.split(' ')[1] || notif.timestamp}</span>
                </div>

                <p className="text-stone-700 text-xs leading-relaxed bg-white p-2.5 rounded-xl border border-stone-200/70 font-sans">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between text-[10px] text-stone-400">
                  <span className="font-mono">{notif.recipientPhone}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Delivered
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-200 bg-stone-50 text-[11px] text-stone-500 text-center">
          Integrated with Safaricom SMS Gateway & WhatsApp Business API
        </div>
      </div>
    </div>
  );
};
