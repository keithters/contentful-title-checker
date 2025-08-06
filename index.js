const { createClient } = require('contentful-management');
require('dotenv').config();

const managementClient = createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
});

const contentType = process.argv[2];

async function scanForEmptyTitles(targetContentType) {
  try {
    if (targetContentType) {
      console.log(`Scanning Contentful space for ${targetContentType} entries with empty title fields...\n`);
    } else {
      console.log('Scanning Contentful space for entries with empty title fields...\n');
    }

    const space = await managementClient.getSpace(process.env.CONTENTFUL_SPACE_ID);
    const environment = await space.getEnvironment('master');
    
    const queryParams = {
      limit: 1000
    };
    
    if (targetContentType) {
      queryParams['content_type'] = targetContentType;
    }
    
    const entries = await environment.getEntries(queryParams);

    const emptyTitleEntries = [];

    entries.items.forEach(entry => {
      const title = entry.fields.title;
      
      if (!title || title === '' || (typeof title === 'object' && Object.values(title).every(val => !val || val === ''))) {
        emptyTitleEntries.push({
          id: entry.sys.id,
          contentType: entry.sys.contentType.sys.id,
          updatedAt: entry.sys.updatedAt,
          fields: entry.fields
        });
      }
    });

    const typeFilter = targetContentType ? ` ${targetContentType}` : '';
    console.log(`Found ${emptyTitleEntries.length}${typeFilter} entries with empty title fields:\n`);

    emptyTitleEntries.forEach((entry, index) => {
      console.log(`${index + 1}. Entry ID: ${entry.id}`);
      console.log(`   Content Type: ${entry.contentType}`);
      console.log(`   Last Updated: ${entry.updatedAt}`);
      console.log(`   Available Fields: ${Object.keys(entry.fields).join(', ')}`);
      console.log('');
    });

    if (emptyTitleEntries.length === 0) {
      const typeFilter = targetContentType ? ` ${targetContentType}` : '';
      console.log(`No${typeFilter} entries found with empty title fields.`);
    }

  } catch (error) {
    console.error('Error scanning Contentful space:', error.message);
    
    if (error.message.includes('Not Found')) {
      console.error('Please check your CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN');
    }
  }
}

scanForEmptyTitles(contentType);