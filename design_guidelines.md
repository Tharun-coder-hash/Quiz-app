# QuizMaster Nexus Design Guidelines

## Design Approach
**Reference-Based with System Foundation**: Draw inspiration from educational platforms (Khan Academy, Coursera, Duolingo) combined with Material Design principles for information-dense applications. Focus on clarity, readability, and minimizing cognitive load during quiz-taking.

## Core Design Elements

### Typography
- **Primary Font**: Inter or System UI (-apple-system, BlinkMacSystemFont)
- **Hierarchy**:
  - Hero/Page Titles: text-3xl to text-4xl, font-bold
  - Section Headings: text-xl to text-2xl, font-semibold
  - Card Titles: text-lg, font-semibold
  - Body Text: text-base, font-normal
  - Meta/Labels: text-sm to text-xs, font-medium
  - All caps labels: text-xs, font-bold, tracking-wider, uppercase

### Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Container: max-w-7xl for main layout, max-w-3xl for quiz content, max-w-xl for forms
- Section Padding: py-8 (mobile), py-12 to py-20 (desktop)
- Card Padding: p-4 to p-6
- Gap Between Elements: gap-4 to gap-8
- Grid Layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for course cards

### Component Library

**Navigation Header**
- Sticky top header (h-16) with max-w-7xl container
- Logo + app name on left, search bar center, theme toggle + admin controls on right
- Border bottom with subtle shadow for elevation
- Dark mode: bg-gray-800 with border-gray-700

**Search Bar**
- Rounded-full input with left icon (pl-10)
- Focus state: ring-2 ring-indigo-500
- Placeholder text in muted gray

**Course Cards**
- White background with rounded-2xl corners
- Border: border-gray-100, hover: border-indigo-500 with ring
- Header section with icon (BookOpen) + title + description
- Nested quiz grid below with 3-column layout on desktop
- Subtle hover elevations (hover:shadow-md)

**Quiz Cards (within courses)**
- Rounded-xl with border transitions
- Composite badge: small purple pill (bg-purple-100 text-purple-700)
- Time limit indicator with Clock icon
- Hover state reveals "Start Quiz" CTA with PlayCircle icon

**Quiz Taking Interface**
- Clean white cards (rounded-2xl) for each question
- Question number badge (rounded-full, bg-gray-100)
- Points display in top-right corner
- Radio/Checkbox options in rounded-xl containers with generous padding (p-4)
- Selected state: indigo border + ring + light background tint
- Submit button: Large (text-lg), indigo, rounded-xl, shadow-lg

**Results Display**
- Large percentage score (text-6xl, font-black) in indigo
- Individual question cards with left border (green/red) indicating correctness
- CheckCircle/XCircle icons for visual feedback
- Option highlighting: green for correct, red for incorrect, gray for neutral
- "Selected" badge on chosen options

**Admin Dashboard**
- Purple accent for composite quiz indicators
- Dashed border buttons for "Add new" actions
- Icon-based action buttons (Edit, Delete) with hover states
- Nested list layout showing courses → quizzes hierarchy

**Forms (Admin)**
- Clean inputs with border-gray-300, rounded corners
- Focus: ring-2 ring-indigo-500
- Submit buttons: bg-green-600 (Save), bg-indigo-600 (Create)
- Cancel buttons: ghost style (text-gray-600 hover:bg-gray-100)

**Footer**
- Centered disclaimer text (max-w-4xl)
- Small text (text-xs) in muted gray
- Multiple paragraphs with generous line spacing
- Border-top separation from main content

### Dark Mode
- Background: bg-gray-900
- Cards: bg-gray-800
- Borders: border-gray-700
- Text: text-white (headings), text-gray-200 (body), text-gray-400 (muted)
- Inputs: bg-gray-700, border-gray-600
- Smooth transitions: transition-colors duration-300

### Interactive States
- Buttons: Solid color changes on hover (indigo-600 → indigo-700)
- Cards: Border color transitions + subtle ring on hover
- Links: Underline on hover, color shift to brighter shade
- No complex animations - keep interactions instant and responsive

## Special Considerations
- **Quiz Focus**: Minimize distractions during quiz-taking - clean, spacious layout
- **Readability**: High contrast ratios for text, especially in question/option displays
- **Accessibility**: Proper focus states, keyboard navigation support
- **Responsive**: Single column on mobile, multi-column grids on desktop
- **Performance**: Instant state changes, no loading delays for local operations

## Images
No hero images needed - this is a utility-first application. Icons from Lucide React provide sufficient visual interest (ShieldCheck for logo, BookOpen for courses, FileQuestion for quizzes, etc.).