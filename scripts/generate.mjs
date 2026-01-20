import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { optimize } from 'svgo';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT_DIR, 'svg');
const REACT_ICONS_DIR = path.join(ROOT_DIR, 'packages/mingcute-react/src/icons');
const VUE_ICONS_DIR = path.join(ROOT_DIR, 'packages/mingcute-vue/src/icons');

// Convert snake_case to PascalCase
function toPascalCase(str) {
  return str
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Convert snake_case to kebab-case (lowercase)
function toKebabCase(str) {
  return str.replace(/_/g, '-').toLowerCase();
}

// Parse icon name to get base name and variant
function parseIconName(iconName) {
  if (iconName.endsWith('_fill')) {
    return { baseName: iconName.slice(0, -5), variant: 'fill' };
  }
  if (iconName.endsWith('_line')) {
    return { baseName: iconName.slice(0, -5), variant: 'line' };
  }
  return { baseName: iconName, variant: null };
}

// Parse SVG and extract inner content
function parseSvg(svgContent) {
  const result = optimize(svgContent, {
    plugins: [
      'preset-default',
      'removeDimensions',
      {
        name: 'removeAttrs',
        params: {
          attrs: ['xmlns', 'width', 'height'],
        },
      },
    ],
  });

  const optimized = result.data;
  const match = optimized.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!match) return null;

  let innerContent = match[1].trim();
  // Replace specific color #09244B with currentColor globally (ignoring case)
  // This covers fill, stroke, stop-color, etc.
  innerContent = innerContent.replace(/#09244B/gi, 'currentColor');
  innerContent = innerContent.replace(/fill="none"/g, 'fill="none"');

  return innerContent;
}

// Convert HTML attributes to JSX
function toJsxContent(innerContent) {
  return innerContent
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/clip-path=/g, 'clipPath=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    .replace(/stroke-opacity=/g, 'strokeOpacity=')
    .replace(/fill-opacity=/g, 'fillOpacity=')
    .replace(/stop-color=/g, 'stopColor=')
    .replace(/stop-opacity=/g, 'stopOpacity=')
    .replace(/xlink:href=/g, 'xlinkHref=')
    .replace(/xml:space=/g, 'xmlSpace=');
}

// Generate React component file with both Fill and Line variants
function generateReactFile(basePascalName, variants) {
  const components = [];
  const exports = [];

  for (const [variant, innerContent] of Object.entries(variants)) {
    const componentName = `${basePascalName}${variant === 'fill' ? 'Fill' : 'Line'}`;
    const jsxContent = toJsxContent(innerContent);

    components.push(`
export const ${componentName} = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <Icon ref={ref} {...props}>
    ${jsxContent}
  </Icon>
));

${componentName}.displayName = '${componentName}';`);

    exports.push(componentName);
  }

  return `import { forwardRef } from 'react';
import { Icon } from '../Icon';
import type { IconProps } from '../types';
${components.join('\n')}
`;
}

// Generate Vue component file with both Fill and Line variants
function generateVueFile(basePascalName, variants) {
  const components = [];

  for (const [variant, innerContent] of Object.entries(variants)) {
    const componentName = `${basePascalName}${variant === 'fill' ? 'Fill' : 'Line'}`;
    const escapedContent = innerContent.replace(/`/g, '\\`');

    components.push(`
export const ${componentName} = defineComponent({
  name: '${componentName}',
  props: {
    size: {
      type: [Number, String] as PropType<number | string>,
      default: 24,
    },
    color: {
      type: String,
      default: 'currentColor',
    },
  },
  setup(props, { attrs }) {
    return () =>
      h(
        Icon,
        { size: props.size, color: props.color, ...attrs },
        () => [
          h('g', { innerHTML: \`${escapedContent}\` }),
        ]
      );
  },
});`);
  }

  return `import { defineComponent, h, type PropType } from 'vue';
import { Icon } from '../Icon';
${components.join('\n')}
`;
}

// Generate index.ts exports
function generateIndexExports(iconGroups, framework) {
  const baseExports =
    framework === 'react'
      ? `export { Icon } from './Icon';
export type { IconProps } from './types';

`
      : `export { Icon } from './Icon';
export type { IconProps } from './types';

`;

  const iconExports = [];
  for (const { basePascalName, kebabName, variants } of iconGroups) {
    const componentNames = Object.keys(variants).map(
      (v) => `${basePascalName}${v === 'fill' ? 'Fill' : 'Line'}`
    );
    iconExports.push(`export { ${componentNames.join(', ')} } from './icons/${kebabName}';`);
  }

  return baseExports + iconExports.join('\n') + '\n';
}

async function main() {
  console.log('Generating icons...\n');

  await fs.mkdir(REACT_ICONS_DIR, { recursive: true });
  await fs.mkdir(VUE_ICONS_DIR, { recursive: true });

  const svgFiles = await glob('**/*.svg', { cwd: SVG_DIR });
  console.log(`Found ${svgFiles.length} SVG files\n`);

  // Group icons by base name
  const iconMap = new Map();

  for (const svgFile of svgFiles) {
    const svgPath = path.join(SVG_DIR, svgFile);
    const iconName = path.basename(svgFile, '.svg');
    const { baseName, variant } = parseIconName(iconName);

    if (!variant) {
      console.warn(`Skipping icon without variant: ${iconName}`);
      continue;
    }

    try {
      const svgContent = await fs.readFile(svgPath, 'utf-8');
      const innerContent = parseSvg(svgContent);

      if (!innerContent) {
        console.error(`Failed to parse: ${svgFile}`);
        continue;
      }

      if (!iconMap.has(baseName)) {
        iconMap.set(baseName, {});
      }
      iconMap.get(baseName)[variant] = innerContent;
    } catch (error) {
      console.error(`Error processing ${svgFile}:`, error.message);
    }
  }

  console.log(`Grouped into ${iconMap.size} icon sets\n`);

  const iconGroups = [];
  let fileCount = 0;

  for (const [baseName, variants] of iconMap) {
    const basePascalName = toPascalCase(baseName);
    const kebabName = toKebabCase(baseName);

    // Generate React file
    const reactCode = generateReactFile(basePascalName, variants);
    await fs.writeFile(path.join(REACT_ICONS_DIR, `${kebabName}.tsx`), reactCode);

    // Generate Vue file
    const vueCode = generateVueFile(basePascalName, variants);
    await fs.writeFile(path.join(VUE_ICONS_DIR, `${kebabName}.ts`), vueCode);

    iconGroups.push({ basePascalName, kebabName, variants });
    fileCount++;
  }

  // Sort for consistent output
  iconGroups.sort((a, b) => a.kebabName.localeCompare(b.kebabName));

  // Generate index files
  const reactIndex = generateIndexExports(iconGroups, 'react');
  await fs.writeFile(path.join(ROOT_DIR, 'packages/mingcute-react/src/index.ts'), reactIndex);

  const vueIndex = generateIndexExports(iconGroups, 'vue');
  await fs.writeFile(path.join(ROOT_DIR, 'packages/mingcute-vue/src/index.ts'), vueIndex);

  const totalComponents = iconGroups.reduce((acc, g) => acc + Object.keys(g.variants).length, 0);

  console.log(`Generation complete!`);
  console.log(`  Icon sets: ${fileCount}`);
  console.log(`  Total components: ${totalComponents}`);
}

main().catch(console.error);
