// src/lib/mdx/satteri-filetree.ts
import { defineMdastPlugin } from 'satteri';

const EXTENSION_ICON: Record<string, string> = {
  // ========================
  //  FOLDER & DEFAULT
  // ========================
  folder: '--ic-ft-folder',
  file:   '--ic-ft-file',   // fallback untuk ekstensi tak dikenal

  // ========================
  //  BAHASA & FRAMEWORK (dari CSS awal)
  // ========================
  astro:    '--ic-ft-astro',
  ts:       '--ic-ft-ts',
  js:       '--ic-ft-js',
  css:      '--ic-ft-css',
  html:     '--ic-ft-html',
  json:     '--ic-ft-json',
  md:       '--ic-ft-md',
  svg:      '--ic-ft-svg',
  png:      '--ic-ft-png',
  apk:      '--ic-ft-apk',
  jpg:      '--ic-ft-jpg',
  jpeg:     '--ic-ft-jpg',   // alias
  ico:      '--ic-ft-ico',
  pdf:      '--ic-ft-pdf',
  zip:      '--ic-ft-zip',
  env:      '--ic-ft-env',
  sh:       '--ic-ft-sh',
  py:       '--ic-ft-py',
  go:       '--ic-ft-go',
  rs:       '--ic-ft-rs',
  vue:      '--ic-ft-vue',
  svelte:   '--ic-ft-svelte',
  jsx:      '--ic-ft-jsx',
  tsx:      '--ic-ft-tsx',
  mjs:      '--ic-ft-mjs',
  cjs:      '--ic-ft-cjs',
  yaml:     '--ic-ft-yaml',
  yml:      '--ic-ft-yaml',  // alias
  toml:     '--ic-ft-toml',
  xml:      '--ic-ft-xml',
  sql:      '--ic-ft-sql',
  lock:     '--ic-ft-lock',
  log:      '--ic-ft-log',
  txt:      '--ic-ft-txt',
  csv:      '--ic-ft-csv',
  gitignore:'--ic-ft-gitignore',
  dockerfile:'--ic-ft-dockerfile',
  makefile: '--ic-ft-makefile',
  git:      '--ic-ft-git',
  woff2:    '--ic-ft-font',
  woff:     '--ic-ft-font',
  ttf:      '--ic-ft-font',

  // ========================
  //  BAHASA TAMBAHAN
  // ========================
  pl:    '--ic-ft-pl',
  pm:    '--ic-ft-pm',
  jl:    '--ic-ft-jl',
  zig:   '--ic-ft-zig',
  sol:   '--ic-ft-sol',
  vb:    '--ic-ft-vb',
  f:     '--ic-ft-f',
  for:   '--ic-ft-for',
  asm:   '--ic-ft-asm',
  s:     '--ic-ft-s',
  lisp:  '--ic-ft-lisp',
  cl:    '--ic-ft-cl',
  cob:   '--ic-ft-cob',
  cbl:   '--ic-ft-cbl',

  // ========================
  //  TEMPLATE ENGINE
  // ========================
  ejs:        '--ic-ft-ejs',
  hbs:        '--ic-ft-hbs',
  handlebars: '--ic-ft-handlebars',
  pug:        '--ic-ft-pug',
  jade:       '--ic-ft-jade',
  mustache:   '--ic-ft-mustache',
  mdx:        '--ic-ft-mdx',

  // ========================
  //  ARSIP & KOMPRESI
  // ========================
  rar:  '--ic-ft-rar',
  iso:  '--ic-ft-iso',
  dmg:  '--ic-ft-dmg',
  jar:  '--ic-ft-jar',
  war:  '--ic-ft-war',
  ear:  '--ic-ft-ear',

  // ========================
  //  DESAIN & 3D
  // ========================
  psd:    '--ic-ft-psd',
  ai:     '--ic-ft-ai',
  fig:    '--ic-ft-fig',
  sketch: '--ic-ft-sketch',
  blend:  '--ic-ft-blend',
  stl:    '--ic-ft-stl',
  obj:    '--ic-ft-obj',
  fbx:    '--ic-ft-fbx',
  heic:   '--ic-ft-heic',
  bmp:    '--ic-ft-bmp',

  // ========================
  //  VIDEO & AUDIO
  // ========================
  mkv:  '--ic-ft-mkv',
  avi:  '--ic-ft-avi',
  flv:  '--ic-ft-flv',
  m4a:  '--ic-ft-m4a',
  aac:  '--ic-ft-aac',

  // ========================
  //  KEAMANAN & SERTIFIKAT
  // ========================
  pem: '--ic-ft-pem',
  crt: '--ic-ft-crt',
  cer: '--ic-ft-cer',
  key: '--ic-ft-key',
  pub: '--ic-ft-pub',
  asc: '--ic-ft-asc',

  // ========================
  //  INFRASTRUKTUR & KONFIGURASI
  // ========================
  tfstate:    '--ic-ft-tfstate',
  editorconfig:'--ic-ft-editorconfig',
  npmrc:      '--ic-ft-npmrc',
  yarnrc:     '--ic-ft-yarnrc',
  pnpmrc:     '--ic-ft-pnpmrc',
  nvmrc:      '--ic-ft-nvmrc',
  prettierrc: '--ic-ft-prettierrc',
  eslintrc:   '--ic-ft-eslintrc',
  plist:      '--ic-ft-plist',
  desktop:    '--ic-ft-desktop',
  service:    '--ic-ft-service',

  // ========================
  //  DATABASE & DATA
  // ========================
  duckdb: '--ic-ft-duckdb',
  rdb:    '--ic-ft-rdb',
  mdb:    '--ic-ft-mdb',
  dmp:    '--ic-ft-dmp',
  tsv:    '--ic-ft-tsv',
  feather:'--ic-ft-feather',
  arrow:  '--ic-ft-arrow',

  // ========================
  //  BINARY / COMPILED
  // ========================
  o:     '--ic-ft-o',
  so:    '--ic-ft-so',
  dylib: '--ic-ft-dylib',
  dll:   '--ic-ft-dll',
  exe:   '--ic-ft-exe',
  wasm:  '--ic-ft-wasm',

  // ========================
  //  MISC (PATCH, LaTeX, etc)
  // ========================
  patch:    '--ic-ft-patch',
  diff:     '--ic-ft-diff',
  tex:      '--ic-ft-tex',
  bib:      '--ic-ft-bib',
  adoc:     '--ic-ft-adoc',
  asciidoc: '--ic-ft-asciidoc',
  org:      '--ic-ft-org',
  ics:      '--ic-ft-ics',
  pot:      '--ic-ft-pot',
  po:       '--ic-ft-po',
  mo:       '--ic-ft-mo',
};

