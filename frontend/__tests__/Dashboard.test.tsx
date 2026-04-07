import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../src/pages/Dashboard';

vi.mock('../src/services/api', () => ({
  api: {
    dashboard: vi.fn().mockResolvedValue({
      totalActiveCases: 7,
      hearingsNext7Days: 2,
      pendingTasks: 5,
      completedTasks: 3,
    }),
  },
  getRole: () => 'Intern',
  setRole: () => {},
}));

describe('Dashboard', () => {
  beforeEach(() => { /* fresh render each time */ });

  it('renders metrics from the API', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(await screen.findByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
