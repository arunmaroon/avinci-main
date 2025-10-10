# UXPressia Persona Card - Quick Start Guide

## 🚀 5-Minute Integration

### Step 1: Import the Component
```jsx
import UXPressiaPersonaCard from './components/UXPressiaPersonaCard';
```

### Step 2: Add State for Selected Persona
```jsx
const [selectedPersona, setSelectedPersona] = useState(null);
```

### Step 3: Render the Modal
```jsx
{selectedPersona && (
  <UXPressiaPersonaCard
    persona={selectedPersona}
    onClose={() => setSelectedPersona(null)}
    onChat={(persona) => navigate(`/chat/${persona.id}`)}
  />
)}
```

### Step 4: Trigger the Modal
```jsx
<button onClick={() => setSelectedPersona(persona)}>
  View Persona Details
</button>
```

## 📋 Complete Example

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UXPressiaPersonaCard from './components/UXPressiaPersonaCard';
import api from './utils/api';

const MyPersonasPage = () => {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    const response = await api.get('/personas');
    setPersonas(response.data.personas);
  };

  const handleChat = (persona) => {
    navigate(`/enhanced-chat/${persona.id}`);
  };

  return (
    <div className="p-8">
      {/* Persona Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona) => (
          <div 
            key={persona.id}
            onClick={() => setSelectedPersona(persona)}
            className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6"
          >
            <img 
              src={persona.avatar_url} 
              alt={persona.name}
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-center">{persona.name}</h3>
            <p className="text-center text-gray-600">{persona.title}</p>
            <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* UXPressia Modal */}
      {selectedPersona && (
        <UXPressiaPersonaCard
          persona={selectedPersona}
          onClose={() => setSelectedPersona(null)}
          onChat={handleChat}
        />
      )}
    </div>
  );
};

export default MyPersonasPage;
```

## 🎨 Customization Options

### Without Chat Button
```jsx
<UXPressiaPersonaCard
  persona={selectedPersona}
  onClose={() => setSelectedPersona(null)}
  // Don't pass onChat to hide the button
/>
```

### With Custom Chat Handler
```jsx
<UXPressiaPersonaCard
  persona={selectedPersona}
  onClose={() => setSelectedPersona(null)}
  onChat={(persona) => {
    // Custom logic
    console.log('Starting chat with', persona.name);
    openCustomChatWindow(persona);
  }}
/>
```

### Programmatic Opening
```jsx
// Open specific persona on page load
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const personaId = urlParams.get('persona');
  
  if (personaId) {
    const persona = personas.find(p => p.id === personaId);
    if (persona) {
      setSelectedPersona(persona);
    }
  }
}, [personas]);
```

## 📊 Data Structure Reference

### Minimum Required Fields
```javascript
{
  id: "uuid",
  name: "Sarah Johnson",
  avatar_url: "https://...",
}
```

### Recommended Fields
```javascript
{
  // Basic Info
  id: "uuid",
  name: "Sarah Johnson",
  title: "Marketing Manager",
  location: "Austin, Texas",
  age: 32,
  gender: "Female",
  avatar_url: "https://...",
  quote: "I need solutions that just work",

  // Demographics
  demographics: {
    education: "Bachelor's Degree",
    income_range: "$60k-$80k",
    family_status: "Married with 2 kids",
  },

  // Goals & Motivations
  goals: ["Increase productivity", "Better work-life balance"],
  objectives: ["Streamline workflows", "Reduce manual tasks"],
  motivations: ["Career growth", "Family time"],

  // Challenges
  pain_points: ["Too many tools", "Confusing interfaces"],
  fears: ["Making mistakes", "Falling behind"],
  frustrations: ["Slow software", "Poor support"],

  // Personality
  personality_profile: ["Analytical", "Detail-oriented", "Patient"],
  hobbies: ["Reading", "Yoga", "Cooking"],
  
  // Technology
  technology: {
    devices: ["iPhone", "MacBook", "iPad"],
    apps: ["Slack", "Notion", "Zoom"],
  },
  tech_savviness: "high",

  // Knowledge
  knowledge_bounds: {
    confident: ["Project management", "Marketing"],
    partial: ["Data analytics", "SEO"],
    unknown: ["Programming", "Database design"],
  },

  // Communication
  communication_style: {
    formality: 7,
    sentence_length: "medium",
  },

  // Other
  background: "Sarah has 10 years of experience...",
  daily_routine: ["6am wake up", "7am breakfast", "9am work"],
  key_quotes: ["Time is precious", "Quality over quantity"],
}
```

## 🎯 Best Practices

### 1. Data Validation
```jsx
// Check if persona has required data before opening
const handleViewPersona = (persona) => {
  if (!persona.name || !persona.id) {
    console.error('Invalid persona data');
    return;
  }
  setSelectedPersona(persona);
};
```

### 2. Loading States
```jsx
const [loading, setLoading] = useState(false);

