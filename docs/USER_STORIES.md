# User Story Logging Guide

## Overview

The OCA Sana Hub application automatically logs all user interactions as "user stories" for comprehensive tracking, auditing, and documentation purposes.

## What Gets Logged?

### Automatically Tracked Events
- Portal access/selection
- Environment switching (PROD/INDUS)
- Portal navigation
- Portal status checks
- API calls and responses
- User interactions

### User Story Components

Each logged interaction contains:
```typescript
{
  id: "story-1708436400000-1",           // Unique identifier
  timestamp: "2026-02-21T10:00:00Z",     // When it happened
  title: "Access Colombia Portal",        // What happened
  description: "User selected Colombia",  // Details
  country: "colombia",                    // Affected country
  environment: "INDUS",                   // Environment context
  severity: "medium",                     // Importance level
  status: "backlog",                      // Current status
  promptContent: "...",                   // Original request
  tags: ["portal-access", "user-action"], // Categories
  metadata: { /* additional data */ }     // Extra info
}
```

## Using User Story Logging in Components

### Basic Usage with Hook

```typescript
import { useUserStory } from '@/hooks/useUserStory';

export function MyComponent() {
  const { logPrompt, logResponse, updateStatus } = useUserStory({
    country: 'colombia',
    environment: 'INDUS'
  });

  const handleClick = () => {
    // Log an action
    const story = logPrompt(
      'Button Click',
      'User clicked the order button',
      'User initiated order process',
      {
        severity: 'medium',
        tags: ['order', 'user-action']
      }
    );

    // Process the action...

    // Log completion
    logResponse(story.id, 'Order successfully initiated');
  };

  return <button onClick={handleClick}>Start Order</button>;
}
```

### Advanced Options

```typescript
const story = logPrompt(
  title: 'Feature Name',
  description: 'What the user did',
  promptContent: 'Full details of the interaction',
  {
    // Optional parameters
    country: 'argentina',                           // Which country
    environment: 'PROD',                            // Which environment
    severity: 'critical',                           // low|medium|high|critical
    status: 'in-progress',                          // Story status
    tags: ['urgent', 'order', 'payment'],          // Keywords
    author: 'user@example.com',                    // Who initiated
    metadata: {                                     // Any extra data
      orderId: '12345',
      amount: 99.99,
      paymentMethod: 'credit_card'
    }
  }
);
```

## Severity Levels

Use appropriate severity for different types of interactions:

### **Low Severity** (`'low'`)
- Minor UI interactions
- Page navigation
- View changes
- Informational actions

**Example**:
```typescript
logPrompt(
  'Portal Viewed',
  'User viewed Australia portal listings',
  'Page loaded successfully',
  { severity: 'low' }
);
```

### **Medium Severity** (`'medium'`) - Default
- Standard business operations
- Data entry
- Regular portal usage
- Form submissions

**Example**:
```typescript
logPrompt(
  'Order Created',
  'User created new order in Colombia portal',
  'Order submitted with ID: ORD-2026-001',
  { severity: 'medium' }
);
```

### **High Severity** (`'high'`)
- Important business operations
- Payment processing
- Data modifications
- Permission changes
- System configuration

**Example**:
```typescript
logPrompt(
  'Payment Processed',
  'Processing $1000 payment for Argentina account',
  'Payment method: Debit Card, Amount: USD 1000',
  { severity: 'high', tags: ['payment', 'critical'] }
);
```

### **Critical Severity** (`'critical'`)
- System errors
- Security events
- Failed operations
- Exceptions
- Authentication issues

**Example**:
```typescript
logPrompt(
  'Payment Failed',
  'Payment processing failed for South Africa',
  'Database connection timeout - Error Code: DB_TIMEOUT_001',
  { severity: 'critical', tags: ['error', 'payment', 'urgent'] }
);
```

## Accessing Logged Stories

### In Browser Console

```javascript
// Get all stories
const stories = JSON.parse(localStorage.getItem('oca-sana-user-stories'));
console.log(stories);

// Find stories by country
const colombiaStories = stories.filter(s => s.country === 'colombia');

// Export as JSON
console.log(JSON.stringify(stories, null, 2));
```

### Using the useUserStories Hook

```typescript
import { useUserStories } from '@/hooks/useUserStory';

export function ReportsComponent() {
  const {
    getAllStories,
    getStoriesByCountry,
    getStoriesByEnvironment,
    getStoriesBySeverity,
    exportJSON,
    exportCSV,
    getCount
  } = useUserStories();

  // Get all stories
  const allStories = getAllStories();
  console.log(`Total stories: ${getCount()}`);

  // Filter stories
  const colombiaStories = getStoriesByCountry('colombia');
  const highSeverity = getStoriesBySeverity('critical');
  const prodStories = getStoriesByEnvironment('PROD');

  // Export data
  const jsonData = exportJSON();
  const csvData = exportCSV();

  return (
    <div>
      <h2>User Stories ({getCount()})</h2>
      {/* Display stories */}
    </div>
  );
}
```

