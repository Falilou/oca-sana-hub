'use client';

import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';
import { PortalGrid } from '@/components/portals/PortalGrid';
import { PortalModal } from '@/components/common/PortalModal';
import { LogoSection } from '@/components/common/LogoSection';
import { PortalInfo } from '@/types';
import { useState } from 'react';
import { useUserStory } from '@/hooks/useUserStory';

export default function Home() {
  const [selectedPortal, setSelectedPortal] = useState<PortalInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEnv, setCurrentEnv] = useState<'PROD' | 'INDUS'>('PROD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { logPrompt } = useUserStory({ environment: currentEnv });

  const handlePortalSelect = (portal: PortalInfo) => {
    setSelectedPortal(portal);
    setIsModalOpen(true);

    // Log the portal selection as a user story
    logPrompt(
      `Access ${portal.name}`,
      `User accessed the ${portal.name} (${portal.countryCode})`,
      `User selected to navigate to ${portal.name} in ${currentEnv} environment`,
      {
        severity: 'medium',
        tags: ['portal-access', 'user-action'],
        metadata: {
          portalCountry: portal.country,
          portalCountryCode: portal.countryCode,
        },
      }
    );
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEnvironmentChange = (env: 'PROD' | 'INDUS') => {
    setCurrentEnv(env);
    logPrompt(
      `Environment Switched`,
      `User switched environment to ${env}`,
      `User changed from ${currentEnv} to ${env} environment`,
      {
        severity: 'low',
        tags: ['environment-switch'],
        metadata: {
          previousEnv: currentEnv,
          newEnv: env,
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header 
          onEnvironmentChange={handleEnvironmentChange} 
          currentEnvironment={currentEnv}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 px-6 py-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Available Portals</h2>
            <p className="text-gray-400">Select a country portal to access the e-ordering system</p>
            <div className="mt-4">
              <LogoSection size="md" />
            </div>
          </div>

          {/* Portals Section */}
          <div className="mb-6">
            <PortalGrid onPortalSelect={handlePortalSelect} environment={currentEnv} />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Portal Details Modal */}
      <PortalModal
        portal={selectedPortal}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        environment={currentEnv}
      />
    </div>
  );
}
