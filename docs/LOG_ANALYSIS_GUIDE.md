# OCA Sana Hub - Log Error Analysis Dashboard Guide

## 📊 Overview

The **Log Error Analysis Dashboard** is a comprehensive system for ingesting, parsing, and analyzing log files from all Sana Commerce portals across countries and environments. It provides deep insights into errors, patterns, and system health through 12+ interactive visualizations.

## ✨ Key Features

### 1. **Automated Log Discovery**
- Scans base directory for country/environment structure
- Automatically detects log files (.log, .txt, .xml)
- Displays discovered sources before ingestion

### 2. **Multi-Source Ingestion**
- Processes logs from all countries simultaneously
- Supports PROD and INDUS environments
- Handles thousands of log entries efficiently
- Real-time progress tracking

### 3. **Comprehensive Analysis**
The system analyzes:
- Total requests and error counts
- Error rates and percentages
- Peak hours and days
- Error type categorization
- Severity distribution
- Temporal patterns

### 4. **12+ Interactive Charts**
Based on your provided examples:
1. **Top 15 Error Types** (Horizontal Bar)
2. **Error Frequency Over Time** (Line Chart)
3. **Error Distribution by Hour** (Bar Chart)
4. **Error Distribution by Severity** (Pie Chart)
5. **Error Distribution by Category** (Pie Chart)
6. **Error Distribution by Day of Week** (Bar Chart)
7. **Top 10 Operations with Errors** (Horizontal Bar)
8. **Cumulative Error Growth** (Line Chart)
9. **Peak vs Off-Peak Comparison** (Bar Chart)

## 🚀 Getting Started

### Access the Dashboard
Navigate to: **http://localhost:3001/log-analysis**

Or click "📈 Log Analysis" in the header.

### Step 1: Configure Base Path
Enter the base directory containing your log files:

```
C:\Users\falseck\OneDrive - Capgemini\Documents\Michelin\Michelin Australia logs analysis\SANA_LOGS
```

Expected directory structure:
```
SANA_LOGS/
  ├── australia/
  │   ├── prod/
  │   │   ├── log1.log
  │   │   ├── log2.log
  │   │   └── ...
  │   └── indus/
  │       └── ...
  ├── colombia/
  │   ├── prod/
  │   └── indus/
  └── ...
```

### Step 2: Scan Directories
Click **"🔍 Scan Directories"** to discover all log sources.

The system will:
- Traverse the directory tree
- Identify country folders
- Find environment subdirectories
- Count log files in each location
- Display discoveries in a grid

### Step 3: Ingest Logs
Click **"⚙️ Ingest All (X sources)"** to process all discovered logs.

The ingestion process:
1. Clears any previously loaded logs
2. Processes each country/environment sequentially
3. Parses log entries using Sana Commerce format
4. Extracts metadata (timestamp, severity, operation, error type)
5. Stores in memory for analysis
6. Shows real-time progress

### Step 4: View Analysis
Once ingestion completes, the dashboard automatically displays:
- 4 KPI cards (Total Requests, Errors, Error Rate, Peak Hour)
- 12+ interactive charts with comprehensive insights

## 📈 Chart Explanations

### Top 15 Error Types
**Purpose**: Identify most frequent error messages
**Insight**: Focus remediation efforts on top errors
**Data**: Horizontal bar chart sorted by count

### Error Frequency Over Time
**Purpose**: Track error trends across dates
**Insight**: Identify spikes, patterns, and problematic periods
**Data**: Line chart with daily error counts

### Error Distribution by Hour
**Purpose**: Understand hourly error patterns
**Insight**: Detect peak error hours for capacity planning
**Data**: 24-hour bar chart (00-23)

### Error Distribution by Severity
**Purpose**: Categorize errors by severity level
**Insight**: Understand critical vs warning ratio
**Data**: Pie chart (Error, Fatal, Warning, Info, Debug)

### Error Distribution by Category
**Purpose**: Group errors by system area
**Insight**: Identify problematic system components
**Data**: Pie chart (system, data, authentication, operation, unknown)

### Error Distribution by Day of Week
**Purpose**: Detect weekly patterns
**Insight**: Plan maintenance windows, identify load patterns
**Data**: Bar chart (Mon-Sun)

### Top 10 Operations with Errors
**Purpose**: Identify problematic operations
**Insight**: Focus on specific API endpoints or functions
**Data**: Horizontal bar chart of operation names

### Cumulative Error Growth
**Purpose**: Track total error accumulation over time
**Insight**: Visualize error velocity and trends
**Data**: Cumulative line chart

### Peak vs Off-Peak Hours Comparison
**Purpose**: Compare business hours (09:00-17:00) vs off-hours
**Insight**: Understand user-driven vs system-driven errors
**Data**: Comparison bar chart with percentages

## 🔧 Technical Architecture

### Backend APIs

#### POST /api/logs/scanDirectories
Scans a base path for log file directories.

**Request**:
```json
{
  "basePath": "C:\\path\\to\\logs"
}
```

**Response**:
```json
{
  "success": true,
  "basePath": "C:\\path\\to\\logs",
  "discoveries": [
    {
      "country": "australia",
      "environment": "PROD",
      "path": "C:\\path\\to\\logs\\australia\\prod",
      "fileCount": 15
    }
  ],
  "totalDiscovered": 1
}
```

#### POST /api/logs/ingestFromPath
Ingest logs from a specific directory.

