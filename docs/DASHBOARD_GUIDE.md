# OCA Sana Hub - Executive Dashboard Guide

## 📊 Overview

The Executive Dashboard provides comprehensive analytics and visualizations for the OCA Sana Hub portal management system. It offers real-time insights into portal usage, environment distribution, SSO adoption, and Business Central integration.

## ✨ Features

### Key Performance Indicators (KPIs)
- **Total Portals**: Number of configured country portals
- **Active Portals**: Recently accessed portals
- **Total Accesses**: Cumulative portal visits
- **Unique Users**: Number of distinct users
- **SSO Adoption**: SSO Admin and Salesforce integration status
- **Business Central Integration**: ERP system integration metrics
- **Environment Metrics**: PROD and INDUS environment counts

### Visualizations

#### 1. Country Usage Chart (Bar Chart)
- **Purpose**: Shows portal access frequency by country
- **Data Points**: Top 10 countries by access count
- **Visualization**: Horizontal bar chart with country flags
- **Insights**: Identify most-used portals and regional trends

#### 2. Environment Distribution (Pie Chart)
- **Purpose**: Breakdown of PROD vs INDUS environment usage
- **Data Points**: Access percentage per environment
- **Visualization**: Pie chart with percentage labels
- **Insights**: Understand production vs testing usage patterns

#### 3. Activity Timeline (Line Chart)
- **Purpose**: Track portal activity over the last 7 days
- **Data Points**: Daily access count and unique portals accessed
- **Visualization**: Dual-line chart with date axis
- **Insights**: Identify usage trends, peaks, and patterns

#### 4. SSO Adoption Chart (Progress Bars)
- **Purpose**: Visualize Single Sign-On adoption rates
- **Data Points**: SSO Admin and SSO Salesforce enablement
- **Visualization**: Horizontal progress bars with percentages
- **Insights**: Track security and authentication improvements

#### 5. Recent Activity Feed
- **Purpose**: Real-time log of user actions
- **Data Points**: Last 10 user interactions
- **Visualization**: Activity feed with timestamps and icons
- **Insights**: Monitor current system usage

## 🚀 Getting Started

### Accessing the Dashboard

1. **From Main Page**: Click the "View Analytics Dashboard" button
2. **From Header**: Click the "📊 Dashboard" button in navigation
3. **Direct URL**: Navigate to `/dashboard`

### First-Time Setup

The dashboard automatically generates **mock data** for demonstration purposes if no real usage data exists. This allows you to:
- Explore all visualizations with realistic data
- Understand the dashboard capabilities
- Test export functionality

### Data Sources

The dashboard pulls data from two sources:

1. **Portal Configuration** (`src/services/portalService.ts`)
   - Portal metadata
   - SSO settings
   - Business Central URLs
   - Environment configurations

2. **User Stories** (localStorage: `oca-sana-user-stories`)
   - User interactions
   - Portal access logs
   - Environment switches
   - Timestamps and metadata

## 📈 Dashboard Metrics Explained

### Total Portals
- **Calculation**: Count of all configured portals (built-in + custom)
- **Includes**: Colombia, Australia, Morocco, Chile, Argentina, Vietnam, South Africa, Malaysia, South Korea, plus any custom portals

### Active Portals
- **Calculation**: Unique portals accessed within the tracking period
- **Source**: Filtered from user story logs
- **Indicates**: Portal utilization rate

### Total Accesses
- **Calculation**: Sum of all `portal_access` and `portal_select` actions
- **Source**: User story logs
- **Indicates**: Overall system usage

### Unique Users
- **Calculation**: Distinct user identifiers from activity logs
- **Source**: User story metadata
- **Indicates**: User base size

### SSO Enabled
- **Calculation**: Portals with SSO Admin or SSO Salesforce enabled
- **Source**: Portal configuration
- **Indicates**: Security feature adoption

### Business Central Integration
- **Calculation**: Portals with BC ERP URLs configured
- **Source**: Portal configuration (PROD or INDUS)
- **Indicates**: ERP integration coverage

## 🛠️ Technical Architecture

