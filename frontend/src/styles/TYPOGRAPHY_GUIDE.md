# Avinci Typography Guide - Manrope Font

## Font Weights Available

The Manrope font family provides 7 weight variations for rich typographic hierarchy:

- **ExtraLight (200)**: Delicate, minimal emphasis
- **Light (300)**: Subtle, refined text
- **Regular (400)**: Default body text
- **Medium (500)**: Slightly emphasized, labels
- **Semibold (600)**: Strong emphasis, headings
- **Bold (700)**: Very strong emphasis, major headings
- **ExtraBold (800)**: Maximum impact, hero titles

## Typography Scale

### Headings

#### H1 / .heading-1
- **Weight**: ExtraBold (800)
- **Size**: 2.25rem (36px)
- **Usage**: Page titles, hero sections
- **Letter-spacing**: -0.02em
```html
<h1>Comprehensive AI Agents</h1>
<div class="heading-1">Hero Title</div>
```

#### H2 / .heading-2
- **Weight**: Bold (700)
- **Size**: 1.875rem (30px)
- **Usage**: Section titles, major divisions
- **Letter-spacing**: -0.015em
```html
<h2>User Research Sessions</h2>
<div class="heading-2">Section Title</div>
```

#### H3 / .heading-3
- **Weight**: Semibold (600)
- **Size**: 1.5rem (24px)
- **Usage**: Subsection titles, card headers
- **Letter-spacing**: -0.01em
```html
<h3>Create New Session</h3>
<div class="heading-3">Subsection</div>
```

#### H4 / .heading-4
- **Weight**: Semibold (600)
- **Size**: 1.25rem (20px)
- **Usage**: Component titles, emphasis
```html
<h4>Recent Agents</h4>
<div class="heading-4">Component Title</div>
```

#### H5 / .heading-5
- **Weight**: Medium (500)
- **Size**: 1.125rem (18px)
- **Usage**: Minor headings, list titles
```html
<h5>Quick Actions</h5>
<div class="heading-5">Minor Heading</div>
```

#### H6 / .heading-6
- **Weight**: Medium (500)
- **Size**: 1rem (16px)
- **Usage**: Small headings, strong labels
```html
<h6>Details</h6>
<div class="heading-6">Small Heading</div>
```

### Body Text

#### Regular Body
- **Weight**: Regular (400)
- **Usage**: Paragraphs, descriptions
```html
<p>This is regular body text for paragraphs and descriptions.</p>
<div class="text-body-regular">Regular text</div>
```

#### Light Body
- **Weight**: Light (300)
- **Usage**: Secondary information, subtle text
```html
<div class="text-body-light">Light body text for subtle information</div>
```

#### Medium Body
- **Weight**: Medium (500)
- **Usage**: Emphasized body text
```html
<div class="text-body-medium">Medium body text for emphasis</div>
```

#### Semibold Body
- **Weight**: Semibold (600)
- **Usage**: Strong emphasis within body
```html
<div class="text-body-semibold">Strong emphasis text</div>
```

### Labels & Small Text

#### Regular Label
- **Weight**: Medium (500)
- **Size**: 0.875rem (14px)
- **Usage**: Form labels, field names
```html
<label>Email Address</label>
<div class="label">Field Label</div>
```

#### Light Label
- **Weight**: Regular (400)
- **Usage**: Optional fields, hints
```html
<div class="label label-light">Optional</div>
```

#### Semibold Label
- **Weight**: Semibold (600)
- **Usage**: Required fields, important labels
```html
<div class="label label-semibold">Required</div>
```

### Captions & Meta Text

#### Regular Caption
- **Weight**: Regular (400)
- **Size**: 0.75rem (12px)
- **Usage**: Timestamps, meta information
```html
<div class="caption">2 hours ago</div>
<div class="text-caption">Meta information</div>
```

#### Medium Caption
- **Weight**: Medium (500)
- **Usage**: Emphasized meta info
```html
<div class="caption caption-medium">Updated just now</div>
```

#### Semibold Caption
- **Weight**: Semibold (600)
- **Usage**: Strong meta emphasis
```html
<div class="caption caption-semibold">New</div>
```

### Buttons

#### Primary Button
- **Weight**: Semibold (600)
- **Letter-spacing**: 0.01em
- **Usage**: Main actions
```html
<button class="btn btn-primary btn-md">Generate Agent</button>
```

#### Secondary Button
- **Weight**: Semibold (600)
- **Usage**: Secondary actions
```html
<button class="btn btn-secondary btn-md">Cancel</button>
```

#### Ghost Button
- **Weight**: Medium (500)
- **Usage**: Tertiary actions
```html
<button class="btn btn-ghost btn-md">Learn More</button>
```

### Badges & Tags

#### Badge
- **Weight**: Semibold (600)
- **Size**: 0.75rem (12px)
- **Letter-spacing**: 0.06em
- **Transform**: Uppercase
- **Usage**: Status indicators, tags
```html
<span class="badge badge-primary">Active</span>
<span class="badge badge-success">New</span>
<span class="badge badge-warning">Pending</span>
```

### Links

#### Regular Link
- **Weight**: Medium (500)
- **Usage**: Standard links
```html
<a href="#">View Details</a>
<div class="link">Standard Link</div>
```

#### Light Link
- **Weight**: Regular (400)
- **Usage**: Subtle links
```html
<a href="#" class="link-light">Subtle Link</a>
```

#### Semibold Link
- **Weight**: Semibold (600)
- **Usage**: Emphasized links
```html
<a href="#" class="link-semibold">Strong Link</a>
```

### Navigation

#### Nav Link
- **Weight**: Medium (500)
- **Active Weight**: Semibold (600)
- **Size**: 0.875rem (14px)
```html
<nav>
  <a href="#" class="nav-link">Dashboard</a>
  <a href="#" class="nav-link active">Agents</a>
</nav>
```

