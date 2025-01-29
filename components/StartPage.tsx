"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import industries from "../public/data/industries.json";

type Industry = {
  name: string;
  alts: string;
};

export default function StartPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    url: "",
    industry: "",
    description: "",
  });
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save form data to localStorage
    localStorage.setItem("websiteUrl", formData.url);
    localStorage.setItem("businessName", formData.businessName);
    localStorage.setItem("industry", formData.industry);
    localStorage.setItem("description", formData.description);

    // Redirect directly to dashboard
    router.push("/dashboard");
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 shadow-xl">
        <div className="p-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            Business Information
          </h2>
          <p className="text-gray-500 mb-8">
            Enter your business details below to get started.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="businessName"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Enter your business name"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="url"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Website URL
              </label>
              <input
                id="url"
                name="url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="industry"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Website Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>
                  Select an industry
                </option>
                {industries.map((industry: Industry) => (
                  <option key={industry.name} value={industry.name}>
                    {industry.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Short Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Briefly describe your business"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              ></textarea>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-gray-50 hover:bg-gray-900/90 h-10 px-4 py-2 w-full"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
