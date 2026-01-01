<p align="center">
  <a href="https://www.mingcute.com/">
    <img src="https://github.com/Richard9394/MingCute/raw/main//update/mingcute_react.png" alt="MingCute icon library for React applications.">
  </a>
</p>

<p align="center">
Implementation of the MingCute Icons library for React applications.
</p>

<p align="center">
  <a href="https://www.mingcute.com/">Browse all icons at MingCute.com →</a>
</p>

[![npm](https://img.shields.io/npm/v/@mingcute/react.svg?labelColor=4A4A4A&color=007AFF&style=shield)](https://www.npmjs.com/package/@mingcute/react)
[![stars](https://img.shields.io/github/stars/Richard9394/MingCute.svg?labelColor=4A4A4A&color=FE7D37&style=shield)](https://github.com/Richard9394/MingCute/stargazers)
[![downloads](https://img.shields.io/npm/dt/mingcute_icon.svg?labelColor=4A4A4A&color=23AF5F&style=shield)](https://www.npmjs.com/package/mingcute_icon)
[![twitter](https://img.shields.io/twitter/follow/MingCute_icon.svg?label=MingCute_icon&style=social)](https://twitter.com/MingCute_icon)

# MingCute Icons for React

A high-performance, tree-shakable React icon library generated from **MingCute Icons**. Built with TypeScript and optimized for modern frameworks like Next.js, Vite, and Remix.

------

##  Installation

```Bash
# Using npm
npm install @mingcute/react

# Using yarn
yarn add @mingcute/react

# Using pnpm
pnpm add @mingcute/react
```

------

##  Usage

### 1. Basic Example

Import icons as standard React components. All icons accept `size` and `color` props.

```TypeScript
import { MingcuteFill, Home1Line, SearchLine } from '@mingcute/react';

function App() {
  return (
    <div className="container">
      {/* Default: 24px size and currentColor */}
      <MingcuteFill />

      {/* Custom size and color */}
      <Home1Line size={32} color="#007AFF" />

      {/* Inherits standard SVG props */}
      <SearchLine opacity={0.5} />
    </div>
  );
}
```

### 2. Styling with Tailwind CSS

Since the library spreads `props` to the underlying SVG, you can use Utility Classes directly.

```TypeScript
import { UserLine } from '@mingcute/react';

export default function Profile() {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
      <UserLine className="w-5 h-5 animate-pulse" />
      <span>Profile</span>
    </button>
  );
}
```

------

##  Optimization (Deep Imports)

While the main entry point supports tree-shaking, you can bypass index files entirely for absolute minimum bundle sizes by importing individual icons.

```TypeScript
// This ensures that only the code for MingcuteFill is processed
import MingcuteFill from '@mingcute/react/icons/MingcuteFill';

function MinimalPage() {
  return <MingcuteFill />;
}
```

------

##  Props

All components extend `React.SVGProps<SVGSVGElement>`.

| **Prop**    | **Type**          | **Default**      | **Description**                                |
| ----------- | ----------------- | ---------------- | ---------------------------------------------- |
| `size`      | `number | string` | `24`             | Sets width and height of the icon              |
| `color`     | `string`          | `"currentColor"` | Sets the color                                 |
| `className` | `string`          | -                | Standard React className for styling           |
| `...props`  | `SVGProps`        | -                | Any valid SVG attribute (title, opacity, etc.) |

------

##  License

[Apache-2.0 License](https://github.com/Richard9394/MingCute/blob/main/LICENSE)
