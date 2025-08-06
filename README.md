# Contentful Title Checker

**Find content in your Contentful space that's missing titles.**

This tool scans your Contentful website content and creates a report showing which articles, pages, or other content are missing titles. Perfect for content audits and quality checks.

## What You'll Need

- A computer with internet access
- Your Contentful login details
- 10 minutes to set up

## What This Tool Does

✅ **Finds missing titles** - Identifies content without proper titles  
✅ **Checks all content types** - Scans blog posts, pages, products, etc.  
✅ **Creates Excel-friendly reports** - Exports results you can open in spreadsheets  
✅ **Shows progress** - Tells you how much content has proper titles vs. missing titles

## Step-by-Step Setup

### Step 1: Download Node.js
1. Go to [nodejs.org](https://nodejs.org)
2. Download the version marked "Recommended for Most Users"  
3. Install it (keep clicking "Next" with default settings)
4. Restart your computer

### Step 2: Download This Tool
1. Click the green "Code" button at the top of this page
2. Select "Download ZIP"
3. Unzip the file to your Desktop
4. You should now have a folder called `contentful-scraper`

### Step 3: Install the Tool
1. **Windows**: Press `Windows key + R`, type `cmd`, press Enter
2. **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
3. Type these commands one at a time (press Enter after each):
   ```
   cd Desktop/contentful-scraper
   npm install
   ```
4. Wait for it to finish (might take a few minutes)

### Step 4: Get Your Contentful Information

#### Get Your Space ID
1. Log into [contentful.com](https://contentful.com)
2. Click on your website/space name
3. Click "Settings" in the top menu
4. Click "General settings"
5. Copy the "Space ID" (looks like: abc123def456)

#### Get Your Access Token
1. Still in Contentful, click "Settings" → "API keys"
2. Click the "Content management tokens" tab
3. Click "Generate personal token"
4. Enter a name like "Title Checker"
5. Copy the long token that appears
6. **Keep this private!** Don't share it with anyone

### Step 5: Add Your Information
1. In the `contentful-scraper` folder, find the file `.env.example`
2. Make a copy and rename it to `.env` (remove the `.example` part)
3. Open the `.env` file in Notepad (Windows) or TextEdit (Mac)
4. Replace the placeholder text:
   ```
   CONTENTFUL_SPACE_ID=abc123def456
   CONTENTFUL_MANAGEMENT_TOKEN=your_long_token_here
   ```
5. Save the file

## How to Use

### Check All Your Content
1. Open Terminal/Command Prompt again
2. Type: `npm run dev`
3. Press Enter and wait

You'll see something like:
```
Scan Results:
- Total entries scanned: 150
- Entries with proper titles: 142
- Entries missing titles: 8
```

### Create a Spreadsheet Report
1. Type: `npm run dev -- --csv`
2. Press Enter and wait
3. Look in the `contentful-scraper` folder for a file like `empty-titles-2025-08-06...csv`
4. Open this file in Excel or Google Sheets

### Check Only One Content Type
If you only want to check blog posts, products, etc:
1. Type: `npm run dev blogPost` (replace `blogPost` with your content type name)
2. Press Enter

**Need to find your content type names?**
1. Go to Contentful → Content model
2. The name is shown under each content type

## What the Results Mean

The tool will show you:
- **Total entries scanned**: How much content you have
- **Entries with proper titles**: Content that's fine
- **Entries missing titles**: Content that needs attention

For each problem entry, you'll see:
- **Entry ID**: The unique identifier in Contentful
- **Content Type**: What kind of content (blog post, page, etc.)
- **Title problems**: What's missing or empty

## Common Issues

**"Command not found"**
- Make sure you installed Node.js and restarted your computer

**"Not Found" error**
- Double-check your Space ID and token in the `.env` file
- Make sure there are no extra spaces

**"Permission denied"**
- Your token might not have the right access
- Try generating a new token in Contentful

## Need Help?

**The tool isn't working?**
1. Make sure Node.js is installed (try typing `node --version` in Terminal)
2. Check your `.env` file has the right Space ID and token
3. Make sure your Contentful token hasn't expired

**Want to run it regularly?**
- Run the tool once a month to check for new content missing titles
- Use the CSV export to track improvements over time

**Questions about results?**
- Entry ID helps you find the specific content in Contentful
- Content Type tells you what kind of content needs fixing
- Use the spreadsheet to prioritize which content to fix first

---

## For Developers

<details>
<summary>Technical details (click to expand)</summary>

### Features
- Dual title detection (custom fields + display fields)  
- Localization support across all locales
- Content type filtering capabilities
- CSV export with clean data formatting
- Automatic pagination for large content spaces
- Rate limit compliance with Contentful API

### Alternative Commands
```bash
# Development mode (faster)
npm run dev

# Production mode (compiled)
npm start

# Specific content type
npm run dev blogPost

# Generate CSV report  
npm run dev -- --csv
```

### SmugMug Integration
Additional utility for SmugMug album metadata:
```bash
npm run smugmug <album-id-or-url>
```

</details>