import React from 'react';
import { 
  MVButton, 
  MVCard, 
  MVInput, 
  MVBadge,
  MVAvatar,
  MVCheckbox,
  MVTypography
} from '../design-system/mv-components';
import '../design-system/mv-styles.css';

const MVComponentTest = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>POTHOS Design System Test</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>POTHOS Buttons</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <MVButton variant="primary" size="buttonDefault">Primary Button</MVButton>
          <MVButton variant="supportPrimary" size="buttonSmall">Support Primary</MVButton>
          <MVButton variant="supportSecondary" size="buttonDefault">Support Secondary</MVButton>
          <MVButton variant="dangerPrimary" size="buttonDefault">Danger Button</MVButton>
          <MVButton variant="link" size="buttonDefault">Link Button</MVButton>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Cards</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          <MVCard 
            variant="cardVariant1" 
            title="Card Title" 
            subtitle="Card subtitle" 
            icon="💳"
            chipText="New"
          >
            <p>This is card content with some description text.</p>
          </MVCard>
          
          <MVCard 
            variant="cardVariant2" 
            title="Another Card" 
            subtitle="Different variant"
          >
            <p>This card uses variant 2 styling.</p>
          </MVCard>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Inputs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
          <MVInput placeholder="Enter your email" type="email" />
          <MVInput placeholder="Enter your name" />
          <MVInput placeholder="Disabled input" disabled />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Badges</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <MVBadge variant="primary" size="sm">Primary</MVBadge>
          <MVBadge variant="secondary" size="md">Secondary</MVBadge>
          <MVBadge variant="success" size="lg">Success</MVBadge>
          <MVBadge variant="warning" size="md">Warning</MVBadge>
          <MVBadge variant="danger" size="sm">Danger</MVBadge>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Avatars</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <MVAvatar size="sm" alt="JS" />
          <MVAvatar size="md" alt="AB" />
          <MVAvatar size="lg" alt="CD" />
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Checkboxes</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <MVCheckbox checked={false} />
          <MVCheckbox checked={true} />
          <span>Unchecked</span>
          <span>Checked</span>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Typography</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <MVTypography variant="headingLarge" color="highEmphasis">Heading Large</MVTypography>
          <MVTypography variant="headingMedium" color="highEmphasis">Heading Medium</MVTypography>
          <MVTypography variant="headingSmall" color="highEmphasis">Heading Small</MVTypography>
          <MVTypography variant="bodyLarge" color="mediumEmphasis">Body Large Text</MVTypography>
          <MVTypography variant="bodyMedium" color="mediumEmphasis">Body Medium Text</MVTypography>
          <MVTypography variant="bodySmall" color="lowEmphasis">Body Small Text</MVTypography>
          <MVTypography variant="caption" color="lowEmphasis">Caption Text</MVTypography>
        </div>
      </div>
    </div>
  );
};

export default MVComponentTest;