## Story Status Management

Update story progress through its lifecycle:

```typescript
const { logPrompt, updateStatus } = useUserStory();

// Create the story
const story = logPrompt('Order Processing', '...', '...');

// Update status as it progresses
updateStatus(story.id, 'in-progress', { 
  processedItems: 5 
});

updateStatus(story.id, 'in-review', {
  reviewedBy: 'manager@company.com',
  reviewDate: new Date().toISOString()
});

updateStatus(story.id, 'completed', {
  completionTime: '2 hours',
  resultCode: 'SUCCESS'
});
```

## Tags and Categorization

Use tags to organize and filter stories:

### Common Tags
- `'portal-access'` - Portal selection/access
- `'order'` - Order-related
- `'payment'` - Payment processing
- `'user-action'` - User initiated action
- `'system-event'` - System generated
- `'error'` - Error condition
- `'urgent'` - Requires attention
- Environment-specific: `'prod-only'`, `'testing'`
- Country-specific: `'colombia'`, `'australia'`, etc.

### Example with Multiple Tags
```typescript
logPrompt(
  'Order Payment Failed',
  'Payment declined for Chile order',
  'Card declined: Insufficient funds',
  {
    severity: 'high',
    tags: ['order', 'payment', 'urgent', 'chile', 'error'],
    metadata: { errorCode: 'INSUFFICIENT_FUNDS', amount: 599.99 }
  }
);
```

## Querying and Filtering

### Filter by Country
```typescript
const colombiaActivity = getAllStories()
  .filter(s => s.country === 'colombia');
```

### Filter by Date Range
```typescript
const today = new Date().toDateString();
const todaysStories = getAllStories()
  .filter(s => new Date(s.timestamp).toDateString() === today);
```

### Filter by Multiple Conditions
```typescript
const criticalRecentOrders = getAllStories()
  .filter(s => 
    s.severity === 'critical' && 
    s.tags.includes('order') &&
    new Date(s.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
```

### Filter by Status
```typescript
const pendingStories = getAllStories()
  .filter(s => s.status === 'in-progress' || s.status === 'in-review');
```

## Exporting Data

### Export as JSON
```typescript
const { exportJSON } = useUserStories();
const jsonData = exportJSON();

// Save to file
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `user-stories-${Date.now()}.json`;
a.click();
```

### Export as CSV
```typescript
const { exportCSV } = useUserStories();
const csvData = exportCSV();

// Save to file
const blob = new Blob([csvData], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `user-stories-${Date.now()}.csv`;
a.click();
```

## Analytics from User Stories

### Activity by Country
```typescript
const countByCountry = getAllStories()
  .reduce((acc, story) => {
    acc[story.country] = (acc[story.country] || 0) + 1;
    return acc;
  }, {});
// Result: { colombia: 12, australia: 8, ... }
```

### Critical Issues Count
```typescript
const criticalCount = getAllStories()
  .filter(s => s.severity === 'critical').length;
```

### Environment Usage
```typescript
const envStats = {
  prod: getStoriesByEnvironment('PROD').length,
  indus: getStoriesByEnvironment('INDUS').length
};
```

## Best Practices

✅ **Do**:
- Log important business actions
- Use appropriate severity levels
- Add meaningful titles and descriptions
- Include relevant metadata
- Use consistent tagging
- Update story status as it progresses
- Export stories regularly for backup

❌ **Don't**:
- Log every mouse movement or hover
- Use overly verbose descriptions
- Forget to close/complete stories
- Store sensitive data in promptContent
- Use generic titles like "Action" or "Event"
- Ignore error logging

## Accessing Logs Directory

User stories are stored in the `/logs` directory:

```
logs/
├── user-stories.json      # Main user story log
├── backups/
│   ├── user-stories-2026-02-20.json
│   └── user-stories-2026-02-19.json
└── exports/
    └── reports-2026-02.csv
```

## Data Persistence

- Stories are stored in **browser localStorage** during the session
- Maximum 1000 stories stored (configurable)
- Data persists across page refreshes
- Clear browser localStorage to reset logs

## Integration with External Systems

Export logged stories for integration with:
- Project management tools (Jira, Asana)
- Analytics platforms (Google Analytics, Mixpanel)
- Data warehouses (BigQuery, Redshift)
- CRM systems
- Support/ticketing systems

---

**Last Updated**: February 21, 2026
**Logging System Version**: 1.0.0
