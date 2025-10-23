import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AdminPanel from '../pages/AdminPanel';
import PersonaCard from '../components/PersonaCard';
import FigmaImportModal from '../components/FigmaImportModal';
import { useAdminStore } from '../stores/adminStore';
import { useChatStore } from '../stores/chatStore';

// Mock the stores
jest.mock('../stores/adminStore');
jest.mock('../stores/chatStore');

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserIcon: () => <div data-testid="user-icon" />,
  PlusIcon: () => <div data-testid="plus-icon" />,
  EyeIcon: () => <div data-testid="eye-icon" />,
  PencilIcon: () => <div data-testid="pencil-icon" />,
  TrashIcon: () => <div data-testid="trash-icon" />,
  ArrowDownTrayIcon: () => <div data-testid="download-icon" />,
  LinkIcon: () => <div data-testid="link-icon" />,
  SparklesIcon: () => <div data-testid="sparkles-icon" />,
  CloudArrowUpIcon: () => <div data-testid="cloud-upload-icon" />,
  DocumentTextIcon: () => <div data-testid="document-icon" />,
  XMarkIcon: () => <div data-testid="close-icon" />,
}));

// Mock axios
jest.mock('axios');
const axios = require('axios');

const mockAdminStore = {
  users: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z'
    }
  ],
  personas: [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Product Manager',
      age: 32,
      location: 'San Francisco',
      goals: 'Launch successful products that users love',
      painPoints: 'Struggles with unclear user feedback',
      behaviors: 'Prefers data-driven decisions',
      traits: 'Analytical, detail-oriented',
      demographics: {
        gender: 'Female',
        income: '$100k-150k',
        education: 'MBA',
        occupation: 'Product Manager'
      }
    }
  ],
  figmaDesigns: [
    {
      id: '1',
      name: 'Mobile App Design',
      fileKey: 'abc123',
      analysis: {
        suggestions: ['Increase button padding', 'Improve color contrast'],
        layout: { score: 8 },
        colors: { score: 7 },
        typography: { score: 9 }
      },
      createdAt: '2024-01-01T00:00:00Z'
    }
  ],
  fetchUsers: jest.fn(),
  fetchPersonas: jest.fn(),
  fetchFigmaDesigns: jest.fn(),
  createUser: jest.fn(),
  createPersona: jest.fn(),
  importFigmaDesign: jest.fn(),
  updateUser: jest.fn(),
  updatePersona: jest.fn(),
  deleteUser: jest.fn(),
  deletePersona: jest.fn(),
  deleteFigmaDesign: jest.fn(),
  isLoading: false,
  error: null
};

const mockChatStore = {
  conversations: {},
  currentConversationId: null,
  figmaData: [],
  personas: [],
  isLoading: false,
  error: null,
  addFigmaData: jest.fn(),
  addPersona: jest.fn(),
  getFigmaData: jest.fn(),
  updateFigmaData: jest.fn(),
  removeFigmaData: jest.fn(),
  searchFigmaData: jest.fn(),
  exportData: jest.fn(),
  importData: jest.fn(),
  reset: jest.fn()
};

