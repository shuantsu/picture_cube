import { readdir, writeFile, mkdir, stat } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

async function generateBackgroundsIndex() {
  const bgDir = join(distDir, 'backgrounds');
  const files = await readdir(bgDir, { withFileTypes: true });
  const imageFiles = files
    .filter(f => f.isFile() && ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(extname(f.name).toLowerCase()))
    .map(f => f.name)
    .sort();
  
  await writeFile(join(bgDir, 'index.json'), JSON.stringify(imageFiles));
  console.log(`Generated backgrounds/index.json with ${imageFiles.length} files`);
}

async function generateExamplesIndex() {
  const examplesDir = join(distDir, 'examples');
  const files = await readdir(examplesDir);
  const jsonFiles = files
    .filter(f => f.endsWith('.json') && f !== 'index.json')
    .sort();
  
  await writeFile(join(examplesDir, 'index.json'), JSON.stringify(jsonFiles));
  console.log(`Generated examples/index.json with ${jsonFiles.length} files`);
}

async function generateThumbnails() {
  const bgDir = join(distDir, 'backgrounds');
  const thumbsDir = join(bgDir, 'thumbnails');
  await mkdir(thumbsDir, { recursive: true });
  
  const files = await readdir(bgDir, { withFileTypes: true });
  const imageFiles = files.filter(f => 
    f.isFile() && ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(extname(f.name).toLowerCase())
  );
  
  let count = 0;
  for (const file of imageFiles) {
    const inputPath = join(bgDir, file.name);
    const outputPath = join(thumbsDir, `${basename(file.name, extname(file.name))}.jpg`);
    
    try {
      const [inputStat, outputStat] = await Promise.all([
        stat(inputPath),
        stat(outputPath).catch(() => null)
      ]);
      
      if (outputStat && outputStat.mtime >= inputStat.mtime) {
        continue;
      }
    } catch {}
    
    await sharp(inputPath)
      .resize(120, 120, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outputPath);
    
    count++;
    console.log(`Generated: ${basename(outputPath)}`);
  }
  
  if (count > 0) console.log(`\nGenerated ${count} thumbnails`);
  else console.log('All thumbnails up to date');
}

async function main() {
  await generateBackgroundsIndex();
  await generateExamplesIndex();
  await generateThumbnails();
}

main().catch(console.error);
