# Contentful Title Checker

A TypeScript tool that scans Contentful spaces for entries with missing or empty title information. Identifies content without proper titles across both custom `title` fields and Contentful's designated display fields.

## Features

- **Dual title detection**: Checks both custom `title` fields and Contentful's designated display fields
- **Content type filtering**: Scan all content types or target specific ones (e.g., `blogPost`, `product`)
- **CSV export**: Generate timestamped reports for analysis in Excel/Google Sheets  
- **Complete pagination**: Automatically handles spaces with any number of entries (not limited to 1000)
- **Localization support**: Properly detects empty values across all locales and languages
- **Progress tracking**: Real-time progress updates and summary statistics (entries scanned, with/without titles)
- **Rate limit compliance**: Built-in delays to respect Contentful API limits

## Prerequisites

- Node.js 16+ 
- Contentful Management API token with read access

## Installation

```bash
git clone <repository-url>
cd contentful-scraper
npm install
```

## Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Add your Contentful credentials:

```env
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_MANAGEMENT_TOKEN=your_management_token
```

### Getting Credentials

**Space ID**: Contentful → Settings → General settings  
**Management Token**: Contentful → Settings → API keys → Content management tokens → Generate personal token

## Usage

### Basic Commands

```bash
# Scan all content types
npm run dev

# Scan specific content type  
npm run dev blogPost

# Generate CSV report
npm run dev -- --csv

# Scan specific type and export CSV
npm run dev blogPost -- --csv
```

### Sample Output

```
Scan Results:
- Total entries scanned: 150
- Entries with proper titles: 142
- Entries missing titles: 8

Found 8 entries with empty title or display fields:

1. Entry ID: abc123
   Content Type: blogPost
   Last Updated: 2025-01-15T10:30:00Z
   Display Field (Entry Title): headline
   Display Field Value: null
   Available Fields: slug, body, author
```

### CSV Export

CSV files are timestamped and include:
- Entry ID, Display Field Name/Value, Title Field Value
- Content Type, Available Fields, Last Updated


## Detection Logic

The tool flags entries where **either** condition is true:

1. **Empty title field**: `null`, `undefined`, empty string, or localized object with all empty values
2. **Empty display field**: Same criteria applied to the content type's designated display field

## Content Type IDs

Find content type IDs in Contentful → Content model → API identifier

## Troubleshooting

**Authentication Errors**
- Verify `CONTENTFUL_SPACE_ID` and `CONTENTFUL_MANAGEMENT_TOKEN` in `.env`
- Ensure token has proper permissions and hasn't expired

**Rate Limits**
- Tool includes 200ms delays between requests
- Large spaces (>10k entries) may take several minutes

**No Results Found**
- Check content type ID spelling (case-sensitive)
- Verify entries exist for the specified content type
