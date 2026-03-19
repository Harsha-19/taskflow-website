import React from 'react';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      description: 'Ideal for individuals and small projects.',
      features: ['Basic AI assistance', 'Up to 5 projects', 'Community support'],
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'Best for growing teams and professionals.',
      features: ['Advanced AI models', 'Unlimited projects', 'Priority support', 'Team collaboration'],
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      description: 'Custom solutions for large organizations.',
      features: ['Dedicated AI infrastructure', 'SSO & Security', '24/7 Premium support', 'Custom integrations'],
      highlight: false,
    },
  ];

  return (
    <section className="py-20 bg-gray-50 px-6 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Choose the plan that's right for your business</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-8 transition-all dark:bg-gray-800 ${
                plan.highlight
                  ? 'ring-4 ring-blue-600 shadow-2xl scale-105 z-10'
                  : 'shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</span>
                <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {plan.description}
              </p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 min-w-[20px] min-h-[20px] text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100'
                }`}
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
