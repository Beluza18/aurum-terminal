'use client';

import { useState } from 'react';
import BottomNavBar from '../components/BottomNavBar';
import { toast } from 'sonner';

export default function RiskPage() {
  const [balance, setBalance] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1');
  const [entry, setEntry] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');

  const entryNum = parseFloat(entry);
  const slNum = parseFloat(stopLoss);
  const tpNum = parseFloat(takeProfit);
  const balanceNum = parseFloat(balance);
  const riskNum = parseFloat(riskPercent);

  const riskPerUnit = entryNum && slNum ? Math.abs(entryNum - slNum) : 0;
  const rewardPerUnit = entryNum && tpNum ? Math.abs(tpNum - entryNum) : 0;
  const rrRatio = riskPerUnit > 0 ? (rewardPerUnit / riskPerUnit).toFixed(2) : '0.00';
  
  const riskAmount = balanceNum && riskNum ? (balanceNum * (riskNum / 100)) : 0;
  const positionSize = riskPerUnit > 0 ? (riskAmount / riskPerUnit).toFixed(2) : '0.00';

  const validateTrade = () => {
    if (parseFloat(rrRatio) < 1.5) {
      toast.error('Poor Risk/Reward', { description: 'R:R is below 1:1.5. Consider skipping.' });
    } else {
      toast.success('Trade Validated', { description: `R:R 1:${rrRatio} | Size: ${positionSize}` });
    }
  };

  const inputClass = "input-neu";

  return (
    <div className="mobile-container px-6 pt-8 pb-32">
      <h1 className="font-hister text-primary mb-6">Pre-Trade Risk Calculator</h1>
      
      <div className="bg-surface rounded-card p-5 shadow-elev-2 mb-6">
        <h3 className="font-medium text-primary mb-4">⚖️ Position Sizing</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-caption-sm text-secondary mb-2 block">Balance ($)</label>
            <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="font-caption-sm text-secondary mb-2 block">Risk (%)</label>
            <input type="number" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div>
            <label className="font-caption-sm text-secondary mb-2 block">Entry</label>
            <input type="number" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="4520" className={inputClass} />
          </div>
          <div>
            <label className="font-caption-sm text-secondary mb-2 block">Stop Loss</label>
            <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="4510" className={inputClass} />
          </div>
          <div>
            <label className="font-caption-sm text-secondary mb-2 block">Take Profit</label>
            <input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} placeholder="4550" className={inputClass} />
          </div>
        </div>

        <button onClick={validateTrade} className="btn-primary w-full mb-6">
          Validate Trade
        </button>

        <div className="bg-canvas rounded-card p-5 shadow-elev-1">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-caption-sm text-secondary mb-1">Risk : Reward</p>
              <p className={`font-hister font-bold ${parseFloat(rrRatio) >= 2 ? 'text-primary' : parseFloat(rrRatio) < 1.5 ? 'text-[#f0b0b0]' : 'text-[#f0e4a0]'}`}>
                1 : {rrRatio}
              </p>
            </div>
            <div>
              <p className="font-caption-sm text-secondary mb-1">Risk Amount</p>
              <p className="font-hister font-bold text-primary">${riskAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-caption-sm text-secondary mb-1">Position Size</p>
              <p className="font-hister font-bold text-[#00CFCC]">{positionSize}</p>
            </div>
          </div>
          
          {parseFloat(rrRatio) < 1.5 && entryNum > 0 && (
            <div className="mt-4 p-4 rounded-card bg-[#f0b0b0] shadow-elev-1">
              <p className="font-caption-sm text-[#1a1a1a] text-center font-semibold">
                ⚠️ R:R below 1:1.5 - Skip this trade
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}