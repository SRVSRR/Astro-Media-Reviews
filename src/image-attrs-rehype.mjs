import { imageSize } from 'image-size';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => walk(child, visit));
  }
}

export default function remarkImageAttrs() {
  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== 'image') return;
      const src = node.url;
      if (!src || typeof src !== 'string' || !src.startsWith('/images/')) return;
      node.data = node.data || {};
      node.data.hProperties = {
        loading: 'lazy',
        decoding: 'async',
      };
      try {
        const dims = imageSize(readFileSync(join(process.cwd(), 'public', src)));
        node.data.hProperties.width = String(dims.width);
        node.data.hProperties.height = String(dims.height);
      } catch (err) {
        console.error('[remarkImageAttrs] dims failed for', src, err.message);
      }
    });
  };
}