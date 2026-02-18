import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils'
import BookmarkCard from '@/components/BookmarkCard'
import type { Bookmark } from '@/types/database'

// Mock the bookmark actions
jest.mock('@/app/actions/bookmarks', () => ({
  deleteBookmark: jest.fn(),
}))

const mockBookmark: Bookmark = {
  id: '1',
  user_id: 'user-123',
  title: 'Test Bookmark',
  url: 'https://example.com',
  description: 'A test bookmark description',
  tags: ['test', 'example'],
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('BookmarkCard Component', () => {
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
    window.alert = jest.fn()
  })

  it('should render bookmark title as a link', () => {
    render(<BookmarkCard bookmark={mockBookmark} />)
    const link = screen.getByRole('link', { name: 'Test Bookmark' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should render bookmark URL', () => {
    render(<BookmarkCard bookmark={mockBookmark} />)
    const urlLink = screen.getByRole('link', { name: 'https://example.com' })
    expect(urlLink).toBeInTheDocument()
  })

  it('should render bookmark description when provided', () => {
    render(<BookmarkCard bookmark={mockBookmark} />)
    expect(screen.getByText('A test bookmark description')).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    const bookmarkWithoutDesc = { ...mockBookmark, description: null }
    render(<BookmarkCard bookmark={bookmarkWithoutDesc} />)
    expect(
      screen.queryByText('A test bookmark description')
    ).not.toBeInTheDocument()
  })

  it('should render all tags', () => {
    render(<BookmarkCard bookmark={mockBookmark} />)
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('example')).toBeInTheDocument()
  })

  it('should not render tags section when no tags provided', () => {
    const bookmarkWithoutTags = { ...mockBookmark, tags: [] }
    render(<BookmarkCard bookmark={bookmarkWithoutTags} />)
    expect(screen.queryByText('test')).not.toBeInTheDocument()
  })

  it('should render formatted date', () => {
    render(<BookmarkCard bookmark={mockBookmark} />)
    expect(screen.getByText(/Added Jan 1, 2024/i)).toBeInTheDocument()
  })

  it('should render delete button', () => {
    render(<BookmarkCard bookmark={mockBookmark} />)
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    expect(deleteButton).toBeInTheDocument()
  })

  it('should have delete button with correct styling', () => {
    render(<BookmarkCard bookmark={mockBookmark} />)
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    expect(deleteButton).toHaveClass('text-red-600', 'dark:text-red-400')
  })

  it('should use card base styling', () => {
    render(<BookmarkCard bookmark={mockBookmark} />)
    const article = screen.getByRole('article')
    expect(article).toHaveClass('card', 'p-5')
  })

  it('should handle missing tags gracefully', () => {
    const bookmarkWithoutTags = { ...mockBookmark, tags: undefined as any }
    const { container } = render(<BookmarkCard bookmark={bookmarkWithoutTags} />)
    expect(container).toBeInTheDocument()
  })
})