**Request**:
```json
{
  "folderPath": "C:\\path\\to\\logs\\australia\\prod",
  "country": "australia",
  "environment": "PROD"
}
```

**Response**:
```json
{
  "success": true,
  "filesProcessed": 15,
  "entriesFound": 5423,
  "errors": [],
  "message": "Successfully processed 15 files with 5423 log entries"
}
```

#### GET /api/logs/analysis
Get comprehensive error analysis of loaded logs.

**Response**:
```json
{
  "success": true,
  "analysis": {
    "totalRequests": 50000,
    "totalErrors": 5423,
    "errorRate": 10.85,
    "peakHour": "14:00",
    "peakDay": "Tue",
    "topErrorTypes": [...],
    "errorsByHour": [...],
    "errorsByDay": [...],
    ...
  },
  "totalLogs": 50000
}
```

#### POST /api/logs/clear
Clear all loaded logs from memory.

**Response**:
```json
{
  "success": true,
  "message": "All logs cleared successfully"
}
```

### Log Parser

The `logAnalysisService` parses Sana Commerce log format:

**Expected format**:
```
[YYYY-MM-DD HH:mm:ss] [SEVERITY] Operation: Message
```

**Example entries**:
```
[2024-02-15 14:23:51] [Error] Operation: Cannot authenticate existing shop
[2024-02-15 15:12:33] [Fatal] System.InvalidOperationException: User is not authorized
```

### Error Categorization

**Error Types** (extracted from message):
- Cannot authenticate existing shop
- User is not authorized for request
- Hash validation error
- System.InvalidOperationException
- GraphQL Parser Exception
- Sana Commerce Calculation Basket
- Document does not contain any data
- N/A
- PersistableQueryNotSupported
- Sana.Erp.EpmConnectionException
- Other

**Categories** (by system area):
- **system**: System-level errors, InvalidOperation
- **authentication**: Auth failures, unauthorized access
- **data**: Data validation, document errors
- **operation**: Operation failures, ERP errors
- **unknown**: Unclassified errors

## 📊 Use Cases

### 1. **Daily Operations Review**
- Ingest today's logs
- Check error rate vs baseline
- Identify new error types
- Prioritize critical issues

### 2. **Incident Investigation**
- Load logs from incident timeframe
- Analyze error frequency spikes
- Identify affected operations
- Correlate with external events

### 3. **Capacity Planning**
- Review hourly error distribution
- Identify peak load periods
- Plan scaling or maintenance windows
- Optimize resource allocation

### 4. **System Health Monitoring**
- Track cumulative error growth
- Compare week-over-week trends
- Monitor severity distribution
- Detect anomalies

### 5. **Multi-Country Comparison**
- Ingest logs from all countries
- Compare error rates globally
- Identify country-specific issues
- Share best practices

## 🛠️ Advanced Features

### Real-Time Updates
The dashboard loads data into memory for instant analysis. To refresh with new logs:
1. Click "🗑️ Clear All"
2. Re-scan and re-ingest

### Performance Optimization
- Logs stored in memory (no database required)
- Analysis results cached until data changes
- Efficient parsing with regex patterns
- Supports thousands of log entries

### Data Export
While built-in export isn't yet available, you can:
- Use browser dev tools to copy chart data
- Print dashboard to PDF
- Screenshot charts for reports

## 🐛 Troubleshooting

### Issue: "Path does not exist"
**Solution**: 
- Verify base path is correct
- Use absolute paths with proper escaping (double backslashes on Windows)
- Ensure directory is accessible

### Issue: No logs discovered
**Solution**:
- Check directory structure matches expected format
- Verify log files have .log, .txt, or .xml extensions
- Ensure files contain actual log data

### Issue: Parsing errors
**Solution**:
- Check log format matches Sana Commerce standard
- Review error messages in ingest status
- Verify timestamp format is [YYYY-MM-DD HH:mm:ss]

### Issue: Slow performance
**Solution**:
- Process one country at a time instead of all
- Clear old logs before ingesting new ones
- Consider filtering date ranges in future versions

## 📚 API Integration

For programmatic access:

```javascript
// Scan for logs
const scanResponse = await fetch('/api/logs/scanDirectories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    basePath: 'C:\\logs' 
  }),
});

// Ingest specific country
const ingestResponse = await fetch('/api/logs/ingestFromPath', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderPath: 'C:\\logs\\australia\\prod',
    country: 'australia',
    environment: 'PROD',
  }),
});

// Get analysis
const analysisResponse = await fetch('/api/logs/analysis');
const data = await analysisResponse.json();
console.log(data.analysis);
```

## 🔮 Future Enhancements

Planned features:
- [ ] Custom date range filtering
- [ ] Export to CSV/PDF
- [ ] Heatmap visualization (day vs hour)
- [ ] Box plot for distribution analysis
- [ ] Real-time log streaming
- [ ] Email alerts for error thresholds
- [ ] Historical trend comparisons
- [ ] Machine learning anomaly detection
- [ ] Integration with ticketing systems
- [ ] Scheduled automated analysis

## 📞 Support

For issues or questions:
1. Check this guide thoroughly
2. Review browser console for errors
3. Verify API responses in Network tab
4. Ensure log format is compatible

---

**Version**: 2.1.0 (Log Analysis Release)  
**Last Updated**: February 22, 2026  
**Status**: ✅ Production-Ready - Log Analysis Dashboard Operational