describe('AdminPanel', () => {
  beforeEach(() => {
    useAdminStore.mockReturnValue(mockAdminStore);
    useChatStore.mockReturnValue(mockChatStore);
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders admin panel with all tabs', () => {
    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Personas')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('displays users in users tab', () => {
    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  test('displays personas in personas tab', () => {
    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    // Click on personas tab
    fireEvent.click(screen.getByText('Personas'));

    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
  });

  test('displays figma designs in figma tab', () => {
    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    // Click on figma tab
    fireEvent.click(screen.getByText('Figma'));

    expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
    expect(screen.getByText('abc123')).toBeInTheDocument();
  });

  test('opens persona import modal when create persona button is clicked', () => {
    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    // Click on personas tab
    fireEvent.click(screen.getByText('Personas'));

    // Click create persona button
    const createButton = screen.getByText('Create Persona');
    fireEvent.click(createButton);

    expect(screen.getByText('Create New Persona')).toBeInTheDocument();
  });

  test('opens figma import modal when import figma button is clicked', () => {
    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    // Click on figma tab
    fireEvent.click(screen.getByText('Figma'));

    // Click import figma button
    const importButton = screen.getByText('Import Figma Design');
    fireEvent.click(importButton);

    expect(screen.getByText('Import Figma Design')).toBeInTheDocument();
  });
});

describe('PersonaCard', () => {
  const mockPersona = {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Product Manager',
    age: 32,
    location: 'San Francisco',
    goals: 'Launch successful products that users love',
    painPoints: 'Struggles with unclear user feedback',
    behaviors: 'Prefers data-driven decisions',
    traits: 'Analytical, detail-oriented',
    demographics: {
      gender: 'Female',
      income: '$100k-150k',
      education: 'MBA',
      occupation: 'Product Manager'
    },
    figmaConnections: [
      {
        id: 'figma-1',
        name: 'Mobile App Design',
        feedback: 'As Sarah, this design supports my goal of launching successful products',
        score: 8
      }
    ]
  };

  test('renders persona information correctly', () => {
    render(<PersonaCard persona={mockPersona} />);

    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
    expect(screen.getByText('32 years old, San Francisco')).toBeInTheDocument();
    expect(screen.getByText('Launch successful products that users love')).toBeInTheDocument();
    expect(screen.getByText('Struggles with unclear user feedback')).toBeInTheDocument();
  });

  test('expands to show additional details when eye icon is clicked', () => {
    render(<PersonaCard persona={mockPersona} />);

    const eyeButton = screen.getByTestId('eye-icon').parentElement;
    fireEvent.click(eyeButton);

    expect(screen.getByText('Behaviors')).toBeInTheDocument();
    expect(screen.getByText('Traits')).toBeInTheDocument();
    expect(screen.getByText('Demographics')).toBeInTheDocument();
  });

  test('displays figma connections when available', () => {
    render(<PersonaCard persona={mockPersona} />);

    expect(screen.getByText('Design Feedback')).toBeInTheDocument();
    expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
  });

  test('opens figma import modal when import button is clicked', () => {
    render(<PersonaCard persona={mockPersona} />);

    const importButton = screen.getByText('Import from Figma');
    fireEvent.click(importButton);

    expect(screen.getByText('Import Figma Design')).toBeInTheDocument();
  });

  test('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    render(<PersonaCard persona={mockPersona} onEdit={mockOnEdit} />);

    const editButton = screen.getByTestId('pencil-icon').parentElement;
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockPersona);
  });

  test('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    render(<PersonaCard persona={mockPersona} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTestId('trash-icon').parentElement;
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});

describe('FigmaImportModal', () => {
  const mockOnClose = jest.fn();
  const mockOnImport = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnImport.mockClear();
  });

  test('renders modal when isOpen is true', () => {
    render(
      <FigmaImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImport={mockOnImport}
      />
    );

    expect(screen.getByText('Import Figma Design')).toBeInTheDocument();
    expect(screen.getByText('File Key')).toBeInTheDocument();
    expect(screen.getByText('Access Token')).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(
      <FigmaImportModal
        isOpen={false}
        onClose={mockOnClose}
        onImport={mockOnImport}
      />
    );

    expect(screen.queryByText('Import Figma Design')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(
      <FigmaImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImport={mockOnImport}
      />
    );

    const closeButton = screen.getByTestId('close-icon').parentElement;
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('validates required fields before submission', async () => {
    render(
      <FigmaImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImport={mockOnImport}
      />
    );

    const submitButton = screen.getByText('Import Design');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('File key is required')).toBeInTheDocument();
      expect(screen.getByText('Access token is required')).toBeInTheDocument();
    });

    expect(mockOnImport).not.toHaveBeenCalled();
  });

  test('calls onImport with form data when form is submitted', async () => {
    render(
      <FigmaImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImport={mockOnImport}
      />
    );

    const fileKeyInput = screen.getByLabelText('File Key');
    const tokenInput = screen.getByLabelText('Access Token');
    const submitButton = screen.getByText('Import Design');

    fireEvent.change(fileKeyInput, { target: { value: 'abc123' } });
    fireEvent.change(tokenInput, { target: { value: 'token123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnImport).toHaveBeenCalledWith({
        fileKey: 'abc123',
        accessToken: 'token123'
      });
    });
  });

  test('handles file upload for direct import', async () => {
    render(
      <FigmaImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImport={mockOnImport}
      />
    );

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText('Upload Design File');

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText('test.png')).toBeInTheDocument();
  });

  test('validates file type and size', async () => {
    render(
      <FigmaImportModal
        isOpen={true}
        onClose={mockOnClose}
        onImport={mockOnImport}
      />
    );

    // Test invalid file type
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText('Upload Design File');

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText('Please upload a PNG or JPG file')).toBeInTheDocument();
    });

    // Test file too large
    const largeFile = new File(['test'], 'large.png', { type: 'image/png' });
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 }); // 6MB

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('File size must be less than 5MB')).toBeInTheDocument();
    });
  });
});

