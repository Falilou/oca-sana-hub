# Startup Ingestion Troubleshooting Guide

## Issue: Page shows 0 results despite having log files

If you're seeing log directories with files but the analysis shows 0 results, follow these steps to diagnose the issue.

---

## 🔍 Step 1: Check the Status Message

When the app loads, you should see a **blue status message** below the query builder. This message will tell you exactly what happened during automatic ingestion.

**Expected successful message** (shows when it works):
```
✅ Automatic ingestion complete!
Files processed: 296
Parsed entries: 5,234
Ingested: 5,234
Total in DB: 5,234
Countries: australia, colombia
Environments: PROD
```

**If you see 0 results**, the message will indicate why. Check for these patterns:

### Message: "Startup ingestion error"
- Click browser's **F12 → Console tab**
- Look for `[Startup]` log messages
- These will show the exact error

### Message: "Logs ready. Click Ingest New Files"
- Startup ingestion skipped (basePath might be empty on first load)
- Click **"Ingest New Files"** button to manually trigger ingestion

---

## 🔧 Step 2: Verify basePath is Correct

1. Look at the **text input field** at the top (dark blue box)
2. It should contain your logs directory path
3. Example: `C:\Users\falseck\OneDrive - Capgemini\Documents\Michelin\...`
4. If empty, type or paste the path to your SANA_LOGS directory
5. After you type a new path, **ingestion will automatically retry**

---

## 📊 Step 3: Check Directory Structure

Your logs directory should have this structure:

**Correct Structure:**
```
SANA_LOGS/
├── australia/
│   └── PROD/
│       ├── log1.txt
│       ├── log2.txt
│       └── ...
├── colombia/
│   └── PROD/
│       ├── log1.txt
│       ├── log2.txt
│       └── ...
└── [other countries]/...
```

**Alternative Structure (also supported):**
```
SANA_LOGS/
├── australia-PROD/
│   ├── log1.txt
│   ├── log2.txt
│   └── ...
├── colombia-PROD/
│   ├── log1.txt
│   ├── log2.txt
│   └── ...
└── ...
```

---

## 🔎 Step 4: Open Browser Console

Press **F12** or **Right-Click → Inspect** to open Developer Tools:

1. Click the **Console** tab
2. Look for messages starting with **`[Startup]`**
3. Screenshot these messages if needed for debugging

**Expected log sequence:**
```
[Startup] Triggering automatic log ingestion for basePath: C:\...
[Startup] Found 296 log files to ingest
[Startup] File: australia/PROD/log1.txt → Country: australia, Environment: PROD
[Startup] Parsed 45 log entries from australia/PROD/log1.txt
...
[Startup] Total parsed entries: 5234
[Startup] Added 5234 logs to logAnalysisService
[Startup] Ingestion complete: 5234 entries indexed (5234 total in database)
```

**If you see errors**, they will appear as `[Startup] Error...` messages.

---

## 🚀 Step 5: Manual Ingestion (Fallback)

If automatic ingestion isn't working:

1. Click **"📥 Ingest New Files"** button (purple)
2. Wait for the operation to complete
3. Check the status message for results
4. Then click **"Scan Directories"** to find your logs
5. Select the directories and click **"Analyze"**

---

## 🔄 Step 6: Force Re-Ingestion

To force automatic ingestion to run again:

1. **Reload the page** (F5 or Ctrl+R)
2. This will clear the persisted state and re-run startup ingestion
3. Check the status message and console logs (F12)

---

## ✅ Verification Checklist

- [ ] basePath is set to a valid directory with log files
- [ ] Directory contains subdirectories named after countries (australia, colombia, etc.)
- [ ] Each country directory has PROD or INDUS subdirectories
- [ ] Log files are .txt, .log, or .xml format
- [ ] Status message appears after page loads (5-10 seconds)
- [ ] Status message shows non-zero numbers (parsed entries > 0)
- [ ] Console shows `[Startup]` log messages (F12 → Console)
- [ ] "Scan Directories" finds the log directories
- [ ] "Analyze" button produces results instead of 0

---

## 🐛 Common Issues & Solutions

### Issue: Status message says "Logs ready. Click Ingest New Files"
**Cause**: Startup ingestion didn't run (basePath was empty)
**Solution**: 
1. Make sure the path input field is filled
2. Or manually click "Ingest New Files" button

### Issue: Status message shows 0 files processed
**Cause**: Directory path exists but contains no log files
**Solution**:
1. Check that basePath points to the correct directory
2. Verify subdirectories exist with log files
3. Check file permissions (files must be readable)

### Issue: Status message shows "Ingestion failed"
**Cause**: Error during log parsing or ingestion
**Solution**:
1. Check console (F12) for detailed error
2. Try clicking "Ingest New Files" manually
3. Try a different directory with fewer files
4. Check file format (should be text-based logs)

### Issue: Results still show 0 despite successful ingestion
**Cause**: Logs ingested but analysis not querying correctly
**Solution**:
1. Open console and look for errors
2. Try clicking "Scan Directories" and "Analyze"
3. Refresh page (F5) and try again
4. Check that selected country/environment filters match your logs

---

## 📈 Expected Performance

**For 296 files (~5,234 entries):**
- Startup ingestion time: 3-5 seconds
- First analysis after ingestion: 1-2 seconds
- Subsequent analyses: <1 second
- File change detection: Every 15 seconds

---

## 💡 Pro Tips

1. **Faster feedback**: Open browser DevTools (F12) BEFORE page loads to capture all log messages
2. **Test with smaller dataset**: Try with just one country directory first
3. **Check file permissions**: Ensure the process can read log files
4. **Look for patterns**: All log entries must have "Timestamp:" field to be parsed

---

## 🆘 If Still Not Working

1. Copy all messages from **F12 → Console** tab that start with `[Startup]`
2. Copy the **status message** from the page
3. Note your **basePath** (directory path)
4. Share these details for debugging

---

## 📋 Test Queries

After successful ingestion, you should be able to:

1. **See countries listed** in the "Country" dropdown filter
2. **See environments listed** in the "Environment" dropdown filter
3. **Click "Scan Directories"** and see log files found
4. **Run Analysis** and see results with:
   - Total requests > 0
   - Total errors > 0
   - Graphs and charts populated
   - Time breakdowns by hour/day

---

**Date Updated**: February 24, 2026  
**Status**: Updated troubleshooting guide

