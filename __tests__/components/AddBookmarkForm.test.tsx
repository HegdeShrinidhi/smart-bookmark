import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import AddBookmarkForm from '@/components/AddBookmarkForm'

// Mock the bookmark actions
jest.mock('@/app/actions/bookmarks', () => ({
  createBookmark: jest.fn(),
}))

const mockCreateBookmark = jest.requireMock('@/app/actions/bookmarks').createBookmark

describe('AddBookmarkForm Integration Tests', () => {
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateBookmark.mockResolvedValue({ id: '1' })
  })

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<AddBookmarkForm />)

      expect(screen.getByLabelText(/URL/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument()
    })

    it('should render form title', () => {
      render(<AddBookmarkForm />)
      expect(screen.getByText('Add New Bookmark')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<AddBookmarkForm />)
      expect(screen.getByRole('button', { name: /Add Bookmark/i })).toBeInTheDocument()
    })

    it('should render cancel button when onCancel is provided', () => {
      render(<AddBookmarkForm onCancel={mockOnCancel} />)
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('should not render cancel button when onCancel is not provided', () => {
      render(<AddBookmarkForm />)
      expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should disable submit button when URL is empty', () => {
      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)
      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when URL is provided', async () => {
      const user = userEvent.setup()
      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      const urlInput = screen.getByPlaceholderText('https://example.com')
      await user.type(urlInput, 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Form Submission', () => {
    it('should submit bookmark with URL only', async () => {
      const user = userEvent.setup()
      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      const urlInput = screen.getByPlaceholderText('https://example.com')
      await user.type(urlInput, 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateBookmark).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://example.com',
            title: 'https://example.com',
          })
        )
      })
    })

    it('should submit bookmark with all fields', async () => {
      const user = userEvent.setup()
      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
      await user.type(screen.getByPlaceholderText('Bookmark title (optional)'), 'My Bookmark')
      await user.type(screen.getByPlaceholderText('Add a description...'), 'Test description')
      await user.type(screen.getByPlaceholderText('tag1, tag2, tag3'), 'tag1, tag2')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateBookmark).toHaveBeenCalledWith(
          expect.objectContaining({
            url: 'https://example.com',
            title: 'My Bookmark',
            description: 'Test description',
            tags: ['tag1', 'tag2'],
          })
        )
      })
    })

    it('should parse tags correctly', async () => {
      const user = userEvent.setup()
      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
      await user.type(screen.getByPlaceholderText('tag1, tag2, tag3'), 'react, testing, javascript')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateBookmark).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['react', 'testing', 'javascript'],
          })
        )
      })
    })

    it('should handle empty tags', async () => {
      const user = userEvent.setup()
      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
      await user.type(screen.getByPlaceholderText('tag1, tag2, tag3'), '   ,   ')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockCreateBookmark).toHaveBeenCalledWith(
          expect.not.objectContaining({
            tags: expect.arrayContaining(['', '  ']),
          })
        )
      })
    })

    it('should call onSuccess callback after successful submission', async () => {
      const user = userEvent.setup()
      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      const urlInput = screen.getByPlaceholderText('https://example.com') as HTMLInputElement
      await user.type(urlInput, 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(urlInput.value).toBe('')
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      mockCreateBookmark.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: /Adding/i })).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error message on submission failure', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Failed to create bookmark'
      mockCreateBookmark.mockRejectedValue(new Error(errorMessage))

      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should not call onSuccess on error', async () => {
      const user = userEvent.setup()
      mockCreateBookmark.mockRejectedValue(new Error('Error'))

      render(<AddBookmarkForm onSuccess={mockOnSuccess} />)

      await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')

      const submitButton = screen.getByRole('button', { name: /Add Bookmark/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled()
      })
    })
  })

  describe('Cancel Functionality', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<AddBookmarkForm onCancel={mockOnCancel} />)

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })
})
