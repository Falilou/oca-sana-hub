'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { Footer } from '@/components/common/Footer';
import { getEnvironmentConfig, Country } from '@/config/environments';
import { CustomCountry } from '@/types';
import Link from 'next/link';

const COUNTRIES: Country[] = [
  'colombia',
  'australia',
  'morocco',
  'chile',
  'argentina',
  'vietnam',
  'southAfrica',
  'malaysia',
  'southKorea'
];

interface PortalUrls {
  [key: string]: {
    PROD: {
      public: string;
      admin: string;
      ssoAdminEnabled: boolean;
      ssoSalesforceEnabled: boolean;
      sanaVersion: string;
      businessCentralUrl: string;
    };
    INDUS: {
      public: string;
      admin: string;
      ssoAdminEnabled: boolean;
      ssoSalesforceEnabled: boolean;
      sanaVersion: string;
      businessCentralUrl: string;
    };
  };
}

export default function SettingsPage() {
  const [portalUrls, setPortalUrls] = useState<PortalUrls>({});
  const [customCountries, setCustomCountries] = useState<CustomCountry[]>([]);
  const [savedMessage, setSavedMessage] = useState('');
  const [currentEnv, setCurrentEnv] = useState<'PROD' | 'INDUS'>('PROD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState<'ALL' | 'PROD' | 'INDUS'>('ALL');
  const [filterSSOAdmin, setFilterSSOAdmin] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [filterSSOSalesforce, setFilterSSOSalesforce] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL');
  const [showAddCountryForm, setShowAddCountryForm] = useState(false);
  const [newCountry, setNewCountry] = useState({
    id: '',
    name: '',
    countryCode: '',
    flagEmoji: '',
    ssoAdminEnabled: false,
    ssoSalesforceEnabled: false,
    sanaVersion: '9.3.40'
  });

  useEffect(() => {
    // Load URLs from server first, then fallback to localStorage, then env
    const loadUrls = async () => {
      try {
        // Try to load from server
        const response = await fetch('/api/portal-urls');
        if (response.ok) {
          const result = await response.json();
          if (result.success && Object.keys(result.data).length > 0) {
            setPortalUrls(result.data);
            // Also save to localStorage for offline access
            localStorage.setItem('portal-urls', JSON.stringify(result.data));
            return;
          }
        }
      } catch (error) {
        console.error('Error loading URLs from server:', error);
      }

      // Fallback to localStorage
      const savedUrls = localStorage.getItem('portal-urls');
      if (savedUrls) {
        setPortalUrls(JSON.parse(savedUrls));
        return;
      }

      // Final fallback to environment variables
      const defaultUrls: PortalUrls = {};
      const defaultConfigs = {
        colombia: { ssoAdmin: true, ssoSalesforce: true, version: '9.3.47' },
        australia: { ssoAdmin: true, ssoSalesforce: false, version: '9.3.45' },
        morocco: { ssoAdmin: false, ssoSalesforce: true, version: '9.3.40' },
        chile: { ssoAdmin: true, ssoSalesforce: true, version: '9.3.47' },
        argentina: { ssoAdmin: true, ssoSalesforce: false, version: '9.3.42' },
        vietnam: { ssoAdmin: false, ssoSalesforce: false, version: '9.3.38' },
        southAfrica: { ssoAdmin: true, ssoSalesforce: true, version: '9.3.46' },
        malaysia: { ssoAdmin: false, ssoSalesforce: true, version: '9.3.41' },
        southKorea: { ssoAdmin: true, ssoSalesforce: false, version: '9.3.44' },
      };
      
      COUNTRIES.forEach(country => {
        const prodConfig = getEnvironmentConfig('PROD');
        const indusConfig = getEnvironmentConfig('INDUS');
        const prodUrl = prodConfig.portalUrls[country] || '';
        const indusUrl = indusConfig.portalUrls[country] || '';
        const defaults = defaultConfigs[country as keyof typeof defaultConfigs];
        defaultUrls[country] = {
          PROD: {
            public: prodUrl,
            admin: prodUrl ? `${prodUrl}/admin` : '',
            ssoAdminEnabled: defaults.ssoAdmin,
            ssoSalesforceEnabled: defaults.ssoSalesforce,
            sanaVersion: defaults.version,
            businessCentralUrl: ''
          },
          INDUS: {
            public: indusUrl,
            admin: indusUrl ? `${indusUrl}/admin` : '',
            ssoAdminEnabled: defaults.ssoAdmin,
            ssoSalesforceEnabled: defaults.ssoSalesforce,
            sanaVersion: defaults.version,
            businessCentralUrl: ''
          }
        };
      });
      setPortalUrls(defaultUrls);
    };

    loadUrls();
  }, []);

  // Load custom countries from localStorage
  useEffect(() => {
    const savedCustomCountries = localStorage.getItem('custom-countries');
    if (savedCustomCountries) {
      try {
        setCustomCountries(JSON.parse(savedCustomCountries));
      } catch (error) {
        console.error('Error loading custom countries:', error);
      }
    }
  }, []);

  const handleUrlChange = (country: string, environment: 'PROD' | 'INDUS', urlType: 'public' | 'admin', value: string) => {
    setPortalUrls(prev => ({
      ...prev,
      [country]: {
        ...prev[country],
        [environment]: {
          ...prev[country]?.[environment],
          [urlType]: value
        }
      }
    }));
  };

  const handleSsoChange = (country: string, environment: 'PROD' | 'INDUS', ssoType: 'ssoAdminEnabled' | 'ssoSalesforceEnabled', value: boolean) => {
    setPortalUrls(prev => ({
      ...prev,
      [country]: {
        ...prev[country],
        [environment]: {
          ...prev[country]?.[environment],
          [ssoType]: value
        }
      }
    }));
  };

  const handleVersionChange = (country: string, environment: 'PROD' | 'INDUS', value: string) => {
    setPortalUrls(prev => ({
      ...prev,
      [country]: {
        ...prev[country],
        [environment]: {
          ...prev[country]?.[environment],
          sanaVersion: value
        }
      }
    }));
  };

  const handleBcUrlChange = (country: string, environment: 'PROD' | 'INDUS', value: string) => {
    setPortalUrls(prev => ({
      ...prev,
      [country]: {
        ...prev[country],
        [environment]: {
          ...prev[country]?.[environment],
          businessCentralUrl: value
        }
      }
    }));
  };

  const handleAddCustomCountry = () => {
    // Validate required fields
    if (!newCountry.id || !newCountry.name || !newCountry.countryCode || !newCountry.flagEmoji) {
      alert('Please fill all required fields');
      return;
    }

    // Check for duplicate ID
    const allCountryIds = [...COUNTRIES, ...customCountries.map(c => c.id)];
    if (allCountryIds.includes(newCountry.id as any)) {
      alert('Country ID already exists');
      return;
    }

    // Add new custom country
    const updatedCustomCountries = [...customCountries, newCountry as CustomCountry];
    setCustomCountries(updatedCustomCountries);
    localStorage.setItem('custom-countries', JSON.stringify(updatedCustomCountries));

    // Initialize portal URLs for new country
    setPortalUrls(prev => ({
      ...prev,
      [newCountry.id]: {
        PROD: {
          public: '',
          admin: '',
          ssoAdminEnabled: newCountry.ssoAdminEnabled,
          ssoSalesforceEnabled: newCountry.ssoSalesforceEnabled,
          sanaVersion: newCountry.sanaVersion,
          businessCentralUrl: ''
        },
        INDUS: {
          public: '',
          admin: '',
          ssoAdminEnabled: newCountry.ssoAdminEnabled,
          ssoSalesforceEnabled: newCountry.ssoSalesforceEnabled,
          sanaVersion: newCountry.sanaVersion,
          businessCentralUrl: ''
        }
      }
    }));

    // Reset form
    setNewCountry({
      id: '',
      name: '',
      countryCode: '',
      flagEmoji: '',
      ssoAdminEnabled: false,
      ssoSalesforceEnabled: false,
      sanaVersion: '9.3.40'
    });
    setShowAddCountryForm(false);
  };

  const handleRemoveCustomCountry = (countryId: string) => {
    if (!confirm(`Are you sure you want to remove "${countryId}"?`)) {
      return;
    }

    // Remove from custom countries
    const updatedCustomCountries = customCountries.filter(c => c.id !== countryId);
    setCustomCountries(updatedCustomCountries);
    localStorage.setItem('custom-countries', JSON.stringify(updatedCustomCountries));

    // Remove portal URLs for this country
    const updatedPortalUrls = { ...portalUrls };
    delete updatedPortalUrls[countryId];
    setPortalUrls(updatedPortalUrls);
    
    // Update localStorage and server
    localStorage.setItem('portal-urls', JSON.stringify(updatedPortalUrls));
    fetch('/api/portal-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPortalUrls),
    }).catch(error => console.error('Error updating server:', error));
  };

  const handleSave = async () => {
    try {
      // Save to server for permanent storage
      const response = await fetch('/api/portal-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portalUrls),
      });

      if (!response.ok) {
        throw new Error('Failed to save to server');
      }

      // Also save to localStorage for offline access
      localStorage.setItem('portal-urls', JSON.stringify(portalUrls));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('portal-urls-updated'));
      
      setSavedMessage('✓ Portal URLs saved! Return to homepage to see changes.');
      setTimeout(() => setSavedMessage(''), 4000);
    } catch (error) {
      console.error('Error saving URLs:', error);
      // Still save to localStorage even if server fails
      localStorage.setItem('portal-urls', JSON.stringify(portalUrls));
      setSavedMessage('⚠️ Saved locally only (server error). Return to homepage to see changes.');
      setTimeout(() => setSavedMessage(''), 5000);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all URLs to defaults? This will delete your saved configuration.')) {
      return;
    }
    
    try {
      // Clear from server
      await fetch('/api/portal-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.error('Error clearing server URLs:', error);
    }
    
    // Clear from localStorage
    localStorage.removeItem('portal-urls');
    window.location.reload();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(portalUrls, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'portal-urls-export.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getFlagImageUrl = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => (127397 + char.charCodeAt(0)).toString(16))
      .join('-');
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoints}.svg`;
  };

  const getCountryLabel = (country: string) => {
    const labels: { [key: string]: { name: string, code: string } } = {
      'colombia': { name: 'Colombia', code: 'CO' },
      'australia': { name: 'Australia', code: 'AU' },
      'morocco': { name: 'Morocco', code: 'MA' },
      'chile': { name: 'Chile', code: 'CL' },
      'argentina': { name: 'Argentina', code: 'AR' },
      'vietnam': { name: 'Vietnam', code: 'VN' },
      'southAfrica': { name: 'South Africa', code: 'ZA' },
      'malaysia': { name: 'Malaysia', code: 'MY' },
      'southKorea': { name: 'South Korea', code: 'KR' }
    };
    
    // Check if it's a custom country
    const customCountry = customCountries.find(c => c.id === country);
    if (customCountry) {
      return { name: customCountry.name, code: customCountry.countryCode };
    }
    
    return labels[country] || { name: country, code: 'XX' };
  };

  const isCustomCountry = (countryId: string) => {
    return customCountries.some(c => c.id === countryId);
  };

  // Combine built-in and custom countries
  const allCountries = [...COUNTRIES, ...customCountries.map(c => c.id)];

  // Filter countries based on search and filters
  const filteredCountries = allCountries.filter(country => {
    const countryInfo = getCountryLabel(country);
    const countryData = portalUrls[country];
    
    // Search filter
    if (searchQuery && !countryInfo.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Environment filter
    if (filterEnvironment !== 'ALL') {
      const env = filterEnvironment as 'PROD' | 'INDUS';
      const hasUrl = countryData?.[env]?.public || countryData?.[env]?.admin;
      if (!hasUrl) return false;
    }
    
    // SSO Admin filter
    if (filterSSOAdmin !== 'ALL') {
      const targetEnv = filterEnvironment === 'ALL' ? 'PROD' : filterEnvironment as 'PROD' | 'INDUS';
      const ssoStatus = countryData?.[targetEnv]?.ssoAdminEnabled;
      if (filterSSOAdmin === 'ENABLED' && !ssoStatus) return false;
      if (filterSSOAdmin === 'DISABLED' && ssoStatus) return false;
    }
    
    // SSO Salesforce filter
    if (filterSSOSalesforce !== 'ALL') {
      const targetEnv = filterEnvironment === 'ALL' ? 'PROD' : filterEnvironment as 'PROD' | 'INDUS';
      const ssoStatus = countryData?.[targetEnv]?.ssoSalesforceEnabled;
      if (filterSSOSalesforce === 'ENABLED' && !ssoStatus) return false;
      if (filterSSOSalesforce === 'DISABLED' && ssoStatus) return false;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header 
          onEnvironmentChange={setCurrentEnv} 
          currentEnvironment={currentEnv}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 px-6 py-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Portal Settings
                </h1>
                <p className="text-gray-400">Configure URLs, SSO status, and Sana versions for each portal</p>
              </div>
            </div>
          </div>

          {/* Save Message */}
          {savedMessage && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 text-green-300 rounded-lg flex items-center gap-3">
              <span className="text-xl">✓</span>
              <span className="font-semibold">{savedMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-8 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <span>💾</span>
              <span>Save All Changes</span>
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <span>📥</span>
              <span>Export URLs</span>
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Reset to Defaults</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 bg-slate-900 rounded-lg border border-slate-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🔍</span>
              Search & Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Search Country</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Environment Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Environment</label>
                <select
                  aria-label="Filter by environment"
                  value={filterEnvironment}
                  onChange={(e) => setFilterEnvironment(e.target.value as 'ALL' | 'PROD' | 'INDUS')}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="ALL">All Environments</option>
                  <option value="PROD">PROD Only</option>
                  <option value="INDUS">INDUS Only</option>
                </select>
              </div>

              {/* SSO Admin Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">SSO Admin</label>
                <select
                  aria-label="Filter by SSO Admin status"
                  value={filterSSOAdmin}
                  onChange={(e) => setFilterSSOAdmin(e.target.value as 'ALL' | 'ENABLED' | 'DISABLED')}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="ALL">All</option>
                  <option value="ENABLED">Enabled</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>

              {/* SSO Salesforce Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">SSO Salesforce</label>
                <select
                  aria-label="Filter by SSO Salesforce status"
                  value={filterSSOSalesforce}
                  onChange={(e) => setFilterSSOSalesforce(e.target.value as 'ALL' | 'ENABLED' | 'DISABLED')}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="ALL">All</option>
                  <option value="ENABLED">Enabled</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mt-4 text-sm text-slate-400">
              Showing {filteredCountries.length} of {allCountries.length} countries
            </div>
          </div>

          {/* Add/Remove Country Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🌍</span>
                Manage Countries/Portals
              </h3>
              <button
                onClick={() => setShowAddCountryForm(!showAddCountryForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <span>{showAddCountryForm ? '✕' : '+'}</span>
                {showAddCountryForm ? 'Cancel' : 'Add Country'}
              </button>
            </div>

            {showAddCountryForm && (
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700 space-y-4">
                <h4 className="text-md font-bold text-white mb-4">Add New Country/Portal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Country ID (lowercase, no spaces, e.g., "brazil")
                    </label>
                    <input
                      type="text"
                      value={newCountry.id}
                      onChange={(e) => setNewCountry({...newCountry, id: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                      placeholder="brazil"
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newCountry.name}
                      onChange={(e) => setNewCountry({...newCountry, name: e.target.value})}
                      placeholder="Brazil E-Ordering Portal"
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Country Code (2 letters, e.g., "BR")
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={newCountry.countryCode}
                      onChange={(e) => setNewCountry({...newCountry, countryCode: e.target.value.toUpperCase()})}
                      placeholder="BR"
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Flag Emoji
                    </label>
                    <input
                      type="text"
                      value={newCountry.flagEmoji}
                      onChange={(e) => setNewCountry({...newCountry, flagEmoji: e.target.value})}
                      placeholder="🇧🇷"
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Sana Version
                    </label>
                    <input
                      type="text"
                      value={newCountry.sanaVersion}
                      onChange={(e) => setNewCountry({...newCountry, sanaVersion: e.target.value})}
                      placeholder="9.3.40"
                      className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCountry.ssoAdminEnabled}
                        onChange={(e) => setNewCountry({...newCountry, ssoAdminEnabled: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-300">SSO Admin</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newCountry.ssoSalesforceEnabled}
                        onChange={(e) => setNewCountry({...newCountry, ssoSalesforceEnabled: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-slate-300">SSO Salesforce</span>
                    </label>
                  </div>
                </div>
                <button
                  onClick={handleAddCustomCountry}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all"
                >
                  Add Country
                </button>
              </div>
            )}
          </div>

          {/* Portal URL Configuration */}
          <div className="space-y-6">
            {filteredCountries.map((country, index) => {
              const countryInfo = getCountryLabel(country);
              return (
                <div 
                  key={country} 
                  className="bg-slate-900 rounded-lg shadow-lg p-6 border border-slate-800 hover:border-slate-700 transition-colors duration-200"
                >
                  {/* Country Header with Flag */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={getFlagImageUrl(countryInfo.code)} 
                        alt={`${countryInfo.name} flag`}
                        className="w-12 h-12 object-contain"
                      />
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {countryInfo.name}
                        </h2>
                        {isCustomCountry(country) && (
                          <span className="text-xs text-blue-400 font-semibold">Custom Portal</span>
                        )}
                      </div>
                    </div>
                    {isCustomCountry(country) && (
                      <button
                        onClick={() => handleRemoveCustomCountry(country)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        title="Remove this custom country"
                      >
                        <span>🗑️</span>
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    {/* PROD URLs */}
                    <div className="bg-slate-800/50 rounded-lg p-5 border-l-4 border-green-600">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-semibold">PROD</span>
                        <span>Production Environment</span>
                      </h3>
                      <div className="space-y-4">
                        {/* URLs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                              <span>🌐</span>
                              <span>Public URL</span>
                            </label>
                            <input
                              type="url"
                              value={portalUrls[country]?.PROD?.public || ''}
                              onChange={(e) => handleUrlChange(country, 'PROD', 'public', e.target.value)}
                              placeholder="https://portal-prod.example.com"
                              className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                              <span>🔑</span>
                              <span>Admin URL</span>
                            </label>
                            <input
                              type="url"
                              value={portalUrls[country]?.PROD?.admin || ''}
                              onChange={(e) => handleUrlChange(country, 'PROD', 'admin', e.target.value)}
                              placeholder="https://portal-prod.example.com/admin"
                              className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                          </div>
                        </div>
                        
                        {/* SSO Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span>🔐</span>
                                <div>
                                  <span className="block text-sm font-semibold text-white">SSO Admin</span>
                                  <span className="block text-xs text-slate-400">Admin authentication</span>
                                </div>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={portalUrls[country]?.PROD?.ssoAdminEnabled || false}
                                  onChange={(e) => handleSsoChange(country, 'PROD', 'ssoAdminEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                              </div>
                            </label>
                          </div>
                          
                          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span>⚡</span>
                                <div>
                                  <span className="block text-sm font-semibold text-white">SSO Salesforce</span>
                                  <span className="block text-xs text-slate-400">Customer authentication</span>
                                </div>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={portalUrls[country]?.PROD?.ssoSalesforceEnabled || false}
                                  onChange={(e) => handleSsoChange(country, 'PROD', 'ssoSalesforceEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        {/* Sana Version */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span>🚀</span>
                            <span>Sana Commerce Version</span>
                          </label>
                          <input
                            type="text"
                            value={portalUrls[country]?.PROD?.sanaVersion || ''}
                            onChange={(e) => handleVersionChange(country, 'PROD', e.target.value)}
                            placeholder="9.3.47"
                            className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          />
                        </div>

                        {/* Business Central ERP */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span>🏢</span>
                            <span>Business Central ERP URL</span>
                          </label>
                          <input
                            type="url"
                            value={portalUrls[country]?.PROD?.businessCentralUrl || ''}
                            onChange={(e) => handleBcUrlChange(country, 'PROD', e.target.value)}
                            placeholder="https://businesscentral.dynamics.com"
                            className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* INDUS URLs */}
                    <div className="bg-slate-800/50 rounded-lg p-5 border-l-4 border-orange-600">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded font-semibold">INDUS</span>
                        <span>Testing Environment</span>
                      </h3>
                      <div className="space-y-4">
                        {/* URLs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                              <span>🌐</span>
                              <span>Public URL</span>
                            </label>
                            <input
                              type="url"
                              value={portalUrls[country]?.INDUS?.public || ''}
                              onChange={(e) => handleUrlChange(country, 'INDUS', 'public', e.target.value)}
                              placeholder="https://portal-test.example.com"
                              className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                              <span>🔑</span>
                              <span>Admin URL</span>
                            </label>
                            <input
                              type="url"
                              value={portalUrls[country]?.INDUS?.admin || ''}
                              onChange={(e) => handleUrlChange(country, 'INDUS', 'admin', e.target.value)}
                              placeholder="https://portal-test.example.com/admin"
                              className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            />
                          </div>
                        </div>
                        
                        {/* SSO Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span>🔐</span>
                                <div>
                                  <span className="block text-sm font-semibold text-white">SSO Admin</span>
                                  <span className="block text-xs text-slate-400">Admin authentication</span>
                                </div>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={portalUrls[country]?.INDUS?.ssoAdminEnabled || false}
                                  onChange={(e) => handleSsoChange(country, 'INDUS', 'ssoAdminEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                              </div>
                            </label>
                          </div>
                          
                          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                            <label className="flex items-center justify-between cursor-pointer">
                              <div className="flex items-center gap-2">
                                <span>⚡</span>
                                <div>
                                  <span className="block text-sm font-semibold text-white">SSO Salesforce</span>
                                  <span className="block text-xs text-slate-400">Customer authentication</span>
                                </div>
                              </div>
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={portalUrls[country]?.INDUS?.ssoSalesforceEnabled || false}
                                  onChange={(e) => handleSsoChange(country, 'INDUS', 'ssoSalesforceEnabled', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                              </div>
                            </label>
                          </div>
                        </div>
                        
                        {/* Sana Version */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span>🚀</span>
                            <span>Sana Commerce Version</span>
                          </label>
                          <input
                            type="text"
                            value={portalUrls[country]?.INDUS?.sanaVersion || ''}
                            onChange={(e) => handleVersionChange(country, 'INDUS', e.target.value)}
                            placeholder="9.3.47"
                            className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          />
                        </div>

                        {/* Business Central ERP */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <span>🏢</span>
                            <span>Business Central ERP URL</span>
                          </label>
                          <input
                            type="url"
                            value={portalUrls[country]?.INDUS?.businessCentralUrl || ''}
                            onChange={(e) => handleBcUrlChange(country, 'INDUS', e.target.value)}
                            placeholder="https://businesscentral.dynamics.com"
                            className="w-full px-4 py-2 border border-slate-700 bg-slate-900 text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-10 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>ℹ️</span>
              <span>How it works</span>
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              <li className="flex items-start gap-2">
                <span>💾</span>
                <span>All settings are saved permanently on the server and synced to your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span>⚡</span>
                <span>Changes take effect immediately after saving</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔐</span>
                <span>Configure SSO Admin and SSO Salesforce authentication per environment</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🚀</span>
                <span>Set the Sana Commerce version for each portal (displayed in modal)</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🏢</span>
                <span>Link Business Central ERP systems to each portal for easy access</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🚫</span>
                <span>Empty URLs will flag portals as INACTIVE on the main hub</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🔄</span>
                <span>Reset will restore default URLs and configurations</span>
              </li>
              <li className="flex items-start gap-2">
                <span>📥</span>
                <span>Export your complete configuration to backup or share</span>
              </li>
            </ul>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
