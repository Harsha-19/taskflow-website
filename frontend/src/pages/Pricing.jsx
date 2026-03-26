import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

const pricingPlans = [
  {
    id: 1,
    name: "Starter",
    price: "$9",
    desc: "Great for solo founders and small teams getting started.",
    features: ["Up to 3 Projects", "Basic Task Tracking", "Email Support"],
  },
  {
    id: 2,
    name: "Pro",
    price: "$29",
    desc: "Best for growing teams that need automation and visibility.",
    features: ["Unlimited Projects", "Priority Support", "Advanced Analytics", "Custom Workflow"],
    highlight: true,
  },
  {
    id: 3,
    name: "Enterprise",
    price: "$99",
    desc: "For larger teams that need scale, control, and advanced workflows.",
    features: ["Dedicated Support", "SLA Guarantees", "Custom Integration", "Audit Logs"],
  },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [activePlanId, setActivePlanId] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  useEffect(() => {
    async function loadSubscription() {
      if (!isAuthenticated) return;
      try {
        const res = await api.subscriptions.getCurrent();
        setActivePlanId(res.data.subscription?.plan_id != null ? Number(res.data.subscription.plan_id) : null);
      } catch (error) {
        console.error("Failed to fetch subscription", error);
      }
    }
    loadSubscription();
  }, [isAuthenticated]);

  async function handleChoosePlan(planId) {
    if (!isAuthenticated) {
      toast.error("Please log in to choose a plan");
      return;
    }
    
    if (activePlanId === planId) return;

    setLoadingPlanId(planId);
    try {
      await api.subscriptions.subscribe(planId);
      setActivePlanId(planId);
      toast.success("Successfully upgraded your plan!");
    } catch (error) {
      toast.error(error.message || "Failed to upgrade");
    } finally {
      setLoadingPlanId(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 md:py-24 bg-gray-50 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-base font-semibold leading-7 text-indigo-600 uppercase tracking-widest">Pricing</h2>
            <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Scalable plans for teams of all sizes
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Transform your workflow with TaskFlow. Start for free and upgrade as you grow.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl p-8 shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-gray-900 ${
                  plan.highlight ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-950' : 'border border-gray-100 dark:border-gray-800'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 text-xs font-bold rounded-full uppercase">
                    Most Popular
                  </span>
                )}
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="mt-4 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">/month</span>
                  </p>
                  <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">{plan.desc}</p>
                </div>

                <ul className="flex-1 space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-400 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.176a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleChoosePlan(plan.id)}
                  disabled={activePlanId === plan.id || loadingPlanId !== null}
                  className={`mt-4 block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold leading-6 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
                    activePlanId === plan.id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                      : plan.highlight
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30'
                  }`}
                >
                  {loadingPlanId === plan.id
                    ? 'Processing...'
                    : activePlanId === plan.id
                      ? 'Current Plan'
                      : 'Get started today'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
