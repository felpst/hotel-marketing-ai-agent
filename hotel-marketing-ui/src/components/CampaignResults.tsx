'use client';

interface CampaignData {
  keywords: string[];
  adCopies: {
    headline: string;
    body: string;
  }[];
  audiences: string[];
  dailyBudget: number;
}

interface CampaignResultsProps {
  data: CampaignData | null;
}

export default function CampaignResults({ data }: CampaignResultsProps) {
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Keywords Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Keywords</h2>
        <div className="flex flex-wrap gap-2">
          {data.keywords.map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>

      {/* Ad Copies Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ad Copies</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {data.adCopies.map((ad, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-medium text-lg text-gray-900 mb-2">{ad.headline}</h3>
              <p className="text-gray-600">{ad.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Audience Segments Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Audience Segments</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {data.audiences.map((audience, index) => (
            <li
              key={index}
              className="flex items-center space-x-2 text-gray-700"
            >
              <svg
                className="h-5 w-5 text-indigo-500"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
              <span>{audience}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Daily Budget Section */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Daily Budget</h2>
        <div className="text-3xl font-bold text-indigo-600">
          ${data.dailyBudget.toFixed(2)}
        </div>
      </section>
    </div>
  );
} 