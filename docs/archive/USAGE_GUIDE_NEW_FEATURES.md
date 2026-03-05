# Usage Guide: New Log Analysis Features

## Getting Started

### Step 1: Access the Log Analysis Dashboard
- Navigate to the **Log Analysis** page from the main navigation
- The page will automatically load server capacity information

### Step 2: Review Server Capacity Information
Before you start, you'll see:

**Server Capacity & Configuration Card** (top of page)
- Maximum files you can process in one session: **1,000 files**
- Maximum total entries: **10 million entries**
- Maximum file size: **512 MB per file**
- Processing speed: **50 MB/second**
- Session timeout: **5 minutes (300 seconds)**
- Active sessions indicator showing server load

**File Ingestion & Formats Card**
- Supported file formats: `.log`, `.txt`, `.xml`, `.csv`
- Processing speed metrics:
  - 50 MB/s (megabytes per second)
  - 50,000 entries/second
  - 10 files/second
- Example processing times for reference

### Step 3: Verify Your Files Meet Requirements
Before initiating analysis, ensure:
- ✅ Each file is **under 512 MB**
- ✅ Files are in a **supported format** (.log, .txt, .xml, .csv)
- ✅ Total files are **under 1,000**
- ✅ You're not running other intensive analyses

### Step 4: Enter Data Source Path
- Input your directory path containing log files
- Example: `C:\Users\...\Documents\SANA_LOGS`

### Step 5: Scan Directories
- Click **"Scan Directories"** button
- Server discovers all log files
- Shows summary of found files and sources

### Step 6: Select Log Sources
- Select which log sources to analyze
- By default, all discovered sources are checked
- You can deselect specific sources if preferred

### Step 7: Start Analysis
- Click **"Analyze [X] Selected"** button
- Analysis begins immediately

## During Analysis

### Progress Bar Components

**Overall Progress Indicator**
- Large percentage displayed (top right)
- Increments smoothly as analysis progresses
- Gradient bar showing visual progress

**Current Phase Display**
- Shows which phase is currently running:
  - "Discovering files" (first 5%)
  - "Reading & parsing" (next 65%) ← Longest phase
  - "Processing entries" (next 20%)
  - "Generating analysis" (final 10%)

**Real-time Metrics Box**
Shows four key metrics:
1. **Files Processed**: X of Y files (with progress bar)
2. **Entries Found**: Current count in thousands (K)
3. **Speed**: Current processing rate (files/second)
4. **Total Time**: Estimated total time remaining

**Phase Progress Indicators**
- Each phase shows a mini progress bar
- Completed phases show checkmarks (✓)
- Current phase shows animated gradient
- Future phases show empty

### Time Estimates

The system calculates:
- **Elapsed Time**: How long analysis has been running
- **Remaining Time**: Automatically adjusted based on actual speed
- **Total Time**: Estimated total for entire analysis

**Example**: If you have 100 files and the system processes 5 files per second:
- 100 files ÷ 5 files/second = 20 seconds total
- But 1.2x overhead multiplier is applied for analysis phase
- Estimated total: ~24 seconds

### What NOT to Do During Analysis

⚠️ **Do NOT**:
- Close the browser tab
- Refresh the page
- Navigate to another page
- Close the browser window
- Disconnect from the network
- Put your computer to sleep

### Interrupting Analysis

If you need to stop analysis:
1. Refresh the page (will lose current progress)
2. All data will be cleared
3. You can start a new analysis

## After Analysis Completes

Once analysis finishes, you'll see:

1. ✅ **Completion Message**: "Analysis complete! Found X errors in Y entries"
2. 📊 **Results Panels**: All analysis charts and data
3. 🎨 **Export Options**: Download individual charts or all as ZIP
4. 🔄 **Filter Options**: Filter results by country, environment, date range
5. **New Analysis Button**: Start fresh analysis

## Performance Tips

### For Optimal Speed

1. **File Size**
   - Keep individual files under 200 MB (max 512 MB)
   - Larger files take longer to process
   - Estimate: 1 MB = 0.02 seconds

2. **File Count**
   - Fewer files = faster analysis
   - Process files in batches if > 500 files
   - Estimate: 1 file = 0.1 seconds

3. **Server Load**
   - Check capacity indicator before starting
   - Only 5 concurrent sessions allowed
   - Wait if server is at high capacity

4. **Network**
   - Ensure stable internet connection
   - 5-minute timeout for single analysis
   - Long analyses might be interrupted

### Processing Time Estimates

Based on example data:

| File Size | # of Entries | Est. Time |
|-----------|-------------|-----------|
| 100 KB | ~1,000 | ~0.1 sec |
| 1 MB | ~10,000 | ~1 sec |
| 10 MB | ~100,000 | ~2 sec |
| 50 MB | ~500,000 | ~10 sec |
| 100 MB | ~1,000,000 | ~20 sec |
| 200 MB | ~2,000,000 | ~40 sec |
| 500 MB | ~5,000,000 | ~100 sec |

**Note**: Times include 1.2x overhead for analysis phase. Actual times may vary.

## Understanding the Progress Phases

### Phase 1: Discovering Files (5%)
- Scans directories
- Identifies log files
- **Duration**: Very quick (< 1 second typically)
- **Status**: ✓ Completed first

### Phase 2: Reading & Parsing (65%)
- **This is the longest phase**
- Reads each file from disk
- Parses log entries
- Extracts metadata
- **Duration**: Longest, depends on total data size
- **Status**: Current phase indicator here

### Phase 3: Processing Entries (20%)
- Analyzes parsed entries
- Calculates statistics
- Finds error patterns
- Groups by country/environment
- **Duration**: Fast
- **Status**: Shows when file parsing done

### Phase 4: Generating Analysis (10%)
- Aggregates results
- Prepares visualizations
- Finalizes data structures
- **Duration**: Quick
- **Status**: Final processing

## Advanced Features

### Date Range Filtering
- Optionally filter logs by date range
- Start date: "From" optional
- End date: "To" optional
- Can apply after initial analysis

### Country & Environment Filters
- After initial analysis, filter by:
  - Specific country (e.g., Colombia)
  - Environment (e.g., PROD, INDUS)
  - Both simultaneously

### Export Options
- **Individual Charts**: Download specific visualization as PNG
- **All Charts**: Export all charts as ZIP file
- **Python Visualizations**: Generate additional dashboards

## Troubleshooting

### Analysis is Stuck
- Wait up to 5 minutes
- If still stuck, refresh page (loses progress)

### "No logs found" Message
- Check file path is correct
- Verify files are in supported format
- Ensure date range isn't too restrictive
- Try without date range first

### Server Shows High Capacity
- Wait for other sessions to complete
- Only 5 concurrent sessions allowed
- Try again after a few minutes

### Processing Seems Slow
- Check system resources
- Could be disk I/O limitation
- Large files naturally take longer
- Check server capacity indicator

### Progress Bar Not Updating
- This is normal during "Discovering files" phase
- Wait for "Reading & parsing" phase
- Bar updates every 100ms during parsing

## Quick Reference

**Maximum Limits**
- Files per session: 1,000
- Entries total: 10,000,000 (10M)
- File size: 512 MB each
- Concurrent sessions: 5
- Timeout: 300 seconds (5 min)

**Supported Formats**
- .log
- .txt
- .xml
- .csv

**Processing Rates**
- 50 MB/second
- 50,000 entries/second
- 10 files/second

**Phases**
1. Discovering files (~5%)
2. Reading & parsing (~65%)
3. Processing entries (~20%)
4. Generating analysis (~10%)

---

**Last Updated**: February 24, 2026
**Version**: 1.0