### Analytics Service
**Location**: `src/services/analyticsService.ts`

**Key Methods**:
- `getDashboardMetrics()` - Aggregates KPIs
- `getCountryUsageData()` - Country-level statistics
- `getEnvironmentDistribution()` - PROD/INDUS breakdown
- `getActivityTimeline()` - Time-series data
- `getSSOAdoptionData()` - SSO metrics
- `getBCIntegrationStatus()` - ERP integration status
- `getRecentActivity()` - Latest user actions
- `generateMockData()` - Demo data generator

### Chart Components

#### KPICard
**Location**: `src/components/dashboard/KPICard.tsx`

**Props**:
- `title`: Metric name
- `value`: Numeric or string value
- `subtitle`: Additional context
- `icon`: SVG icon element
- `trend`: { value: number, isPositive: boolean }
- `color`: Card color theme

#### CountryUsageChart
**Location**: `src/components/dashboard/CountryUsageChart.tsx`

**Technology**: Recharts BarChart
**Props**: `data: CountryUsageData[]`

#### EnvironmentPieChart
**Location**: `src/components/dashboard/EnvironmentPieChart.tsx`

**Technology**: Recharts PieChart
**Props**: `data: EnvironmentDistribution[]`

#### ActivityTimelineChart
**Location**: `src/components/dashboard/ActivityTimelineChart.tsx`

**Technology**: Recharts LineChart
**Props**: `data: ActivityTimelineData[]`

#### SSOAdoptionChart
**Location**: `src/components/dashboard/SSOAdoptionChart.tsx`

**Technology**: Custom horizontal progress bars
**Props**: `data: SSOAdoptionData[]`

#### RecentActivity
**Location**: `src/components/dashboard/RecentActivity.tsx`

**Technology**: Activity feed with scrolling
**Props**: `activities: UserStory[]`

## 📊 Data Export

### Export Dashboard Data

Click the **"📥 Export Dashboard Data"** button at the bottom of the dashboard to download a JSON file containing:

```json
{
  "metrics": { /* KPI values */ },
  "countryUsage": [ /* Country statistics */ ],
  "envDistribution": [ /* Environment breakdown */ ],
  "activityTimeline": [ /* 7-day activity data */ ],
  "ssoAdoption": [ /* SSO metrics */ ],
  "bcIntegration": { /* ERP integration status */ },
  "generatedAt": "2026-02-22T12:00:00.000Z"
}
```

**Use Cases**:
- Historical analysis
- External reporting
- Data backup
- Integration with BI tools

## 🎨 UI/UX Features

### Color Scheme
- **Background**: Slate-900 (dark theme)
- **Cards**: Slate-800 with subtle borders
- **Accents**: 
  - Blue: Primary metrics, production
  - Green: Success, active items
  - Purple: Advanced features
  - Orange: Testing/INDUS environment
  - Cyan: User metrics

### Responsive Design
- **Desktop**: Full multi-column grid layout
- **Tablet**: Adaptive 2-column layout
- **Mobile**: Single-column stacked layout

### Interactions
- **Hover Effects**: Card elevation and color transitions
- **Tooltips**: Chart data points show detailed info
- **Animations**: Smooth transitions on data updates
- **Loading State**: Dashboard shows loading indicator during data fetch

## 🔄 Real-Time Updates

### Automatic Refresh
The dashboard **does NOT auto-refresh** by default. To see updated data:
1. Navigate away and return to `/dashboard`
2. Refresh the browser page
3. Close and reopen the dashboard

### Manual Data Refresh
For real-time updates, consider implementing:
- Refresh button in dashboard header
- Periodic polling (e.g., every 30 seconds)
- WebSocket connections for live data

## 📱 Mobile Optimization

### Responsive Breakpoints
- **sm**: 640px - Mobile landscape
- **md**: 768px - Tablet
- **lg**: 1024px - Desktop
- **xl**: 1280px - Large desktop

### Mobile-Specific Adjustments
- Chart heights reduced on mobile
- Simplified tooltips
- Touch-friendly interactions
- Scrollable activity feed