describe('AdminPanel Integration', () => {
  test('completes full figma import workflow', async () => {
    // Mock successful API responses
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        id: '1',
        name: 'Test Design',
        fileKey: 'abc123',
        analysis: {
          suggestions: ['Improve button spacing'],
          layout: { score: 8 },
          colors: { score: 7 }
        }
      }
    });

    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    // Click on figma tab
    fireEvent.click(screen.getByText('Figma'));

    // Click import figma button
    fireEvent.click(screen.getByText('Import Figma Design'));

    // Fill form
    const fileKeyInput = screen.getByLabelText('File Key');
    const tokenInput = screen.getByLabelText('Access Token');

    fireEvent.change(fileKeyInput, { target: { value: 'abc123' } });
    fireEvent.change(tokenInput, { target: { value: 'token123' } });

    // Submit form
    fireEvent.click(screen.getByText('Import Design'));

    await waitFor(() => {
      expect(mockAdminStore.importFigmaDesign).toHaveBeenCalledWith({
        fileKey: 'abc123',
        accessToken: 'token123'
      });
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    axios.post.mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    // Click on figma tab
    fireEvent.click(screen.getByText('Figma'));

    // Click import figma button
    fireEvent.click(screen.getByText('Import Figma Design'));

    // Fill form
    const fileKeyInput = screen.getByLabelText('File Key');
    const tokenInput = screen.getByLabelText('Access Token');

    fireEvent.change(fileKeyInput, { target: { value: 'abc123' } });
    fireEvent.change(tokenInput, { target: { value: 'token123' } });

    // Submit form
    fireEvent.click(screen.getByText('Import Design'));

    await waitFor(() => {
      expect(screen.getByText('Failed to import Figma design')).toBeInTheDocument();
    });
  });
});

describe('Accessibility', () => {
  test('admin panel has proper ARIA labels', () => {
    render(
      <BrowserRouter>
        <AdminPanel />
      </BrowserRouter>
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Personas' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Figma' })).toBeInTheDocument();
  });

  test('persona card has proper ARIA labels', () => {
    const mockPersona = {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Product Manager',
      goals: 'Test goals',
      painPoints: 'Test pain points',
      behaviors: 'Test behaviors',
      traits: 'Test traits'
    };

    render(<PersonaCard persona={mockPersona} />);

    expect(screen.getByRole('button', { name: /expand/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import from figma/i })).toBeInTheDocument();
  });

  test('figma import modal has proper ARIA labels', () => {
    render(
      <FigmaImportModal
        isOpen={true}
        onClose={jest.fn()}
        onImport={jest.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('File Key')).toBeInTheDocument();
    expect(screen.getByLabelText('Access Token')).toBeInTheDocument();
  });
});

