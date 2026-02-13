import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, FileDown, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';

/**
 * DocketPrint Component
 * High-fidelity docket view optimized for both screen and A4 printing/PDF.
 */
export default function DocketPrint({ docket, onClose, standalone = false }) {
  const formatUnit = (amount, unit) => {
    const u = unit || 'm³';
    if (u === 'tonne') return amount === 1 ? 'tonne' : 'tonnes';
    return u;
  };
  const docketRef = useRef(null);

  const waitForImages = async (element) => {
    if (!element) return;
    const images = Array.from(element.getElementsByTagName('img'));
    await Promise.all(images.map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
  };

  const handlePrintTrigger = useReactToPrint({
    contentRef: docketRef,
    documentTitle: docket ? `Docket_${docket.docketNumber || 'Report'}` : 'Docket_Report',
    onBeforePrint: async () => {
      await waitForImages(docketRef.current);
      // Small delay for layout stability
      await new Promise(resolve => setTimeout(resolve, 500));
    },
  });

  const handlePrint = () => {
    handlePrintTrigger();
  };

  // Map PDF download to the same print trigger (browser print dialog handles PDF)
  const handleDownloadPDF = () => {
    handlePrintTrigger();
  };

  useEffect(() => {
    if (standalone && docket) {
      const timer = setTimeout(() => {
        handlePrintTrigger();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [standalone, docket, handlePrintTrigger]);

  if (!docket) return null;

  const startDate = docket.startDate ? new Date(docket.startDate).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
  const endDate = docket.endDate ? new Date(docket.endDate).toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';

  return (
    <>
      <style>{`
        /* --- PRINT STYLES --- */
        @media print {
          @page {
            size: A4;
            margin: 0mm !important;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ensure all content is visible and height is natural */
          #root, .min-h-screen {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          #print-root {
            position: static !important;
            background: white !important;
            display: block !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          #docket-print-wrapper {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            position: relative !important;
            box-sizing: border-box !important;
            visibility: visible !important;
            break-after: always;
          }
        }

        /* --- SCREEN ONLY UI --- */
        #docket-print-wrapper {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #1a1f3a;
          line-height: 1.5;
        }

        .docket-table {
          width: 100%;
          border-collapse: collapse;
        }

        .docket-table th {
          background-color: #f8fafc;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 10px;
          border-bottom: 2px solid #e2e8f0;
          text-align: left;
        }

        .docket-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 11px;
          color: #1a1f3a;
        }

        .signature-cell img {
          max-height: 35px;
          mix-blend-mode: multiply;
        }
      `}</style>

      {/* Main Wrapper */}
      <div id="print-root" className={standalone ? "min-h-screen bg-[#f1f5f9] no-print py-10" : "fixed inset-0 bg-navy-950/95 backdrop-blur-xl z-[200] overflow-y-auto py-10 flex flex-col items-center"}>

        {/* Buttons (Hidden when printing) */}
        <div className="fixed top-6 right-10 flex gap-2 z-[250] no-print">
          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-1.5 rounded-lg bg-white text-navy-950 border border-slate-200 font-bold text-[10px] hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <FileDown size={12} />
            PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-navy-950 font-black text-[10px] hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
          >
            <Printer size={12} /> Print
          </button>
          {!standalone && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Paper (A4 Canvas) */}
        <div className="w-full flex justify-center px-4">
          <div
            id="docket-print-wrapper"
            ref={docketRef}
            className="bg-white shadow-2xl w-[210mm] min-h-[297mm] p-[15mm] box-border relative"
          >
            <div className="flex justify-between items-start mb-12">
              <div>
                <img
                  src="/Flowrite-Brandmark-WHITE.png"
                  alt="Logo"
                  className="h-12 mb-4 brightness-0"
                  crossOrigin="anonymous"
                />
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] leading-relaxed">
                  Flowrite Group Pty Ltd<br />
                  ACN: 632 294 869
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  Official Record
                </div>
                <h1 className="text-4xl font-black text-navy-950 tracking-tighter mb-1 uppercase">
                  {docket.docketNumber}
                </h1>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Issued: {new Date(docket.createdAt || Date.now()).toLocaleDateString('en-AU')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-12">
              <div className="border-l-4 border-amber-500 pl-6 py-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Customer Details</p>
                <h2 className="text-2xl font-black text-navy-950 tracking-tight leading-none mb-3">{docket.customer}</h2>
                <div className="text-xs text-slate-500 font-semibold space-y-1">
                  {docket.customerInfo?.address && <div>{docket.customerInfo.address}</div>}
                  {docket.customerInfo?.email && <div>{docket.customerInfo.email}</div>}
                  {docket.customerInfo?.phone && <div>{docket.customerInfo.phone}</div>}
                </div>
              </div>
              <div className="bg-slate-50 rounded-[24px] p-8 flex flex-col justify-center">
                <div className="flex justify-between items-end mb-4 border-b border-slate-200 pb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporting Period</span>
                  <span className="text-xs font-bold text-navy-950 uppercase">{startDate} — {endDate}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Qty</span>
                  <span className="text-3xl font-black text-amber-500 tracking-tighter">{(docket.totalAmount || 0).toFixed(2)} <span className="text-sm font-bold">{formatUnit(docket.totalAmount, docket.submissions?.[0]?.unit)}</span></span>
                </div>
              </div>
            </div>

            <table className="docket-table mb-12">
              <thead>
                <tr>
                  <th className="w-24">Date</th>
                  <th>Material / Order</th>
                  <th className="w-24 text-center">Rego</th>
                  <th>Site Address</th>
                  <th className="w-24 text-right">Qty</th>
                  <th className="w-28 text-center">Signature</th>
                </tr>
              </thead>
              <tbody>
                {docket.submissions?.map((sub, i) => (
                  <tr key={i}>
                    <td className="font-bold">{sub.date}</td>
                    <td className="font-bold text-navy-900">{sub.order}</td>
                    <td className="text-center font-mono text-xs">{sub.rego}</td>
                    <td className="text-slate-500 py-4 leading-tight">{sub.address}</td>
                    <td className="text-right font-black text-navy-950">{(sub.amount || 0).toFixed(2)} <span className="text-[9px] font-bold text-slate-400">{formatUnit(sub.amount, sub.unit)}</span></td>
                    <td className="text-center signature-cell">
                      {sub.signature ? (
                        <img
                          src={sub.signature}
                          alt="Sign"
                          className="mx-auto"
                          crossOrigin="anonymous"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">No signature</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-10 border-t-4 border-navy-950 mt-auto">
              <div className="w-72">
                <div className="flex justify-between py-5 items-center">
                  <span className="text-sm font-black text-navy-950 uppercase tracking-[0.2em]">Total Quantity</span>
                  <span className="text-4xl font-black text-amber-500 tracking-tighter">{(docket.totalAmount || 0).toFixed(2)} <span className="text-sm font-bold">{formatUnit(docket.totalAmount, docket.submissions?.[0]?.unit)}</span></span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[15mm] left-[15mm] right-[15mm]">
              <div className="flex justify-between items-end border-t border-slate-100 pt-8">
                <div className="space-y-4">
                  <div className="w-64 h-px bg-slate-300" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Official Record</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Generated by Flowrite Systems</p>
                  <p className="text-[11px] font-bold text-slate-400">{new Date().toLocaleDateString('en-AU')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
