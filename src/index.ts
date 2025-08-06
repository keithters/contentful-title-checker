import { createClient } from 'contentful-management';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config();

interface EntryMetadata {
  id: string;
  contentType: string;
  updatedAt: string;
  titleValue: any;
  displayFieldName: string | undefined;
  displayFieldValue: any;
  fields: Record<string, any>;
}

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN!
});

// Parse command line arguments
const args = process.argv.slice(2);
const csvFlag = args.includes('--csv');
const contentType: string | undefined = args.find(arg => !arg.startsWith('--'));

function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function extractPlainValue(value: any): string {
  if (!value) return '';
  
  // If it's a localized object (e.g., {"en-US": "Some value"})
  if (typeof value === 'object' && !Array.isArray(value)) {
    const values = Object.values(value).filter(v => v && v !== '');
    return values.length > 0 ? String(values[0]) : '';
  }
  
  return String(value);
}

function generateCSV(entries: EntryMetadata[]): string {
  const headers = [
    'Entry ID',
    'Display Field Value',
    'Display Field Name',
    'Title Field Value',
    'Content Type',
    'Available Fields',
    'Last Updated'
  ];
  
  const rows = entries.map(entry => [
    entry.id,
    extractPlainValue(entry.displayFieldValue),
    entry.displayFieldName || '',
    JSON.stringify(entry.titleValue),
    entry.contentType,
    Object.keys(entry.fields).join('; '),
    entry.updatedAt
  ]);
  
  return [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
}

async function scanForEmptyTitles(targetContentType?: string, outputCSV: boolean = false): Promise<void> {
  try {
    if (targetContentType) {
      console.log(`Scanning Contentful space for ${targetContentType} entries with empty title or display fields...\n`);
    } else {
      console.log('Scanning Contentful space for entries with empty title or display fields...\n');
    }

    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID!);
    const environment = await space.getEnvironment('master');
    
    const queryParams: Record<string, any> = {
      limit: 1000
    };
    
    if (targetContentType) {
      queryParams['content_type'] = targetContentType;
    }
    
    const entries = await environment.getEntries(queryParams);

    // Get content types to find display fields
    const contentTypes = await environment.getContentTypes();
    const contentTypeMap = new Map(
      contentTypes.items.map(ct => [ct.sys.id, ct.displayField])
    );

    const emptyTitleEntries: EntryMetadata[] = [];

    entries.items.forEach(entry => {
      const title = entry.fields.title;
      const displayFieldName = contentTypeMap.get(entry.sys.contentType.sys.id);
      const displayFieldValue = displayFieldName ? entry.fields[displayFieldName] : undefined;
      
      const titleIsEmpty = !title || title === '' || (typeof title === 'object' && Object.values(title).every(val => !val || val === ''));
      const displayFieldIsEmpty = !displayFieldValue || displayFieldValue === '' || (typeof displayFieldValue === 'object' && Object.values(displayFieldValue).every(val => !val || val === ''));
      
      if (titleIsEmpty || displayFieldIsEmpty) {
        emptyTitleEntries.push({
          id: entry.sys.id,
          contentType: entry.sys.contentType.sys.id,
          updatedAt: entry.sys.updatedAt,
          titleValue: title,
          displayFieldName,
          displayFieldValue,
          fields: entry.fields
        });
      }
    });

    const typeFilter = targetContentType ? ` ${targetContentType}` : '';
    console.log(`Found ${emptyTitleEntries.length}${typeFilter} entries with empty title or display fields:\n`);

    if (outputCSV) {
      const csvContent = generateCSV(emptyTitleEntries);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `empty-titles-${timestamp}.csv`;
      
      fs.writeFileSync(filename, csvContent);
      console.log(`CSV file saved as: ${filename}`);
      console.log(`File contains ${emptyTitleEntries.length} entries`);
    } else {
      emptyTitleEntries.forEach((entry, index) => {
        console.log(`${index + 1}. Entry ID: ${entry.id}`);
        console.log(`   Content Type: ${entry.contentType}`);
        console.log(`   Last Updated: ${entry.updatedAt}`);
        console.log(`   Title Field Value: ${JSON.stringify(entry.titleValue)}`);
        
        if (entry.displayFieldName) {
          console.log(`   Display Field (Entry Title): ${entry.displayFieldName}`);
          console.log(`   Display Field Value: ${JSON.stringify(entry.displayFieldValue)}`);
        } else {
          console.log(`   Display Field (Entry Title): Not set`);
        }
        
        console.log(`   Available Fields: ${Object.keys(entry.fields).join(', ')}`);
        console.log('');
      });

      if (emptyTitleEntries.length === 0) {
        const typeFilter = targetContentType ? ` ${targetContentType}` : '';
        console.log(`No${typeFilter} entries found with empty title or display fields.`);
      }
    }

  } catch (error) {
    console.error('Error scanning Contentful space:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.message.includes('Not Found')) {
      console.error('Please check your CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN');
    }
  }
}

scanForEmptyTitles(contentType, csvFlag);