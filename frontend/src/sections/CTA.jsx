import React from 'react';

const CTA = () => {
  return (
    <section className="bg-blue-600 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Start managing your work today
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join over 10,000 teams using TaskFlow to supercharge their productivity with AI-driven workflows.
        </p>
        <button className="bg-white hover:bg-gray-100 text-blue-600 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-blue-300 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
          Get Started Now
        </button>
      </div>
    </section>
  );
};

export default CTA;