## 🔐 Security & Privacy

### Data Storage
- All analytics data stored in **browser localStorage**
- No server-side storage or transmission
- Data persists per browser/device only

### Privacy Considerations
- User identifiers are optional and customizable
- No personally identifiable information (PII) captured by default
- Data export respects client-side storage boundaries

## 🐛 Troubleshooting

### No Data Displayed
**Issue**: All charts show "No data"
**Solution**: 
1. Check localStorage for `oca-sana-user-stories`
2. Use some portals to generate activity
3. Refresh the dashboard
4. Mock data should auto-generate on first load

### Charts Not Rendering
**Issue**: Blank chart areas
**Solution**:
1. Check browser console for errors
2. Ensure Recharts library is installed: `npm install recharts`
3. Verify chart data format matches expected interfaces

### Incorrect Metrics
**Issue**: KPIs show unexpected values
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Refresh page to regenerate mock data
3. Check portal configurations in settings

### Performance Issues
**Issue**: Dashboard loads slowly
**Solution**:
1. Limit stored user stories (configured in logger)
2. Reduce activity timeline range (default: 7 days)
3. Optimize chart data by sampling large datasets

## 📚 API Reference

### AnalyticsService Methods

#### `getDashboardMetrics(): DashboardMetrics`
Returns aggregated KPIs including total portals, active portals, accesses, users, SSO adoption, and BC integration.

#### `getCountryUsageData(): CountryUsageData[]`
Returns array of country usage statistics sorted by access count (descending).

**Return Type**:
```typescript
{
  country: string;
  countryCode: string;
  accessCount: number;
  lastAccessed: string; // ISO timestamp or "Never"
  flagEmoji: string;
}
```

#### `getEnvironmentDistribution(): EnvironmentDistribution[]`
Returns PROD and INDUS usage breakdown with percentages.

**Return Type**:
```typescript
{
  name: string;
  value: number;
  percentage: number;
}
```

#### `getActivityTimeline(days: number = 7): ActivityTimelineData[]`
Returns time-series activity data for specified number of days.

**Return Type**:
```typescript
{
  date: string; // YYYY-MM-DD
  accesses: number;
  uniquePortals: number;
}
```

#### `getSSOAdoptionData(): SSOAdoptionData[]`
Returns SSO adoption metrics for Admin and Salesforce.

**Return Type**:
```typescript
{
  category: string;
  enabled: number;
  total: number;
  percentage: number;
}
```

#### `getBCIntegrationStatus(): BCIntegrationStatus`
Returns Business Central integration summary.

**Return Type**:
```typescript
{
  integrated: number;
  total: number;
  percentage: number;
}
```

#### `getRecentActivity(limit: number = 10): UserStory[]`
Returns most recent user actions, sorted by timestamp (descending).

## 🎯 Future Enhancements

### Planned Features
- [ ] Custom date range selectors
- [ ] Export to CSV and PDF formats
- [ ] Drill-down capabilities (click chart → details)
- [ ] User-specific analytics
- [ ] Predictive analytics and trends
- [ ] Email report scheduling
- [ ] Dashboard customization (drag/drop widgets)
- [ ] Performance benchmarking
- [ ] Alerts and notifications
- [ ] Multi-tenant support

### Advanced Analytics
- [ ] Machine learning predictions
- [ ] Anomaly detection
- [ ] Usage forecasting
- [ ] Peak time analysis
- [ ] Geographic heatmaps
- [ ] User journey mapping

## 🤝 Contributing

To extend the dashboard:

1. **Add New Metrics**: Extend `AnalyticsService` with new calculation methods
2. **Create Chart Components**: Use Recharts or custom visualizations
3. **Update Dashboard Page**: Add new components to grid layout
4. **Document Changes**: Update this guide with new features

## 📞 Support

For dashboard issues or questions:
- Review this guide thoroughly
- Check browser console for errors
- Verify data exists in localStorage
- Test with mock data generation

---

**Version**: 2.0.0 (Dashboard Release)  
**Last Updated**: February 22, 2026  
**Status**: ✅ Production-Ready
