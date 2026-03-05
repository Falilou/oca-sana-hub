'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';
import { LogoSection } from '@/components/common/LogoSection';
import { analyticsService } from '@/services/analyticsService';
import KPICard from '@/components/dashboard/KPICard';
import CountryUsageChart from '@/components/dashboard/CountryUsageChart';
import EnvironmentPieChart from '@/components/dashboard/EnvironmentPieChart';
import ActivityTimelineChart from '@/components/dashboard/ActivityTimelineChart';
import SSOAdoptionChart from '@/components/dashboard/SSOAdoptionChart';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attentionCustomers, setAttentionCustomers] = useState<Array<{
    customerId: string;
    errorCount: number;
    totalTransactions: number;
    errorRate: number;
    importantTransactions: number;
  }>>([]);
  const [attentionLoading, setAttentionLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Generate mock data if none exists (for demo purposes)
    analyticsService.generateMockData();

    const loadAttentionCustomers = async () => {
      try {
        const response = await fetch('/api/logs/analysis');
        const data = await response.json();
        if (data?.analysis?.customersNeedingAttention) {
          setAttentionCustomers(data.analysis.customersNeedingAttention);
        }
      } catch (error) {
        console.error('Failed to load attention customers:', error);
      } finally {
        setAttentionLoading(false);
      }
    };

    loadAttentionCustomers();
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  const metrics = analyticsService.getDashboardMetrics();
  const countryUsage = analyticsService.getCountryUsageData();
  const envDistribution = analyticsService.getEnvironmentDistribution();
  const activityTimeline = analyticsService.getActivityTimeline(7);
  const ssoAdoption = analyticsService.getSSOAdoptionData();
  const bcIntegration = analyticsService.getBCIntegrationStatus();
  const recentActivity = analyticsService.getRecentActivity(10);

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 px-6 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Executive Dashboard
            </h1>
            <p className="text-gray-400">
              Real-time insights and analytics for OCA Sana Hub
            </p>
            <div className="mt-4">
              <LogoSection size="md" />
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Portals"
              value={metrics.totalPortals}
              subtitle="Countries configured"
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <KPICard
              title="Active Portals"
              value={metrics.activePortals}
              subtitle="Recently accessed"
              color="green"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <KPICard
              title="Total Accesses"
              value={metrics.totalAccesses}
              subtitle="Portal visits"
              color="purple"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <KPICard
              title="Unique Users"
              value={metrics.uniqueUsers}
              subtitle="Active users"
              color="cyan"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="SSO Enabled"
              value={`${metrics.ssoEnabledCount}/${metrics.totalPortals}`}
              subtitle={`${Math.round((metrics.ssoEnabledCount / metrics.totalPortals) * 100)}% adoption`}
              color="orange"
            />
            <KPICard
              title="Business Central"
              value={`${bcIntegration.integrated}/${bcIntegration.total}`}
              subtitle={`${bcIntegration.percentage}% integrated`}
              color="green"
            />
            <KPICard
              title="Environments"
              value={`${metrics.prodEnvironments + metrics.indusEnvironments}`}
              subtitle={`${metrics.prodEnvironments} PROD + ${metrics.indusEnvironments} INDUS`}
              color="blue"
            />
          </div>

          {/* Customers Needing Attention */}
          <div className="mb-8 bg-slate-900/70 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Customers Needing Attention</h3>
                <p className="text-xs text-slate-400">High-value transactions with elevated error impact</p>
              </div>
            </div>
            {attentionLoading ? (
              <div className="text-sm text-slate-400">Loading customer signals...</div>
            ) : attentionCustomers.length === 0 ? (
              <div className="text-sm text-slate-400">No customer identifiers found in current logs.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attentionCustomers.slice(0, 6).map((customer) => (
                  <div key={customer.customerId} className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                    <div>
                      <div className="font-semibold text-white">{customer.customerId}</div>
                      <div className="text-xs text-slate-400">
                        {customer.importantTransactions} important · {customer.totalTransactions} total
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-semibold">{customer.errorCount} errors</div>
                      <div className="text-xs text-slate-400">{customer.errorRate.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Country Usage Chart */}
            <CountryUsageChart data={countryUsage} />

            {/* Environment Distribution */}
            <EnvironmentPieChart data={envDistribution} />
          </div>

          {/* Activity Timeline (Full Width) */}
          <div className="mb-8">
            <ActivityTimelineChart data={activityTimeline} />
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* SSO Adoption */}
            <SSOAdoptionChart data={ssoAdoption} />

            {/* Recent Activity */}
            <RecentActivity activities={recentActivity} />
          </div>

          {/* Export Button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => {
                const data = {
                  metrics,
                  countryUsage,
                  envDistribution,
                  activityTimeline,
                  ssoAdoption,
                  bcIntegration,
                  generatedAt: new Date().toISOString(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              📥 Export Dashboard Data
            </button>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
