'use client';

import { useState } from 'react';
import CampaignForm from '../components/CampaignForm';
import CampaignOptimizer from '../components/CampaignOptimizer';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'generate' | 'optimize'>('generate');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hotel Marketing Campaign Manager
          </h1>
          <p className="text-lg text-gray-600">
            Generate and optimize your hotel marketing campaigns with AI
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('generate')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'generate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Generate Campaign
              </button>
              <button
                onClick={() => setActiveTab('optimize')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'optimize'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Optimize Campaign
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'generate' ? <CampaignForm /> : <CampaignOptimizer />}
          </div>
        </div>
      </div>
    </main>
  );
}
