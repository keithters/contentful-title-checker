import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

config();

interface CSVRow {
  entryId: string;
  displayFieldName: string;
  displayFieldValue: string;
  titleFieldValue: string;
  contentType: string;
  availableFields: string;
  lastUpdated: string;
}

interface UpdatedEntry {
  entryId: string;
  contentType: string;
  changes: {
    displayFieldValue?: {
      before: string;
      after: string;
    };
    titleFieldValue?: {
      before: string;
      after: string;
    };
  };
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split('\n');
  const rows: CSVRow[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = parseCSVLine(line);
    
    if (columns.length >= 7) {
      rows.push({
        entryId: columns[0],
        displayFieldName: columns[1],
        displayFieldValue: columns[2],
        titleFieldValue: columns[3],
        contentType: columns[4],
        availableFields: columns[5],
        lastUpdated: columns[6]
      });
    }
  }
  
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Start or end of quoted field
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add final field
  result.push(current);
  
  return result;
}

function findUpdates(originalRows: CSVRow[], editedRows: CSVRow[]): UpdatedEntry[] {
  const updates: UpdatedEntry[] = [];
  const originalMap = new Map(originalRows.map(row => [row.entryId, row]));
  
  editedRows.forEach(editedRow => {
    const originalRow = originalMap.get(editedRow.entryId);
    
    if (originalRow) {
      const changes: UpdatedEntry['changes'] = {};
      let hasChanges = false;
      
      // Check display field value changes
      if (originalRow.displayFieldValue !== editedRow.displayFieldValue) {
        changes.displayFieldValue = {
          before: originalRow.displayFieldValue,
          after: editedRow.displayFieldValue
        };
        hasChanges = true;
      }
      
      // Check title field value changes
      if (originalRow.titleFieldValue !== editedRow.titleFieldValue) {
        changes.titleFieldValue = {
          before: originalRow.titleFieldValue,
          after: editedRow.titleFieldValue
        };
        hasChanges = true;
      }
      
      if (hasChanges) {
        updates.push({
          entryId: editedRow.entryId,
          contentType: editedRow.contentType,
          changes
        });
      }
    }
  });
  
  return updates;
}

function generateUpdateReport(updates: UpdatedEntry[]): string {
  if (updates.length === 0) {
    return 'No changes detected between the CSV files.';
  }
  
  let report = `Found ${updates.length} entries with changes:\n\n`;
  
  updates.forEach((update, index) => {
    report += `${index + 1}. Entry ID: ${update.entryId}\n`;
    report += `   Content Type: ${update.contentType}\n`;
    
    if (update.changes.displayFieldValue) {
      report += `   Display Field Value:\n`;
      report += `     Before: "${update.changes.displayFieldValue.before}"\n`;
      report += `     After:  "${update.changes.displayFieldValue.after}"\n`;
    }
    
    if (update.changes.titleFieldValue) {
      report += `   Title Field Value:\n`;
      report += `     Before: ${update.changes.titleFieldValue.before}\n`;
      report += `     After:  ${update.changes.titleFieldValue.after}\n`;
    }
    
    report += '\n';
  });
  
  return report;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: npm run csv-diff <original-csv> <edited-csv>');
    console.error('Example: npm run csv-diff empty-titles-2025-08-06.csv empty-titles-edited.csv');
    process.exit(1);
  }
  
  const originalFile = args[0];
  const editedFile = args[1];
  
  try {
    // Check if files exist
    if (!fs.existsSync(originalFile)) {
      console.error(`Error: Original file '${originalFile}' not found`);
      process.exit(1);
    }
    
    if (!fs.existsSync(editedFile)) {
      console.error(`Error: Edited file '${editedFile}' not found`);
      process.exit(1);
    }
    
    console.log(`Comparing CSV files:`);
    console.log(`  Original: ${originalFile}`);
    console.log(`  Edited:   ${editedFile}\n`);
    
    // Read and parse CSV files
    const originalContent = fs.readFileSync(originalFile, 'utf8');
    const editedContent = fs.readFileSync(editedFile, 'utf8');
    
    const originalRows = parseCSV(originalContent);
    const editedRows = parseCSV(editedContent);
    
    console.log(`Original file: ${originalRows.length} entries`);
    console.log(`Edited file:   ${editedRows.length} entries\n`);
    
    // Find updates
    const updates = findUpdates(originalRows, editedRows);
    
    // Generate and display report
    const report = generateUpdateReport(updates);
    console.log(report);
    
    // Optionally save report to file
    const reportFile = `update-report-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    fs.writeFileSync(reportFile, report);
    console.log(`Report saved to: ${reportFile}`);
    
  } catch (error) {
    console.error('Error processing CSV files:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { findUpdates, parseCSV, UpdatedEntry };