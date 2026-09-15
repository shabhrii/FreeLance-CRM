import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Reset state before each test
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
    })
  })

  it('renders loading state when auth state is resolving', () => {
    useAuthStore.setState({ user: null, loading: true })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Loading...')).toBeDefined()
    expect(screen.queryByText('Protected Content')).toBeNull()
  })

  it('redirects unauthenticated users to /login', () => {
    useAuthStore.setState({ user: null, loading: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeDefined()
    expect(screen.queryByText('Dashboard Content')).toBeNull()
  })

  it('renders protected child routes when user is authenticated', () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@example.com' } as any,
      loading: false,
    })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Dashboard Content')).toBeDefined()
    expect(screen.queryByText('Login Page')).toBeNull()
  })
})
