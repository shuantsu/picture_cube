import json
import pandas as pd
from datetime import datetime

# Load HAR file
with open('ignore/localhost.har', 'r', encoding='utf-8') as f:
    har = json.load(f)

entries = har['log']['entries']
page_start = datetime.fromisoformat(har['log']['pages'][0]['startedDateTime'].replace('Z', '+00:00'))

# Extract relevant data
data = []
for entry in entries:
    url = entry['request']['url']
    started = datetime.fromisoformat(entry['startedDateTime'].replace('Z', '+00:00'))
    time_from_start = (started - page_start).total_seconds() * 1000  # ms
    
    data.append({
        'time_ms': round(time_from_start, 2),
        'url': url.split('/')[-1] if '/' in url else url,
        'full_url': url,
        'type': entry.get('_resourceType', 'unknown'),
        'size': entry['response']['content'].get('size', 0),
        'status': entry['response']['status']
    })

df = pd.DataFrame(data)

# Analysis
print("=" * 80)
print("HAR FILE ANALYSIS - localhost:8000")
print("=" * 80)

page_timings = har['log']['pages'][0]['pageTimings']
print(f"\nPage Load Times:")
print(f"  DOMContentLoaded: {page_timings['onContentLoad']/1000:.2f}s")
print(f"  Load Event: {page_timings['onLoad']/1000:.2f}s")

print(f"\nTotal Requests: {len(df)}")
print(f"Total Size: {df['size'].sum() / 1024:.2f} KB")

print("\n" + "=" * 80)
print("REQUESTS BY TYPE")
print("=" * 80)
type_summary = df.groupby('type').agg({
    'url': 'count',
    'size': 'sum'
}).rename(columns={'url': 'count'})
type_summary['size_kb'] = type_summary['size'] / 1024
print(type_summary[['count', 'size_kb']].to_string())

print("\n" + "=" * 80)
print("EXAMPLE TEXTURE FILES (examples/*.json)")
print("=" * 80)
examples = df[df['full_url'].str.contains('examples/')]
if len(examples) > 0:
    print(f"\nFound {len(examples)} example files:")
    print(examples[['time_ms', 'url', 'size']].to_string(index=False))
    print(f"\nTotal examples size: {examples['size'].sum() / 1024:.2f} KB")
    print(f"First example loaded at: {examples['time_ms'].min():.0f}ms")
    print(f"Last example loaded at: {examples['time_ms'].max():.0f}ms")
    print(f"Time span: {(examples['time_ms'].max() - examples['time_ms'].min()):.0f}ms")
else:
    print("No example files found")

print("\n" + "=" * 80)
print("TIMELINE (first 20 requests)")
print("=" * 80)
print(df.head(20)[['time_ms', 'type', 'url']].to_string(index=False))

print("\n" + "=" * 80)
print("BLOCKING ANALYSIS")
print("=" * 80)
print(f"Time until DOMContentLoaded: {page_timings['onContentLoad']:.0f}ms")
print(f"Time until Load: {page_timings['onLoad']:.0f}ms")

if len(examples) > 0:
    examples_before_load = examples[examples['time_ms'] < page_timings['onLoad']]
    print(f"\nExample files loaded BEFORE page load: {len(examples_before_load)}/{len(examples)}")
    if len(examples_before_load) > 0:
        print("⚠️  BLOCKING: Example textures are loaded before page is ready!")
