import { render, screen, waitFor } from '@/__tests__/test-utils'
import AuthButton from '@/components/AuthButton'
import { createClient } from '@/lib/supabase/client'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Mock the auth actions
jest.mock('@/app/actions/auth', () => ({
  signInWithGoogle: jest.fn(),
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('AuthButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
        signOut: jest.fn().mockResolvedValue({}),
      },
    } as any)
  })

  describe('Loading State', () => {
    it('should display loading spinner initially', async () => {
      render(<AuthButton />)

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Unauthenticated State', () => {
    it('should display sign in button when user is not authenticated', async () => {
      render(<AuthButton />)

      await waitFor(() => {
        expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
      })

      const signInButton = screen.getByRole('button', { name: /sign in with google/i })
      expect(signInButton).toBeInTheDocument()
    })

    it('should have correct button styling', async () => {
      render(<AuthButton />)

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /sign in with google/i })
        expect(button).toHaveClass('bg-gradient-to-r')
        expect(button).toHaveClass('from-teal-600')
      })
    })

    it('should display Google icon and text', async () => {
      render(<AuthButton />)

      await waitFor(() => {
        expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
      })
    })
  })

  describe('Authenticated State', () => {
    beforeEach(() => {
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { email: 'test@example.com' } },
          }),
          onAuthStateChange: jest.fn().mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
          }),
          signOut: jest.fn().mockResolvedValue({}),
        },
      } as any)
    })

    it('should display user email when authenticated', async () => {
      render(<AuthButton />)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('should display sign out button when authenticated', async () => {
      render(<AuthButton />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
      })
    })

    it('should display "Signed in" status text', async () => {
      render(<AuthButton />)

      await waitFor(() => {
        expect(screen.getByText('Signed in')).toBeInTheDocument()
      })
    })

    it('should display user avatar with initial', async () => {
      render(<AuthButton />)

      await waitFor(() => {
        expect(screen.getByText('T')).toBeInTheDocument()
      })
    })
  })

  describe('Sign Out Functionality', () => {
    beforeEach(() => {
      mockCreateClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { email: 'test@example.com' } },
          }),
          onAuthStateChange: jest.fn().mockReturnValue({
            data: { subscription: { unsubscribe: jest.fn() } },
          }),
          signOut: jest.fn().mockResolvedValue({}),
        },
      } as any)
    })

    it('should call signOut when sign out button is clicked', async () => {
      render(<AuthButton />)

      await waitFor(() => {
        const signOutButton = screen.getByRole('button', { name: /sign out/i })
        expect(signOutButton).toBeInTheDocument()
      })
    })
  })
})
