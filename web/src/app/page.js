"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import TypewriterText from "@/components/TypewriterText";

export default function HomePage() {
  const words = [
    "invoices",
    "letters",
    "certificates",
    "reports",
    "contracts",
    "receipts",
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Automate your <span className="text-blue-600">PDF</span> generation
            </h1>

            <div className="text-2xl lg:text-3xl text-gray-700 mb-8 h-12 flex items-center justify-center lg:justify-start">
              <span className="mr-3">We do</span>
              <TypewriterText
                words={words}
                className="text-blue-600 font-semibold"
                typingSpeed={50}
                deletingSpeed={50}
                pauseDuration={1500}
              />
            </div>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl">
              Design beautiful HTML templates with custom styling. Generate professional
              PDFs through our simple API. Perfect for invoices, letters, certificates,
              and more.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Placeholder for image */}
          <div className="flex-1 flex justify-center">
            <div className="w-96 h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-lg">
              <div className="text-center text-gray-600">
                <div className="text-6xl mb-4">📄</div>
                <p className="font-medium">Template → PDF</p>
                <p className="text-sm">Visual representation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-8 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Design Templates</h3>
            <p className="text-gray-600">
              Create beautiful HTML templates with custom CSS styling. Design invoices,
              letters, certificates, or any document you need.
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Get API Key</h3>
            <p className="text-gray-600">
              Sign up and get your unique API key. Use it to authenticate your requests
              and generate PDFs programmatically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Generate PDFs</h3>
            <p className="text-gray-600">
              Make API calls with your data and template ID. Receive high-quality PDFs
              ready for download or sharing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to start generating PDFs?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join developers who trust Templify for their PDF generation needs. Start
            creating professional documents today.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link href="/register">Start for Free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
