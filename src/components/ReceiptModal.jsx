import React from 'react';
import { useErpStore } from '../store/useErpStore';
import { Printer, X, ShieldCheck, CheckCircle, Store, Copy } from 'lucide-react';

export default function ReceiptModal() {
  const { activeReceipt, setActiveReceipt } = useErpStore();

  if (!activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyCredentials = () => {
    const text = `
🛒 *DIGITAL CITY RECEIPT*
Receipt ID: ${activeReceipt.receiptId}
Product: ${activeReceipt.productName} (${activeReceipt.plan})
Account Email: ${activeReceipt.accountEmail}
Password: ${activeReceipt.accountPassword}
Household Code: ${activeReceipt.householdCode || 'N/A'}
Warranty Days: ${activeReceipt.warrantyDays} Days (Expires: ${activeReceipt.endDate})
Price Paid: ${((activeReceipt.sellingPrice || 0) - (activeReceipt.discount || 0)).toLocaleString()} MMK
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Receipt & Credentials copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print-bg">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 relative">
        
        {/* Top Action Bar (No Print) */}
        <div className="no-print p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Receipt Issued & Saved</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCredentials}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition"
              title="Copy for Client"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition shadow-md shadow-indigo-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            <button
              onClick={() => setActiveReceipt(null)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Slip Content (Print Target) */}
        <div className="p-6 bg-slate-900 text-slate-100 font-mono space-y-4 printable-slip">
          
          {/* Slip Header */}
          <div className="text-center border-b border-dashed border-slate-700 pb-4 space-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 mb-1">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">DIGITAL CITY</h2>
            <p className="text-xs text-slate-400">Digital Accounts & Subscription Retailer</p>
            <p className="text-[11px] text-slate-500 font-sans">Official Cashier Sales Voucher</p>
          </div>

          {/* Receipt Info */}
          <div className="text-xs space-y-1.5 border-b border-dashed border-slate-700 pb-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Receipt No:</span>
              <span className="text-indigo-400 font-bold">{activeReceipt.receiptId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Order Ref:</span>
              <span className="text-slate-300">{activeReceipt.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer:</span>
              <span className="text-white font-semibold">{activeReceipt.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date:</span>
              <span className="text-slate-300">{activeReceipt.startDate}</span>
            </div>
          </div>

          {/* Product Details */}
          <div className="text-xs space-y-2 border-b border-dashed border-slate-700 pb-4">
            <div className="font-bold text-white text-sm">{activeReceipt.productName}</div>
            <div className="flex justify-between text-slate-300">
              <span>Plan: {activeReceipt.plan}</span>
              <span>Category: {activeReceipt.category}</span>
            </div>

            {activeReceipt.householdCode && (
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Household Code:</span>
                <span className="text-amber-400 font-bold">{activeReceipt.householdCode}</span>
              </div>
            )}

            {/* Account Credentials Box */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Account Credentials</div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-indigo-300 font-bold select-all">{activeReceipt.accountEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Password:</span>
                <span className="text-emerald-300 font-bold select-all">{activeReceipt.accountPassword}</span>
              </div>
            </div>
          </div>

          {/* Warranty & Duration */}
          <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/20 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2 text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Warranty Days:</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-white">{activeReceipt.warrantyDays} Days</span>
              <p className="text-[10px] text-indigo-400">Valid until {activeReceipt.endDate}</p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="text-xs space-y-1.5 pt-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span>{(activeReceipt.sellingPrice || 0).toLocaleString()} MMK</span>
            </div>
            {activeReceipt.discount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Discount:</span>
                <span>-{(activeReceipt.discount || 0).toLocaleString()} MMK</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-white border-t border-slate-700 pt-2">
              <span>Total Paid:</span>
              <span className="text-emerald-400">
                {((activeReceipt.sellingPrice || 0) - (activeReceipt.discount || 0)).toLocaleString()} MMK
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[10px] text-slate-500 pt-3 border-t border-slate-800">
            Thank you for choosing Digital City! Keep this voucher for warranty claims.
          </div>

        </div>

      </div>
    </div>
  );
}
