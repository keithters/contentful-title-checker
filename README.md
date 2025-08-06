# Contentful Scraper

A TypeScript application that scans a Contentful space for entries with missing or empty title information. It checks both custom `title` fields and Contentful's designated display fields (entry titles) to help you identify content that needs attention.

## What This Tool Does

This tool helps you find problematic entries in your Contentful space by scanning for:

1. **Empty `title` fields** - Custom title fields that are null, empty, or contain only empty localized values
2. **Empty display fields** - Contentful's designated "entry title" field (the field shown in the web app as the entry name)
3. **Content type filtering** - Scan specific content types or all content types
4. **CSV export** - Generate spreadsheet-friendly reports for analysis

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Contentful Management Token (with read access to your space)

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd contentful-scraper
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Contentful credentials:
   ```
   CONTENTFUL_SPACE_ID=your_space_id_here
   CONTENTFUL_MANAGEMENT_TOKEN=your_management_token_here
   ```

### Getting Your Credentials

#### Space ID
1. Log into Contentful
2. Go to your space
3. Navigate to Settings > General settings
4. Copy the Space ID

#### Management Token
1. In your Contentful space, go to Settings > API keys
2. Click "Content management tokens" tab
3. Click "Generate personal token"
4. Give it a name and copy the token
5. **Important**: This token has write access - keep it secure!

## Usage

### Quick Start

The fastest way to get started:

```bash
# Install dependencies
npm install

# Scan all content types (development mode)
npm run dev

# Scan a specific content type
npm run dev blogPost

# Generate a CSV report
npm run dev -- --csv
```

### Command Reference

#### Development Mode (Recommended)
Uses TypeScript directly with ts-node - faster for development and testing:

```bash
# Scan all content types
npm run dev

# Scan specific content type
npm run dev <content-type-id>

# Generate CSV report for all content types
npm run dev -- --csv

# Generate CSV report for specific content type
npm run dev <content-type-id> -- --csv
```

#### Production Mode
Compiles TypeScript to JavaScript first:

```bash
# Build the project
npm run build

# Scan all content types
npm start

# Scan specific content type  
npm start <content-type-id>

# Generate CSV report
npm start -- --csv
```

#### Available Commands Summary

| Command | Description |
|---------|-------------|
| `npm run dev` | Run in development mode (all content types) |
| `npm run dev <content-type>` | Scan specific content type in dev mode |
| `npm run dev -- --csv` | Generate CSV report in dev mode |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Build and run compiled version |
| `npm start <content-type>` | Build and run with content type filter |
| `npm start -- --csv` | Generate CSV report (production mode) |
| `npm run clean` | Remove compiled JavaScript files |

### Understanding the Output

#### Console Output
For each problematic entry, you'll see:
- **Entry ID**: Contentful's unique identifier
- **Content Type**: The content model name
- **Last Updated**: When the entry was last modified
- **Title Field Value**: The raw value of the `title` field (including localization structure)
- **Display Field (Entry Title)**: Which field Contentful uses as the entry title
- **Display Field Value**: The actual value of the display field
- **Available Fields**: All fields present on this entry

#### CSV Output
When using `--csv`, a timestamped file is created (e.g., `empty-titles-2025-08-06T10-30-45-123Z.csv`) with columns:
- Entry ID
- Display Field Value (clean text, no JSON/localization)
- Display Field Name
- Title Field Value (raw JSON)
- Content Type
- Available Fields (semicolon-separated)
- Last Updated

### What Gets Detected

The scanner finds entries where **either** condition is true:

1. **Empty `title` field**:
   - Field is `null` or `undefined`
   - Field is an empty string `""`
   - Field is a localized object with all empty values: `{"en-US": "", "es": ""}`

2. **Empty display field**:
   - The content type's designated display field is empty using the same criteria above
   - No display field is configured for the content type

### Content Type IDs

To find your content type IDs:
1. Go to Contentful web app
2. Navigate to Content model
3. The content type ID is shown in the URL and in the API identifier field

## Features

- **Dual Title Detection**: Checks both custom `title` fields and Contentful's display fields
- **Localization Support**: Properly handles localized content across all locales
- **Content Type Filtering**: Scan all content or focus on specific content types
- **CSV Export**: Generate spreadsheet reports for data analysis
- **TypeScript**: Full type safety and modern development experience
- **Batch Processing**: Efficiently scans up to 1000 entries per run
- **Detailed Reporting**: Shows field values, content types, and modification dates

## Common Use Cases

- **Content Audit**: Find entries missing proper titles before publishing
- **SEO Review**: Ensure all content has meaningful titles for search engines  
- **Content Migration**: Identify entries that need title cleanup during CMS migrations
- **Quality Assurance**: Regular checks to maintain content quality standards
- **Bulk Operations**: Generate CSV reports to plan bulk content updates

## SmugMug Album Metadata

A separate TypeScript utility is included to fetch metadata from SmugMug albums using either album ID or URL:

### Using Album ID
```bash
npm run smugmug 123456789
```

### Using Album URL
```bash
npm run smugmug https://yoursite.smugmug.com/Album-Name
```

### Alternative direct execution
```bash
npx ts-node src/smugmug-metadata.ts 123456789
```

This will fetch and display:
- Album title and description
- Image count and keywords
- Privacy settings
- Creation and modification dates
- Download permissions

## Troubleshooting

### Common Issues

**"Not Found" Error**
- Verify your `CONTENTFUL_SPACE_ID` is correct
- Ensure your `CONTENTFUL_MANAGEMENT_TOKEN` has access to the space
- Check that the space exists and you have permissions

**No Entries Found**
- Your content might already have proper titles (good news!)
- Try running without content type filter to scan all content
- Verify the content type ID is correct (case-sensitive)

**Permission Errors**
- Management tokens need appropriate permissions
- Ensure the token hasn't expired
- Regenerate the token if needed

### Rate Limits

The Contentful Management API has rate limits:
- 7 requests per second for most operations
- This tool fetches content types and entries in separate requests
- Large spaces may need multiple runs or custom pagination

## Development & Extension

The codebase is structured for easy extension:

### Architecture
- `src/index.ts` - Main scanning logic
- `src/smugmug-metadata.ts` - SmugMug utility (separate feature)
- TypeScript with full type safety
- Uses Contentful Management API for write capabilities

### Potential Extensions
- **Content Updates**: Add functionality to fix empty titles automatically
- **Bulk Operations**: Extend to handle more than 1000 entries with pagination  
- **Field Validation**: Check other required fields beyond titles
- **Content Publishing**: Identify unpublished content with title issues
- **Asset Management**: Extend to check asset titles and descriptions
- **Webhook Integration**: Set up automated checks when content is saved

### Development Setup
```bash
# Install dependencies
npm install

# Run in watch mode for development
npm run dev

# Compile and check types
npm run build

# Clean compiled files
npm run clean
```