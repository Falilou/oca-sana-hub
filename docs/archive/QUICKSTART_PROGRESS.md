# Quick Start: Using the Progress Bar

## How to See the Progress Bar in Action

### Step 1: Start the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Step 2: Navigate to Logs Page

Click on the **Logs** link in the navigation or go directly to:
```
http://localhost:3000/logs
```

### Step 3: Ingest Logs with Progress

1. Find the **"Batch ingest folder"** section (top right of the page)
2. Enter a folder path containing log files, for example:
   ```
   C:\logs\SANA_LOGS\PROD
   ```
   Or any folder with `.txt` log files

3. Click the **"Ingest"** button

4. **Watch the magic happen!** 🎉

## What You'll See

### Phase 1: Scanning Directories
```
🔍 Scanning directories... (5 scanned, 12 log files found)
Progress: 0%

📊 Stats:
  Directories: 5
  Files Found: 12
  Processed: 0
```

### Phase 2: Files Discovered
```
📂 Discovered 45 log files in 15 directories. Starting ingestion...
Progress: 0%
```

### Phase 3: Processing Files
```
⚙️ Processing files... 10/45 (22%) - 234 entries
Progress: 22%
Current File: sana_log_2024-02-15.txt

📊 Stats:
  Directories: 15
  Files Found: 45
  Processed: 10
  Skipped: 3
  Entries Ingested: 234
```

### Phase 4: Complete!
```
✓ Complete! Ingested 2,347 entries from 45 files (12 skipped)
Progress: 100%

📊 Final Stats:
  Directories: 15
  Files Found: 45
  Processed: 45
  Skipped: 12
  Entries Ingested: 2,347
```

*Progress bar auto-hides after 2 seconds*

## Visual Features

The progress bar shows:

- 🎨 **Color-coded phases** (Blue → Cyan → Yellow → Green)
- 📊 **Live statistics grid** with all metrics
- 📁 **Current file name** being processed
- 📂 **Current directory** being scanned
- 🎯 **Percentage indicator** (large number)
- ⚡ **Animated progress bar** with gradient
- 🔄 **Pulsing dots** during processing
- ✓/✗ **Success/error icons**

## Test Files

If you don't have real log files, create some test files:

```bash
# Windows PowerShell
mkdir C:\test_logs\subfolder1
mkdir C:\test_logs\subfolder2

# Create dummy log files
"Test log entry 1" > C:\test_logs\test1.txt
"Test log entry 2" > C:\test_logs\test2.txt
"Test log entry 3" > C:\test_logs\subfolder1\test3.txt
"Test log entry 4" > C:\test_logs\subfolder2\test4.txt
```

Then ingest: `C:\test_logs`

## What the Progress Bar Tracks

| Metric | Description |
|--------|-------------|
| **Directories Scanned** | Total folders explored (recursive) |
| **Files Found** | Number of .txt files discovered |
| **Processed** | Files successfully ingested |
| **Skipped** | Files unchanged since last ingest |
| **Entries Ingested** | Total log entries added to database |
| **Percentage** | Overall progress (0-100%) |

## Keyboard Shortcuts

- While ingesting, you can:
  - Navigate away (ingestion continues in background)
  - Refresh page (progress resets but ingestion completes)
  - Close tab (ingestion completes server-side)

## Troubleshooting

### Progress bar not showing?
- Check browser console for errors
- Verify `/api/logs/ingest/stream` endpoint exists
- Try the old endpoint: Change code to use `/api/logs/ingest`

### Files not being found?
- Ensure folder path is correct
- Check folder has `.txt` files (case-insensitive)
- Verify read permissions on folder

### Progress stuck at 0%?
- Large folders take time to scan
- Wait for "Discovered" phase message
- Check server logs for errors

## Performance Expectations

| Folder Size | Scan Time | Processing Time |
|-------------|-----------|-----------------|
| 10 files | < 1 second | 1-2 seconds |
| 100 files | 1-2 seconds | 5-10 seconds |
| 1,000 files | 5-10 seconds | 30-60 seconds |
| 10,000 files | 30-60 seconds | 5-10 minutes |

*Times vary based on file sizes and hardware*

## Next Steps

After ingestion completes:
1. View data in the **Overview** section
2. Check **Country Breakdown** table
3. Browse **Log Entries** with filters
4. Set up **Watched Folders** for auto-ingestion

## Advanced: Using the API Directly

```javascript
// JavaScript example - streaming progress
const response = await fetch('/api/logs/ingest/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ folderPath: 'C:\\logs\\SANA_LOGS\\PROD' })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  const lines = text.split('\\n\\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const progress = JSON.parse(line.substring(6));
      console.log(progress.message, progress.percentage + '%');
    }
  }
}
```

---

**Enjoy real-time progress tracking!** 🚀

If you have any issues, check:
- [PROGRESS_TRACKING_COMPLETE.md](PROGRESS_TRACKING_COMPLETE.md) - Full technical docs
- [DATABASE_SOLUTION.md](DATABASE_SOLUTION.md) - Database setup info
- [docs/](docs/) - Project documentation