function splitComment(raw: string): { name: string; comment: string } {
  const idxSlash = raw.search(/\s\/\/\s?/);
  const idxHash = raw.search(/\s#\s?/);
  let idx = -1;
  if (idxSlash !== -1 && idxHash !== -1) {
    idx = Math.min(idxSlash, idxHash);
  } else if (idxSlash !== -1) {
    idx = idxSlash;
  } else if (idxHash !== -1) {
    idx = idxHash;
  }
  if (idx === -1) {
    return { name: raw.trim(), comment: '' };
  }
  const name = raw.slice(0, idx).trim();
  const comment = raw.slice(idx).trim();
  return { name, comment };
}

function isPlaceholderName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed === '...' || trimmed === '…';
}

function getDepth(ctx: any, node: any): number {
  let depth = 0;
  let current = node;
  while (true) {
    const parent = ctx.parent(current);
    if (!parent) break;
    if (parent.type === 'list') {
      depth++;
    }
    if (parent.type === 'containerDirective' && (parent as any).name === 'filetree') {
      break;
    }
    current = parent;
  }
  return Math.max(0, depth - 1);
}

function getFileExtension(fileName: string): string {
  const trimmed = fileName.trim();
  if (trimmed.endsWith('/')) return 'folder';
  if (trimmed.startsWith('.')) {
    const parts = trimmed.split('.');
    if (parts.length > 1) {
      return parts.slice(1).join('.').toLowerCase();
    }
    return '';
  }
  const parts = trimmed.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return '';
}

function normalizeFileName(raw: string): string {
  return raw.trim();
}

