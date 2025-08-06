import * as https from 'https';
import { URL } from 'url';
import { config } from 'dotenv';

config();

interface SmugMugAlbumMetadata {
  title: string;
  description: string;
  keywords: string;
  imageCount: number;
  created: string;
  modified: string;
  privacy: string;
  webUri: string;
  albumKey: string;
  urlName: string;
  allowDownloads: boolean;
  passwordProtected: boolean;
  rawResponse: any;
}

interface SmugMugApiResponse {
  Response?: {
    Album?: any;
  };
  Album?: any;
  response?: {
    album?: any;
  };
  album?: any;
  data?: any;
  [key: string]: any;
}

async function fetchSmugMugAlbumMetadata(albumIdentifier: string): Promise<SmugMugAlbumMetadata> {
  return new Promise((resolve, reject) => {
    try {
      let hostname: string;
      let path: string;
      
      if (albumIdentifier.startsWith('http')) {
        const url = new URL(albumIdentifier);
        hostname = url.hostname;
        path = `/api/v2${url.pathname}`;
      } else {
        hostname = 'api.smugmug.com';
        path = `/api/v2/album/${albumIdentifier}`;
      }
      
      const options: https.RequestOptions = {
        hostname: hostname,
        path: path,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Contentful-Scraper/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });

        res.on('end', () => {
          try {
            console.log('Raw API Response:', data);
            const response: SmugMugApiResponse = JSON.parse(data);
            console.log('Parsed Response:', JSON.stringify(response, null, 2));
            
            let album: any = null;
            
            // Try different response structures
            if (response.Response && response.Response.Album) {
              album = response.Response.Album;
            } else if (response.Album) {
              album = response.Album;
            } else if (response.response && response.response.album) {
              album = response.response.album;
            } else if (response.album) {
              album = response.album;
            } else if (response.data) {
              album = response.data;
            }
            
            if (album) {
              const metadata: SmugMugAlbumMetadata = {
                title: album.Title || album.Name || album.title || album.name || '',
                description: album.Description || album.description || '',
                keywords: album.Keywords || album.keywords || '',
                imageCount: album.ImageCount || album.imageCount || album.image_count || 0,
                created: album.Date || album.created || album.date || '',
                modified: album.LastUpdated || album.lastUpdated || album.modified || '',
                privacy: album.Privacy || album.privacy || '',
                webUri: album.WebUri || album.webUri || album.web_uri || '',
                albumKey: album.AlbumKey || album.albumKey || album.album_key || album.Key || album.key || '',
                urlName: album.UrlName || album.urlName || album.url_name || '',
                allowDownloads: album.AllowDownloads || album.allowDownloads || album.allow_downloads || false,
                passwordProtected: album.Password || album.password ? true : false,
                rawResponse: response
              };
              
              resolve(metadata);
            } else {
              console.error('Available response keys:', Object.keys(response));
              reject(new Error('Could not find album data in response. Check the debug output above.'));
            }
          } catch (parseError) {
            console.error('Parse error:', parseError instanceof Error ? parseError.message : 'Unknown parse error');
            console.error('Raw response that failed to parse:', data);
            reject(new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`));
          }
        });
      });

      req.on('error', (error: Error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    } catch (error) {
      reject(new Error(`Invalid input: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

async function main(): Promise<void> {
  const albumIdentifier: string | undefined = process.argv[2];
  
  if (!albumIdentifier) {
    console.error('Usage: node smugmug-metadata.js <album-id-or-url>');
    console.error('Examples:');
    console.error('  node smugmug-metadata.js 123456789');
    console.error('  node smugmug-metadata.js https://yoursite.smugmug.com/Album-Name');
    process.exit(1);
  }

  try {
    const isUrl = albumIdentifier.startsWith('http');
    const displayText = isUrl ? albumIdentifier : `Album ID: ${albumIdentifier}`;
    console.log(`Fetching metadata for SmugMug album: ${displayText}\n`);
    
    const metadata = await fetchSmugMugAlbumMetadata(albumIdentifier);
    
    console.log('Album Metadata:');
    console.log('===============');
    console.log(`Title: ${metadata.title}`);
    console.log(`Description: ${metadata.description || 'None'}`);
    console.log(`Keywords: ${metadata.keywords || 'None'}`);
    console.log(`Image Count: ${metadata.imageCount}`);
    console.log(`Created: ${metadata.created}`);
    console.log(`Modified: ${metadata.modified}`);
    console.log(`Privacy: ${metadata.privacy}`);
    console.log(`Web URI: ${metadata.webUri}`);
    console.log(`Album Key: ${metadata.albumKey}`);
    console.log(`URL Name: ${metadata.urlName}`);
    console.log(`Allow Downloads: ${metadata.allowDownloads}`);
    console.log(`Password Protected: ${metadata.passwordProtected}`);
    
    console.log('\nRaw metadata object:');
    console.log(JSON.stringify(metadata, null, 2));
    
  } catch (error) {
    console.error('Error fetching album metadata:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid input')) {
        console.error('Please provide a valid SmugMug album ID or URL');
      } else if (error.message.includes('Request failed')) {
        console.error('Network error - check your internet connection');
      } else if (error.message.includes('timeout')) {
        console.error('Request timed out - the album might not be publicly accessible');
      }
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { fetchSmugMugAlbumMetadata, SmugMugAlbumMetadata };