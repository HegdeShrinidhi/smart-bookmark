import { render, screen } from '@/__tests__/test-utils'
import LoginCard from '@/components/LoginCard'

// Mock the AuthButton component
jest.mock('@/components/AuthButton', () => {
  return function MockAuthButton() {
    return <button>Mock Sign In Button</button>
  }
})

describe('LoginCard Component', () => {
  it('should render the login card', () => {
    render(<LoginCard />)
    expect(screen.getByText('Smart Bookmark')).toBeInTheDocument()
  })

  it('should display the main title', () => {
    render(<LoginCard />)
    const title = screen.getByText('Smart Bookmark')
    expect(title).toBeInTheDocument()
    expect(title).toHaveClass('text-4xl', 'sm:text-5xl', 'font-bold')
  })

  it('should display the subtitle', () => {
    render(<LoginCard />)
    expect(screen.getByText('Organize your digital life')).toBeInTheDocument()
  })

  it('should display the description text', () => {
    render(<LoginCard />)
    expect(
      screen.getByText(/Save and organize your favorite bookmarks/)
    ).toBeInTheDocument()
  })

  it('should display the footer text about secure authentication', () => {
    render(<LoginCard />)
    expect(
      screen.getByText('Secure authentication with Google')
    ).toBeInTheDocument()
  })

  it('should render the AuthButton component', () => {
    render(<LoginCard />)
    expect(screen.getByText('Mock Sign In Button')).toBeInTheDocument()
  })

  it('should have proper styling classes for animations', () => {
    render(<LoginCard />)
    const card = screen.getByText('Smart Bookmark').closest('div')
    expect(card).toHaveClass('animate-slideUp')
  })

  it('should have proper gradient styling', () => {
    render(<LoginCard />)
    const title = screen.getByText('Smart Bookmark')
    expect(title.parentElement).toHaveClass('bg-gradient-to-r')
  })

  it('should have rounded card styling', () => {
    render(<LoginCard />)
    const container = screen.getByText('Smart Bookmark').closest('div')?.closest('div')
    expect(container).toHaveClass('rounded-3xl')
  })

  it('should have dark mode support classes', () => {
    render(<LoginCard />)
    const mainContent = screen.getByText('Organize your digital life')
    expect(mainContent).toHaveClass('dark:text-slate-300')
  })
})
