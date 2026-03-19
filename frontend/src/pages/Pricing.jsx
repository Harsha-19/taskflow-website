import React, { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMySubscription, getToken, subscribeToPlan } from "../services/api";

const pricing = [
  {
    id: 1,
    name: "Starter",
    price: "$9",
    desc: "Great for solo founders and small teams getting started.",
    highlight: false,
  },
  {
    id: 2,
    name: "Pro",
    price: "$29",
    desc: "Best for growing teams that need automation and visibility.",
    highlight: true,
  },
  {
    id: 3,
    name: "Enterprise",
    price: "$99",
    desc: "For larger teams that need scale, control, and advanced workflows.",
    highlight: false,
  },
];

export default function Pricing() {
  const [activePlan, setActivePlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSubscription() {
      if (!getToken()) return;

      try {
        const subscription = await getMySubscription();
        console.log("plan:", subscription?.plan_id, typeof subscription?.plan_id);
        if (!cancelled) {
          setActivePlan(subscription?.plan_id != null ? Number(subscription.plan_id) : null);
        }
      } catch (error) {
        if (error?.status !== 401) {
          console.error("Failed to fetch subscription", error);
        }
      }
    }

    loadSubscription();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleChoosePlan(planId) {
    if (activePlan === planId) return;

    if (!getToken()) {
      alert("Please login first");
      return;
    }

    const previousPlan = activePlan;
    setActivePlan(planId);
    setLoadingPlan(planId);
    setMessage("");

    try {
      const response = await subscribeToPlan(planId);
      if (!response?.message) {
        throw new Error("Subscription update failed");
      }
      setMessage("Plan updated successfully");
    } catch (error) {
      setActivePlan(previousPlan);
      if (error?.status === 401) {
        return;
      }
      console.error("Failed to subscribe to plan", error);
      alert(error?.message || "Failed to subscribe");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Pricing
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
              Choose a plan that fits
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Start small, upgrade as your team grows.
            </p>
            {message && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
                {message}
              </div>
            )}
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {pricing.map((plan) => {
              const isActivePlan = activePlan === plan.id;
              const isUpdatingThisPlan = loadingPlan === plan.id;

              return (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 text-center transition ${
                  isActivePlan
                    ? "border-2 border-blue-600 bg-white shadow-xl scale-105 dark:bg-gray-900"
                    : "border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                }`}
                style={
                  isActivePlan
                    ? {
                        boxShadow: "0 0 0 2px rgb(37 99 235 / 0.35)",
                      }
                    : undefined
                }
              >
                {plan.highlight && (
                  <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                <p className="mt-4 text-5xl font-bold text-gray-900 dark:text-gray-100">{plan.price}</p>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{plan.desc}</p>

                <button
                  type="button"
                  onClick={() => handleChoosePlan(plan.id)}
                  disabled={isActivePlan || loadingPlan !== null}
                  className={`mt-8 w-full rounded-xl px-5 py-3 font-semibold transition ${
                    isActivePlan
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                  }`}
                  style={
                    isActivePlan || loadingPlan !== null
                      ? {
                          opacity: 0.6,
                          cursor: "not-allowed",
                          filter: "grayscale(0.2)",
                        }
                      : undefined
                  }
                >
                  {isUpdatingThisPlan
                    ? "Updating..."
                    : isActivePlan
                      ? "Current Plan"
                      : "Choose Plan"}
                </button>
              </div>
            )})}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