export const satteriFileTree = defineMdastPlugin({
  name: 'satteri-filetree',

  containerDirective(node: any, ctx: any) {
    if (node.name !== 'filetree') return;
    const baseData = node.data || {};
    ctx.setProperty(node, 'data', {
      ...baseData,
      hName: 'div',
      hProperties: {
        ...(baseData.hProperties || {}),
        className: ['file-tree'],
      },
    });
  },

  listItem(node: any, ctx: any) {
    let current: any = node;
    let isInside = false;

    while (true) {
      const parent = ctx.parent(current);
      if (!parent) break;
      if (parent.type === 'containerDirective' && (parent as any).name === 'filetree') {
        isInside = true;
        break;
      }
      current = parent;
    }

    if (!isInside) return;

    const depth = getDepth(ctx, node);

    const firstChild = node.children[0];
    const hasNestedList = node.children.some((c: any) => c.type === 'list');

    let fileName = '';
    let isHighlighted = false;
    let comment = '';
    let strongNode: any = null;
    let isPlaceholder = false;

    if (firstChild && firstChild.type === 'paragraph' && Array.isArray(firstChild.children)) {
      const children = firstChild.children as any[];
      if (children.length > 0) {
        strongNode = children.find((c: any) => c.type === 'strong');
        if (strongNode) {
          isHighlighted = true;
          const textChild = strongNode.children?.[0];
          if (textChild?.type === 'text') {
            const raw = textChild.value || '';
            const { name, comment: cmt } = splitComment(raw);
            fileName = normalizeFileName(name);
            comment = cmt;
          }
          const rest = children.filter((c: any) => c !== strongNode);
          for (const child of rest) {
            if (child.type === 'text') {
              const { comment: cmt } = splitComment(child.value);
              if (cmt) {
                const trimmed = cmt.trim();
                if (trimmed) comment = comment ? comment + ' ' + trimmed : trimmed;
              }
            }
          }
        } else {
          const textNode = children.find((c: any) => c.type === 'text');
          if (textNode) {
            const raw = textNode.value || '';
            const { name, comment: cmt } = splitComment(raw);
            fileName = normalizeFileName(name);
            comment = cmt;
          } else {
            let fullText = '';
            for (const child of children) {
              if (child.type === 'text') fullText += child.value;
              else if (child.type === 'inlineCode' && child.value) fullText += child.value;
            }
            const { name, comment: cmt } = splitComment(fullText);
            fileName = normalizeFileName(name);
            comment = cmt;
          }
        }
      }
    }

    if (!fileName) {
      fileName = 'untitled';
    }

    isPlaceholder = isPlaceholderName(fileName);

    const isFolder = !isPlaceholder && (fileName.endsWith('/') || hasNestedList);
    const isFile = !isPlaceholder && !isFolder;

    const displayName = isFolder ? fileName.replace(/\/$/, '').trim() : fileName.trim();

    let ext = '';
    if (isFolder) {
      ext = 'folder';
    } else if (isFile) {
      ext = getFileExtension(fileName);
    }

    const spanClass = isPlaceholder ? 'tree-placeholder' : isFolder ? 'tree-folder' : 'tree-file';

    const spanChildren: any[] = [];

    if (isPlaceholder) {
      spanChildren.push({ type: 'text', value: '…' });
    } else {
      if (isHighlighted && strongNode) {
        const strongClone = {
          ...strongNode,
          children: strongNode.children?.map((c: any) => ({
            ...c,
            value: c.value?.trim(),
          })),
        };
        spanChildren.push(strongClone);
      } else {
        spanChildren.push({ type: 'text', value: displayName });
      }
      if (comment) {
        const trimmedComment = comment.trim();
        if (trimmedComment) {
          spanChildren.push({ type: 'text', value: ' ' });
          spanChildren.push({
            type: 'containerDirective',
            data: {
              hName: 'span',
              hProperties: { className: ['tree-comment'] },
            },
            children: [{ type: 'text', value: trimmedComment }],
          });
        }
      }
    }

    const contentSpan = {
      type: 'containerDirective',
      data: {
        hName: 'span',
        hProperties: { className: [spanClass] },
      },
      children: spanChildren,
    };

    const wrapperProps: any = {
      className: ['tree-label'],
    };

    if (isHighlighted) wrapperProps['data-highlight'] = '';
    if (isPlaceholder) wrapperProps['data-placeholder'] = '';

    const existingClasses = (node.data?.hProperties?.className as string[]) || [];
    const depthClass = `tree-depth-${depth}`;
    const typeClass = isPlaceholder ? 'tree-placeholder' : isFolder ? 'tree-folder' : 'tree-file';
    const highlightClass = isHighlighted ? 'tree-highlight' : '';
    const finalLiClasses = [depthClass, typeClass, highlightClass, ...existingClasses].filter(Boolean);

    if (isPlaceholder) {
      const labelNode = {
        type: 'containerDirective',
        data: {
          hName: 'div',
          hProperties: wrapperProps,
        },
        children: [contentSpan],
      };
      ctx.setProperty(node, 'children', [labelNode as any]);
    } else if (isFolder && hasNestedList) {
      const summaryNode = {
        type: 'paragraph',
        data: {
          hName: 'summary',
          hProperties: wrapperProps,
        },
        children: [contentSpan],
      };
      const restChildren = node.children.slice(1);
      const detailsNode = {
        type: 'containerDirective',
        data: {
          hName: 'details',
          hProperties: { open: true },
        },
        children: [summaryNode, ...restChildren],
      };
      ctx.setProperty(node, 'children', [detailsNode as any]);
    } else {
      const labelNode = {
        type: 'containerDirective',
        data: {
          hName: 'div',
          hProperties: wrapperProps,
        },
        children: [contentSpan],
      };
      ctx.setProperty(node, 'children', [labelNode as any]);
    }

    const bData = node.data || {};
    const liProps: any = {
      className: finalLiClasses,
    };
    if (ext) {
      liProps['data-ext'] = ext;
      const iconVar = EXTENSION_ICON[ext] ?? '--ic-ft-file';
      liProps.style = `--tree-icon: var(${iconVar})`;
    }
    ctx.setProperty(node, 'data', {
      ...bData,
      hProperties: liProps,
    });
  },
});