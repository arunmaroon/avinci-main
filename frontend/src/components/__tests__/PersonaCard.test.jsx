import React from 'react';
import { render, screen } from '@testing-library/react';
import AirbnbAgentCard from '../../components/AirbnbAgentCard';

describe('AirbnbAgentCard', () => {
  it('renders name, occupation and image with attribution', () => {
    const agent = {
      id: '1',
      name: 'Rakesh',
      role_title: 'Engineer',
      occupation: 'Engineer',
      avatar_url: 'https://images.pexels.com/photo.jpg',
      status: 'active',
      demographics: { age: 30 },
      location: 'Bengaluru'
    };

    render(<AirbnbAgentCard agent={agent} index={0} />);
    expect(screen.getByText('Rakesh')).toBeInTheDocument();
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByAltText('Rakesh')).toBeInTheDocument();
    expect(screen.getByText('Via Pexels')).toBeInTheDocument();
  });
});


