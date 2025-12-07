<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>File Browser</title>
<style>
:root{--bg:#0b1220;--panel:#0f1724;--muted:#9aa4b2;--accent:#6ee7b7;--shadow:0 6px 18px rgba(2,6,23,0.6);font-family:Inter,ui-sans-serif,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial}
html,body{height:100%;margin:0;background:linear-gradient(180deg,#071018 0%,#071827 100%);color:#e6eef6}
.container{max-width:1200px;margin:0 auto;padding:20px}
h1{margin:0 0 20px;font-size:24px;color:var(--accent)}
.search{margin-bottom:20px}
.search input{width:100%;padding:12px;border-radius:8px;border:1px solid var(--muted);background:var(--panel);color:#e6eef6;font-size:14px}
.tree{background:var(--panel);border-radius:10px;padding:20px;box-shadow:var(--shadow)}
.folder-children{display:none}
.folder-children.expanded{display:block}
.folder-toggle{margin-right:4px;cursor:pointer;user-select:none;width:12px;display:inline-block}
.hidden{display:none!important}
.tree-item{display:flex;align-items:center;padding:4px 0;cursor:pointer;border-radius:4px;transition:background 0.2s}
.tree-item:hover{background:rgba(255,255,255,0.05)}
.tree-item.folder{font-weight:500}
.tree-item.file{color:var(--muted)}
.tree-item.file:hover{color:#e6eef6}
.indent{width:20px;display:inline-block}
.icon{width:16px;height:16px;margin-right:8px;display:inline-block}
.folder-icon{color:#fbbf24}
.file-icon{color:var(--muted)}
.html-icon{color:#e34c26}
.js-icon{color:#f7df1e}
.php-icon{color:#777bb4}
.json-icon{color:#00d4aa}
.md-icon{color:#083fa1}
.svg-icon{color:#ff9500}
.png-icon{color:#4caf50}
</style>
</head>
<body>
<div class="container">
<h1>📁 Project Files</h1>
<div class="search">
<input type="text" id="searchInput" placeholder="🔍 Search files and folders..." oninput="filterTree()" autocomplete="off">
</div>
<div class="tree" id="fileTree"></div>
</div>

<script>
<?php
function scanDirectory($dir, $basePath = '') {
    $items = [];
    if (!is_dir($dir)) return $items;
    
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $fullPath = $dir . DIRECTORY_SEPARATOR . $file;
        $relativePath = $basePath ? $basePath . '/' . $file : $file;
        
        if (is_dir($fullPath)) {
            $items[] = [
                'name' => $file,
                'type' => 'folder',
                'path' => $relativePath,
                'children' => scanDirectory($fullPath, $relativePath)
            ];
        } else {
            $items[] = [
                'name' => $file,
                'type' => 'file',
                'path' => $relativePath,
                'ext' => pathinfo($file, PATHINFO_EXTENSION)
            ];
        }
    }
    
    // Sort: folders first, then files, both alphabetically
    usort($items, function($a, $b) {
        if ($a['type'] !== $b['type']) {
            return $a['type'] === 'folder' ? -1 : 1;
        }
        return strcasecmp($a['name'], $b['name']);
    });
    
    return $items;
}

$projectData = scanDirectory(__DIR__);
echo 'const projectData = ' . json_encode($projectData, JSON_PRETTY_PRINT) . ';';
?>

function getFileIcon(ext) {
    const icons = {
        'html': '🌐', 'htm': '🌐',
        'js': '⚡', 'mjs': '⚡',
        'php': '🐘',
        'json': '📋',
        'md': '📝', 'txt': '📝',
        'svg': '🎨',
        'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️',
        'css': '🎨',
        'bat': '⚙️', 'sh': '⚙️'
    };
    return icons[ext?.toLowerCase()] || '📄';
}

function getFileClass(ext) {
    const classes = {
        'html': 'html-icon', 'htm': 'html-icon',
        'js': 'js-icon', 'mjs': 'js-icon',
        'php': 'php-icon',
        'json': 'json-icon',
        'md': 'md-icon',
        'svg': 'svg-icon',
        'png': 'png-icon', 'jpg': 'png-icon', 'jpeg': 'png-icon', 'gif': 'png-icon'
    };
    return classes[ext?.toLowerCase()] || 'file-icon';
}

let idCounter = 0;
function renderTree(items, level = 0) {
    let html = '';
    items.forEach((item, index) => {
        const indent = '&nbsp;'.repeat(level * 4);
        const icon = item.type === 'folder' ? '📁' : getFileIcon(item.ext);
        const iconClass = item.type === 'folder' ? 'folder-icon' : getFileClass(item.ext);
        const itemId = `folder-${++idCounter}`;
        
        if (item.type === 'folder') {
            const toggle = item.children?.length > 0 ? '▶' : '';
            html += `<div class="tree-item folder" data-path="${item.path}" data-name="${item.name}" onclick="toggleFolder('${itemId}')">`;
            html += `${indent}<span class="folder-toggle">${toggle}</span>`;
            html += `<span class="icon ${iconClass}">${icon}</span>${item.name}`;
            html += `</div>`;
            
            if (item.children?.length > 0) {
                html += `<div class="folder-children" id="${itemId}">`;
                html += renderTree(item.children, level + 1);
                html += `</div>`;
            }
        } else {
            html += `<div class="tree-item file" data-path="${item.path}" data-name="${item.name}" onclick="handleClick('${item.path}', '${item.type}')">`;
            html += `${indent}<span class="icon ${iconClass}">${icon}</span>${item.name}`;
            html += `</div>`;
        }
    });
    return html;
}

function handleClick(path, type) {
    if (type === 'file') {
        window.open(path, '_blank');
    }
}

function toggleFolder(itemId) {
    event.stopPropagation();
    const folder = document.getElementById(itemId);
    const folderItem = folder.previousElementSibling;
    const toggle = folderItem.querySelector('.folder-toggle');
    
    if (folder.classList.contains('expanded')) {
        folder.classList.remove('expanded');
        toggle.textContent = '▶';
    } else {
        folder.classList.add('expanded');
        toggle.textContent = '▼';
    }
}

function filterTree() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.tree-item');
    
    items.forEach(item => {
        const name = item.dataset.name?.toLowerCase() || '';
        const path = item.dataset.path?.toLowerCase() || '';
        
        if (query === '' || name.includes(query) || path.includes(query)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
}

document.getElementById('fileTree').innerHTML = renderTree(projectData);
</script>
</body>
</html>