### Card Typography

#### Card Title
- **Weight**: Semibold (600)
- **Size**: 1.125rem (18px)
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Agent Information</h3>
  </div>
</div>
```

#### Card Subtitle
- **Weight**: Medium (500)
- **Size**: 0.875rem (14px)
```html
<div class="card-subtitle">Senior Product Designer</div>
```

#### Card Description
- **Weight**: Regular (400)
- **Size**: 0.875rem (14px)
```html
<div class="card-description">
  This agent specializes in user research and design thinking.
</div>
```

### Tables

#### Table Header
- **Weight**: Semibold (600)
- **Size**: 0.875rem (14px)
```html
<thead>
  <tr>
    <th>Name</th>
    <th>Status</th>
  </tr>
</thead>
```

#### Table Cell
- **Weight**: Regular (400)
- **Size**: 0.875rem (14px)
```html
<tbody>
  <tr>
    <td>Aditya Singh</td>
    <td>Active</td>
  </tr>
</tbody>
```

## Tailwind Classes for Font Weights

Use these Tailwind utility classes for custom font weights:

```html
<!-- Font Weights -->
<div class="font-extralight">ExtraLight (200)</div>
<div class="font-light">Light (300)</div>
<div class="font-normal">Regular (400)</div>
<div class="font-medium">Medium (500)</div>
<div class="font-semibold">Semibold (600)</div>
<div class="font-bold">Bold (700)</div>
<div class="font-extrabold">ExtraBold (800)</div>

<!-- Letter Spacing -->
<div class="tracking-tighter">-0.02em</div>
<div class="tracking-tight">-0.01em</div>
<div class="tracking-normal">0</div>
<div class="tracking-wide">0.01em</div>
<div class="tracking-wider">0.02em</div>
<div class="tracking-widest">0.06em</div>
```

## Best Practices

### Hierarchy
1. **Use weight progression**: Start with ExtraBold for main titles, decrease weight for nested content
2. **Limit weights per screen**: Use 3-4 different weights maximum on one page
3. **Consistent pairing**: Pair weights consistently (e.g., Semibold headings with Regular body)

### Readability
1. **Body text**: Use Regular (400) for optimal readability
2. **Small text**: Avoid ExtraBold in small sizes (< 14px)
3. **Light weights**: Use Light (300) only for sizes ≥ 16px

### Emphasis
1. **Primary emphasis**: Use Semibold (600) or Bold (700)
2. **Subtle emphasis**: Use Medium (500)
3. **De-emphasis**: Use Light (300)

### Letter Spacing
1. **Large text**: Use tighter spacing (-0.02em to -0.01em)
2. **Small caps/badges**: Use wider spacing (0.02em to 0.06em)
3. **Body text**: Use normal spacing (0)

## Examples in Context

### Hero Section
```html
<div class="hero">
  <h1 class="font-extrabold text-4xl tracking-tighter text-gray-900">
    Comprehensive AI Agents
  </h1>
  <p class="font-light text-xl text-gray-600 mt-4">
    Transform your workflow with intelligent AI personas
  </p>
  <button class="btn btn-primary btn-lg font-semibold tracking-wide mt-8">
    Get Started
  </button>
</div>
```

### Agent Card
```html
<div class="card">
  <h3 class="card-title font-semibold text-lg">Aditya Singh</h3>
  <p class="card-subtitle font-medium text-sm text-gray-600">
    Product Manager
  </p>
  <p class="card-description font-normal text-sm text-gray-700">
    Specializes in fintech products and user experience design.
  </p>
  <div class="flex gap-2 mt-4">
    <span class="badge badge-primary font-semibold tracking-widest">ACTIVE</span>
    <span class="badge badge-neutral font-semibold tracking-widest">TECH: 8/10</span>
  </div>
</div>
```

### Form
```html
<form>
  <label class="label font-medium text-sm">
    Email Address <span class="label-semibold text-red-500">*</span>
  </label>
  <input 
    type="email" 
    placeholder="Enter your email"
    class="input font-normal"
  />
  <p class="caption font-normal text-xs text-gray-500 mt-1">
    We'll never share your email with anyone else.
  </p>
</form>
```

### Navigation
```html
<nav class="flex gap-6">
  <a href="#" class="nav-link font-medium hover:font-semibold">Dashboard</a>
  <a href="#" class="nav-link font-semibold">Agents</a>
  <a href="#" class="nav-link font-medium hover:font-semibold">Research</a>
  <a href="#" class="nav-link font-medium hover:font-semibold">Projects</a>
</nav>
```

## Implementation Checklist

- [x] Import Manrope with all weights (200-800)
- [x] Define CSS custom properties for weights
- [x] Create heading styles with proper weights
- [x] Create body text variations
- [x] Style buttons with semibold weight
- [x] Style badges with semibold + letter-spacing
- [x] Style labels with medium weight
- [x] Style captions with regular weight
- [x] Style navigation with medium/semibold toggle
- [x] Add Tailwind font weight utilities
- [x] Add Tailwind letter-spacing utilities
- [ ] Apply weights consistently across all pages
- [ ] Test weight rendering on different devices
- [ ] Optimize font loading performance

## Performance Tips

1. **Font Display**: Use `font-display: swap` in `@font-face` for better loading
2. **Subset Loading**: Only load Latin characters if not using other scripts
3. **Preload Critical Weights**: Preload Regular (400) and Semibold (600) for LCP
4. **Variable Font**: Consider using Manrope variable font for smaller file size

```html
<!-- Preload critical fonts -->
<link 
  rel="preload" 
  href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&display=swap" 
  as="style" 
/>
```




