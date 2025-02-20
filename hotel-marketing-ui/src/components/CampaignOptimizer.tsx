'use client';

import { useState } from 'react';
import api, { CampaignMetrics, OptimizationResult } from '../services/api';

export default function CampaignOptimizer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [metrics, setMetrics] = useState<CampaignMetrics>({
    CTR: 0,
    ROAS: 0,
    currentBid: 0,
    currentBudget: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const optimizationResult = await api.optimizeCampaign(metrics);
      setResult(optimizationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Campaign Optimization</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Click-Through Rate (%)</label>
          <input
            type="number"
            name="CTR"
            value={metrics.CTR}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            max="100"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Return on Ad Spend (%)</label>
          <input
            type="number"
            name="ROAS"
            value={metrics.ROAS}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Current Bid ($)</label>
          <input
            type="number"
            name="currentBid"
            value={metrics.currentBid}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Current Daily Budget ($)</label>
          <input
            type="number"
            name="currentBudget"
            value={metrics.currentBudget}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Optimizing...' : 'Get Optimization Recommendations'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Optimization Results</h2>
          
          <div className="space-y-4">
            <div>
              <span className="font-medium">Recommended Action:</span>
              <span className="ml-2 text-blue-600 capitalize">{result.action}</span>
            </div>

            {result.newBid && (
              <div>
                <span className="font-medium">New Recommended Bid:</span>
                <span className="ml-2">${result.newBid.toFixed(2)}</span>
              </div>
            )}

            {result.newBudget && (
              <div>
                <span className="font-medium">New Recommended Budget:</span>
                <span className="ml-2">${result.newBudget.toFixed(2)}</span>
              </div>
            )}

            {result.message && (
              <div className="text-gray-600 mt-2">
                {result.message}
              </div>
            )}

            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Current CTR:</span>
                <span className="ml-2">{result.CTR.toFixed(2)}%</span>
              </div>
              <div>
                <span className="font-medium">Current ROAS:</span>
                <span className="ml-2">{result.ROAS.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 