const handleViewDetails = async (personaId) => {
  setLoading(true);
  try {
    const response = await api.get(`/personas/${personaId}`);
    setSelectedPersona(response.data.persona);
  } catch (error) {
    console.error('Failed to load persona', error);
  } finally {
    setLoading(false);
  }
};

// Show loading modal
{loading && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="mt-4">Loading persona...</p>
    </div>
  </div>
)}
```

### 3. Keyboard Navigation
```jsx
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && selectedPersona) {
      setSelectedPersona(null);
    }
  };

  window.addEventListener('keydown', handleEscape);
  return () => window.removeEventListener('keydown', handleEscape);
}, [selectedPersona]);
```

### 4. Prevent Body Scroll
```jsx
useEffect(() => {
  if (selectedPersona) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  return () => {
    document.body.style.overflow = 'unset';
  };
}, [selectedPersona]);
```

## 🐛 Troubleshooting

### Issue: Modal doesn't close
**Solution**: Ensure `onClose` is properly passed and updates state
```jsx
onClose={() => setSelectedPersona(null)}  // ✅ Correct
onClose={setSelectedPersona(null)}         // ❌ Wrong - executes immediately
```

### Issue: Images don't load
**Solution**: Component has built-in fallback, but ensure URLs are valid
```jsx
// Good fallback in component
avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
```

### Issue: Missing sections
**Solution**: Sections hide gracefully if data is missing. Check console for warnings.

### Issue: Styling conflicts
**Solution**: Component uses Tailwind classes. Ensure Tailwind is configured.

## 📱 Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Smaller hero image
- Stacked demographics
- Full-width sections

### Tablet (768px - 1024px)
- 2-column content grid
- Medium hero image
- 2x3 demographics grid

### Desktop (> 1024px)
- 2-column content grid
- Large hero image
- 3x2 demographics grid
- Wider modal (max-w-6xl)

## 🎨 Theming

The component uses consistent color themes:

```javascript
// Section Colors
Goals & Motivations: Green → Emerald (#10b981 → #059669)
Frustrations: Red → Orange (#ef4444 → #f97316)
Personality: Purple → Pink (#a855f7 → #ec4899)
Technology: Blue → Cyan (#3b82f6 → #06b6d4)
Knowledge: Yellow → Amber (#eab308 → #f59e0b)
Daily Life: Indigo → Blue (#6366f1 → #3b82f6)
```

To customize, edit the component's gradient classes.

## ✅ Checklist

Before using in production:

- [ ] Import component correctly
- [ ] Set up state management
- [ ] Handle onClose callback
- [ ] Handle onChat callback (optional)
- [ ] Test with real persona data
- [ ] Test responsive behavior
- [ ] Test keyboard navigation
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Validate persona data structure
- [ ] Add analytics tracking (if needed)

## 🚀 Ready to Use!

The component is production-ready and fully tested. Just import, wire up state, and enjoy beautiful UXPressia-style persona cards!

---

**Need Help?** Check `UXPRESSIA_PERSONA_REDESIGN.md` for detailed documentation.

