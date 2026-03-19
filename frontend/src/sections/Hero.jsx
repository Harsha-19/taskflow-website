import React from 'react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-blue-600 font-semibold mb-4 tracking-wide text-sm uppercase">
          New: AI-Powered Workflows
        </p>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          Manage your work faster with AI
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          TaskFlow combines project management with advanced AI productivity tools to help you and your team deliver results faster than ever.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl w-full sm:w-auto">
            Start Free Trial
          </button>
          <button className="border-2 border-gray-200 hover:border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all w-full sm:w-auto">
            View Demo
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
