# Quick Start - New Log Analysis Features

## What's New? 🎉

### 3 New Components Added to Log Analysis Dashboard

#### 1️⃣ Server Capacity Information
**What it shows**: Server limits and capabilities before you analyze
- Max 1,000 files per session
- Max 10M entries per session
- Max 512 MB per file
- Processing speed: 50 MB/s
- Session timeout: 5 minutes
- Supported formats: .log, .txt, .xml, .csv

**Where**: Appears after you enter the data source path

#### 2️⃣ File Ingestion Information
**What it shows**: File format support and processing examples
- Supported formats with visual indicators
- File size limits and processing speeds
- Realistic time estimates:
  - 10 MB file → ~2 seconds
  - 100 MB file → ~20 seconds
  - 500 MB file → ~100 seconds
- Helpful tips for optimal performance

**Where**: Displayed right after Server Capacity card

#### 3️⃣ Real-time Progress Bar
**What it shows**: Live progress during analysis with realistic time estimates
- Overall completion percentage (0-100%)
- Current processing phase name
- Time remaining (continuously updated)
- Files processed count
- Log entries found count
- Processing speed (files/second)
- Per-phase progress bars
- Estimated total time

**When**: Appears while analysis is running

---

## User Experience Flow

```
1. OPEN PAGE
   ↓ (Server capacity loads)
   
2. VIEW CAPACITY INFO
   ✓ See max limits (1000 files, 10M entries)
   ✓ See file formats (.log, .txt, .xml, .csv)
   ✓ See processing speeds (50 MB/s)
   
3. VIEW INGESTION INFO
   ✓ See format support with visual cards
   ✓ See example processing times
   ✓ Get performance tips
   
4. SELECT FILES & START ANALYSIS
   ↓ (Click "Analyze")
   
5. WATCH PROGRESS
   ✓ See overall % complete
   ✓ See current phase: "Reading & parsing"
   ✓ See files/entries processed
   ✓ See estimated time remaining
   ✓ Watch phase completion indicators
   
6. ANALYSIS COMPLETE
   ✓ View results
   ✓ Export visualizations
   ✓ Filter by country/environment
```

---

## Key Information Users See

### BEFORE Analysis
✅ What file formats work  
✅ Max file size (512 MB)  
✅ Max files per session (1,000)  
✅ Processing speed estimates  
✅ Time estimate for file size  
✅ Current server load  

### DURING Analysis
✅ Current phase name  
✅ Overall progress %  
✅ Files processed / total  
✅ Entries found count  
✅ Processing speed (now)  
✅ Time remaining (estimated)  
✅ Per-phase progress  

---

## Processing Speed Cheat Sheet

| File Size | Entries | Time |
|-----------|---------|------|
| 100 KB | 1,000 | 0.1s |
| 10 MB | 100K | 2s |
| 100 MB | 1M | 20s |
| 500 MB | 5M | 100s |

**= SPEED: 50 MB/sec**

---

## The 4 Processing Phases

As analysis runs, users see progress through phases:

1. **Discovering Files** (5% of time)
   - Quick directory scan
   - Finds all log files

2. **Reading & Parsing** (65% of time) ← LONGEST PHASE
   - Reads files from disk
   - Parses log entries
   - Extracts data

3. **Processing Entries** (20% of time)
   - Analyzes patterns
   - Calculates errors
   - Groups data

4. **Generating Analysis** (10% of time)
   - Prepares visualizations
   - Finalizes results

---

## Server Limits (Can't Exceed)

🔴 **Hard Limits**
- Max 1,000 files per session
- Max 10,000,000 entries per session
- Max 512 MB per file
- Max 5 concurrent sessions
- Max 300 seconds (5 min) timeout

---

## Status Indicators

**Green** = Good/Optimal
- ≤ 50% server capacity
- Files under 200 MB

**Yellow** = Caution
- 50-80% server capacity
- Consider splitting load

**Red** = High
- > 80% server capacity
- Wait before analyzing

---

## Tips for Best Performance

⚡ **Quick Tips**
- Keep files under 200 MB (max 512 MB)
- Process different countries separately
- Use bulk import for many files
- Check server capacity before starting
- Don't close tab during analysis

---

## What Users See On Page Load

```
┌──────────────────────────────────────┐
│  ✓ Server Capacity & Configuration   │
│  - Max files: 1,000                  │
│  - Max entries: 10.0M                │
│  - Max file: 512 MB                  │
│  - Speed: 50 MB/s                    │
│  - Session timeout: 300 sec          │
│  - Supported: .log .txt .xml .csv    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  📄 File Ingestion & Formats         │
│  Supported Formats                   │
│  [.log] [.txt] [.xml] [.csv]         │
│                                      │
│  Processing Performance              │
│  50 MB/s | 50K entries/s             │
│                                      │
│  Example Times                       │
│  10 MB → 2 sec                       │
│  100 MB → 20 sec                     │
│  500 MB → 100 sec                    │
└──────────────────────────────────────┘
```

---

## What Users See During Analysis

```
┌──────────────────────────────────────┐
│  ↻ Analysis in Progress      45% done│
│     Reading & parsing                │
├──────────────────────────────────────┤
│  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│  45% complete | ~30 seconds left     │
│                                      │
│  Files: 45/100 | Entries: 450K      │
│  Speed: 4.5 files/sec                │
│  Total Est: 60 seconds               │
│                                      │
│  Phase Progress:                     │
│  ✓ Discovering files                 │
│  ■■■ Reading & parsing ← Now         │
│  □□□ Processing entries              │
│  □□□ Generating analysis             │
└──────────────────────────────────────┘
```

---

## Don't Do This ❌

❌ Close the browser tab during analysis  
❌ Refresh the page while analyzing  
❌ Analyze files > 512 MB  
❌ Exceed 1,000 files in one session  
❌ Use unsupported file formats  
❌ Navigate to another page  

---

## DO This ✅

✅ Check server capacity first  
✅ Verify file format (.log, .txt, .xml, .csv)  
✅ Keep files under 200 MB for speed  
✅ Use directory scanning for bulk files  
✅ Wait for "5 min" timeout if needed  
✅ Export results after completion  

---

## Technical Stack

- **React 19.x** - Component library
- **Next.js 16.x** - Framework
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Recharts** - Chart visualization

---

## File Formats Supported

| Format | Type | Example |
|--------|------|---------|
| .log | Text log file | sana_error_2024.log |
| .txt | Plain text file | logs.txt |
| .xml | XML structured | events.xml |
| .csv | Comma-separated values | data.csv |

---

## Questions?

**Q: How long will analysis take?**  
A: Depends on file size. Use estimate: 50 MB/sec. Example: 100 MB file ≈ 20 seconds.

**Q: Can I analyze during analysis?**  
A: No, wait for completion (max 5 minutes).

**Q: What if analysis stops?**  
A: Refresh page, data clears. Session timeout is 5 minutes max.

**Q: Can I cancel analysis?**  
A: Refresh page (loses progress).

**Q: What happens if file > 512 MB?**  
A: Won't be processed. Split into smaller files.

---

## Version Info

**Feature Release**: February 24, 2026  
**Components Added**: 3  
**New Files**: 4  
**API Endpoints**: 1  
**Status**: ✅ Production Ready

---

**Need Help?** See `USAGE_GUIDE_NEW_FEATURES.md` for detailed guide
