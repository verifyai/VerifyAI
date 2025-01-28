'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { get } from 'idb-keyval';

export default function Dashboard() {
  const [screenshot, setScreenshot] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Load screenshot from IndexedDB
  const loadScreenshot = async () => {
    try {
      const storedScreenshot = await get('screenshot');
      if (storedScreenshot) setScreenshot(storedScreenshot);
    } catch (error) {
      console.error('Error loading screenshot from IndexedDB:', error);
    }
  };

  useEffect(() => {
    // Fetch screenshot and HTML content on component mount
    loadScreenshot();

    const storedHtmlContent = localStorage.getItem('htmlContent');
    if (storedHtmlContent) setHtmlContent(storedHtmlContent);

    const storedWebsiteUrl = localStorage.getItem('websiteUrl'); // Fetch website URL from localStorage
    if (storedWebsiteUrl) setWebsiteUrl(storedWebsiteUrl);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700 text-black">
      <div className="flex flex-row w-full max-w-6xl gap-4 p-6 bg-white shadow-lg rounded-xl">
        {/* Left Section */}
        <div className="flex-1 border rounded-lg p-4 bg-gray-100">
          <h2 className="text-xl font-semibold text-center mb-4 text-black">Website Preview</h2>
          <div className="h-[400px] w-full bg-white border-dashed border-2 border-gray-300 rounded-lg overflow-hidden relative">
            {screenshot ? (
              <div className="h-full w-full overflow-y-scroll">
                <Image
                  src={`data:image/png;base64,${screenshot}`}
                  alt="Website Screenshot"
                  width={400} // Adjust as needed
                  height={300} // Adjust as needed
                  className="w-full object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No Preview Available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col flex-1 gap-6">
          {/* Website Details */}
          <div className="p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold mb-2">Website Details</h3>
            <p className="text-sm">
              <span className="font-medium">Website URL:</span>{' '}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {websiteUrl}
                </a>
              )}
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Description:</span>
            </p>
          </div>

          {/* Progress */}
          <div className="p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold mb-4">Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-gray-400 rounded-full mr-2"></div>
                <p>Scanning Website</p>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-gray-400 rounded-full mr-2"></div>
                <p>Checking Restrictions</p>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-gray-400 rounded-full mr-2"></div>
                <p>Checking Compliance</p>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-gray-400 rounded-full mr-2"></div>
                <p>Scoring</p>
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="p-4 border rounded-lg bg-gray-100">
            <h3 className="text-lg font-semibold mb-4">Confidence Score</h3>
            <div className="space-y-3">
              {['Ownership', 'Certificates', 'Restrictions', 'Product Page'].map((item) => (
                <div key={item}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item}</span>
                  </div>
                  <div className="relative h-2 bg-gray-300 rounded-full">
                    <div className="absolute h-2 bg-purple-500 rounded-full w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-lg hover:bg-gray-600">
              Go Back
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-slate-950 rounded-lg hover:bg-blue-700">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
