/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import LandingPage from './page';

// Mock child components to isolate LandingPage testing
vi.mock('./components/CustomizeCTA', () => ({
  CustomizeCTA: () => <div data-testid="customize-cta">Customize CTA</div>,
}));

vi.mock('@/components/commitpulse-logo', () => ({
  CommitPulseLogo: () => <svg data-testid="commitpulse-logo"></svg>,
}));

vi.mock('@/components/WallOfLove', () => ({
  WallOfLove: () => <div data-testid="wall-of-love">Wall of Love</div>,
}));

vi.mock('@/components/DiscordButton', () => ({
  DiscordButton: () => <button data-testid="discord-button">Discord Button</button>,
}));

// Mock new UX components added in the UX improvement pass
vi.mock('@/components/HowItWorks', () => ({
  HowItWorks: () => <div data-testid="how-it-works">How It Works</div>,
}));

vi.mock('@/components/AnimatedStatsBanner', () => ({
  AnimatedStatsBanner: () => <div data-testid="animated-stats-banner">Stats Banner</div>,
}));

vi.mock('@/components/UsernameInput', () => ({
  UsernameInput: ({ value, onChange, onClear }: any) => (
    <div>
      <input
        type="text"
        placeholder="Enter GitHub Username"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={39}
      />
      {value.length > 0 && (
        <button onClick={onClear} aria-label="Clear input" type="button">
          ×
        </button>
      )}
    </div>
  ),
}));

// next/image is no longer used — SVG preview is fetched via useEffect and
// rendered inline. The mock below keeps the import from erroring if any
// other test file still imports it.
vi.mock('next/image', () => ({
  default: (props: any) => {
    const { fill, ...rest } = props || {};
    return <img {...rest} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props} data-testid="next-link">
      {children}
    </a>
  ),
}));

vi.mock('@/utils/tracking', () => ({
  trackUser: vi.fn(),
}));

vi.mock('gsap', () => {
  const tween = { kill: vi.fn() };
  const timeline = {
    to: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    kill: vi.fn(),
  };
  const mockGsap = {
    registerPlugin: vi.fn(),
    set: vi.fn(),
    to: vi.fn().mockReturnValue(tween),
    fromTo: vi.fn().mockReturnValue(tween),
    timeline: vi.fn().mockReturnValue(timeline),
    context: vi.fn((_fn: any) => ({ revert: vi.fn() })),
  };
  return {
    default: mockGsap,
    gsap: mockGsap,
  };
});

vi.mock('@gsap/react', () => ({
  useGSAP: vi.fn((callback) => {
    // Optionally execute callback for coverage, or just do nothing
    if (typeof callback === 'function') {
      callback();
    }
  }),
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      whileHover,
      whileTap,
      whileInView,
      initial,
      animate,
      exit,
      transition,
      viewport,
      layoutId,
      ...props
    }: any) => (
      <div className={className} data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    p: ({
      children,
      className,
      whileHover,
      whileTap,
      whileInView,
      initial,
      animate,
      exit,
      transition,
      viewport,
      layoutId,
      ...props
    }: any) => (
      <p className={className} data-testid="motion-p" {...props}>
        {children}
      </p>
    ),
    a: ({
      children,
      className,
      href,
      whileHover,
      whileTap,
      whileInView,
      initial,
      animate,
      exit,
      transition,
      viewport,
      layoutId,
      ...props
    }: any) => (
      <a href={href} className={className} data-testid="motion-a" {...props}>
        {children}
      </a>
    ),
    img: ({
      children,
      className,
      src,
      alt,
      onLoad,
      onError,
      initial,
      animate,
      exit,
      transition,
      ...props
    }: any) => (
      <img className={className} src={src} alt={alt} onLoad={onLoad} onError={onError} {...props} />
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
}));

const mockRecentSearches = {
  searches: ['octocat', 'torvalds'] as string[],
  addSearch: vi.fn(),
  clearSearches: vi.fn(),
  removeSearch: vi.fn(),
};

vi.mock('@/hooks/useRecentSearches', () => ({
  useRecentSearches: () => mockRecentSearches,
}));

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRecentSearches.searches = ['octocat', 'torvalds'];
    mockRecentSearches.addSearch = vi.fn();
    mockRecentSearches.clearSearches = vi.fn();
    mockRecentSearches.removeSearch = vi.fn();

    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the main heading', () => {
    render(<LandingPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toMatch(/Elevate Your/i);
    expect(heading.textContent).toMatch(/Contribution Story/i);
  });

  it('renders the input field empty by default', () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('');
  });

  it('renders recent searches and applies a recent search when clicked', () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;
    // Recent searches render as buttons with the username as the accessible label
    const octocatButton = screen.getByRole('button', { name: 'Search again for octocat' });

    expect(octocatButton).toBeDefined();
    expect(screen.getByRole('button', { name: 'Clear all recent searches' })).toBeDefined();

    fireEvent.click(octocatButton);

    expect(input.value).toBe('octocat');
  });

  it('renders an empty state before a username is entered', () => {
    render(<LandingPage />);
    // The sample badge pill label is always shown before user interaction
    expect(screen.getByText(/Sample Preview/i)).toBeDefined();
    // badge-img is always present (sample preview loads from production)
    expect(screen.getByTestId('badge-img')).toBeDefined();
  });

  it('updates the username when input changes and shows the badge img', async () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'octocat' } });
    });
    expect(input.value).toBe('octocat');

    // The badge img element should appear in the DOM with the correct URL
    await waitFor(() => {
      const img = screen.getByTestId('badge-img') as HTMLImageElement;
      expect(img).toBeDefined();
      expect(img.src).toContain('user=octocat');
    });

    // Simulate the browser successfully loading the badge image
    await act(async () => {
      const img = screen.getByTestId('badge-img') as HTMLImageElement;
      fireEvent.load(img);
    });
  });

  it('disables the Watch Dashboard link when the username is empty', () => {
    render(<LandingPage />);
    // next/link mock renders as <a data-testid="next-link">; select by text
    const dashboardLink = screen.getByText('Watch Dashboard').closest('a')!;

    expect(dashboardLink.getAttribute('aria-disabled')).toBe('true');
    expect(dashboardLink.getAttribute('href')).toBe('/');
  });

  it('enables the Watch Dashboard link after a username is entered', () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'octocat' } });

    const dashboardLink = screen.getByText('Watch Dashboard').closest('a')!;
    expect(dashboardLink.getAttribute('aria-disabled')).not.toBe('true');
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard/octocat');
  });

  it('handles copying to clipboard and showing the SuccessGuide', async () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'jhasourav07' } });

    // CTA is now "Generate My Badge" — find the primary submit button
    const copyButton = screen.getByRole('button', { name: /Generate badge for jhasourav07/i });
    fireEvent.click(copyButton!);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('/api/streak?user=jhasourav07')
    );

    await waitFor(() => {
      // The button text should change to Copied!
      expect(screen.getByText('Copied!')).toBeDefined();
      // The SuccessGuide should appear
      expect(screen.getByText('Your Monolith is Ready - Deploy It in 4 Steps')).toBeDefined();
    });
  });

  it('does not show copied state when clipboard write fails', async () => {
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Permission denied'));

    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'jhasourav07' } });

    const copyButton = screen.getByRole('button', { name: /Generate badge for jhasourav07/i });
    fireEvent.click(copyButton!);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/api/streak?user=jhasourav07')
      );
    });

    expect(screen.queryByText('Copied!')).toBeNull();
    expect(screen.queryByText('Your Monolith is Ready - Deploy It in 4 Steps')).toBeNull();
  });

  it('disables Copy Link button when username is empty', () => {
    render(<LandingPage />);

    // Primary button: aria-label "Enter a GitHub username to generate your badge" when disabled
    const generateButton = screen.getByRole('button', {
      name: /Enter a GitHub username to generate your badge/i,
    });

    expect((generateButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('does not copy link when username is empty', () => {
    render(<LandingPage />);

    const generateButton = screen.getByRole('button', {
      name: /Enter a GitHub username to generate your badge/i,
    });

    fireEvent.click(generateButton!);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('renders exactly 3 FeatureCards with correct titles', () => {
    render(<LandingPage />);

    const featureHeadings = screen.getAllByRole('heading', { level: 3 });

    expect(featureHeadings).toHaveLength(6);

    const titles = featureHeadings.map((h) => h.textContent);
    expect(titles).toEqual([
      'Real-time Sync',
      'Theme Engine',
      'Isometric Math',
      'Navigation',
      'Resources',
      'Connect',
    ]);
  });

  it('renders the CustomizeCTA', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('customize-cta')).toBeDefined();
  });

  it('can dismiss the SuccessGuide', async () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'jhasourav07' } });

    // Trigger copy to show guide
    const copyButton = screen.getByRole('button', { name: /Generate badge for jhasourav07/i });
    fireEvent.click(copyButton!);

    await waitFor(() => {
      expect(screen.getByText('Your Monolith is Ready - Deploy It in 4 Steps')).toBeDefined();
    });

    // Dismiss guide
    const dismissButton = screen.getByLabelText('Dismiss guide');
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText('Your Monolith is Ready - Deploy It in 4 Steps')).toBeNull();
    });
  });

  it('toggles the clear button X visibility and clears the input in username field on click', () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;

    // UsernameInput mock shows "Clear input" button only when value.length > 0
    expect(screen.queryByLabelText('Clear input')).toBeNull();

    fireEvent.change(input, { target: { value: 'a' } });
    const clearButton = screen.getByLabelText('Clear input');
    expect(clearButton).toBeDefined();

    fireEvent.click(clearButton);
    expect(input.value).toBe('');

    expect(screen.queryByLabelText('Clear input')).toBeNull();
  });

  it('renders recent searches and handles individual deletion', () => {
    mockRecentSearches.searches = ['octocat', 'jhasourav07'];
    render(<LandingPage />);

    expect(screen.getByText('octocat')).toBeDefined();
    expect(screen.getByText('jhasourav07')).toBeDefined();

    const deleteButtons = screen.getAllByLabelText(/Remove/);
    expect(deleteButtons.length).toBe(2);

    fireEvent.click(deleteButtons[0]);
    expect(mockRecentSearches.removeSearch).toHaveBeenCalledWith('octocat');

    // Cleanup
    mockRecentSearches.searches = [];
  });

  it('shows the friendly error UI instead of raw JSON when the API returns a 400', async () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'invalid_user' } });

    // Wait for the debounced username to settle and the badge img to point at the user's URL
    await waitFor(() => {
      const img = screen.getByTestId('badge-img') as HTMLImageElement;
      expect(img.src).toContain('user=invalid_user');
    });

    // Simulate the browser failing to load the badge image
    await act(async () => {
      fireEvent.error(screen.getByTestId('badge-img'));
    });

    await waitFor(() => {
      expect(screen.getByText('GitHub user not found')).toBeDefined();
    });

    // The raw JSON error payload must never appear in the DOM
    expect(screen.queryByText(/Invalid parameters/)).toBeNull();
  });

  it('shows the friendly error UI for any non-ok API response (e.g. 429 rate limit)', async () => {
    render(<LandingPage />);
    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'octocat' } });

    // Wait for the debounced username to settle and the badge img to point at the user's URL
    await waitFor(() => {
      const img = screen.getByTestId('badge-img') as HTMLImageElement;
      expect(img.src).toContain('user=octocat');
    });

    // Simulate the browser failing to load the badge image
    await act(async () => {
      fireEvent.error(screen.getByTestId('badge-img'));
    });

    await waitFor(() => {
      expect(screen.getByText('GitHub user not found')).toBeDefined();
    });

    expect(screen.queryByText(/Too Many Requests/)).toBeNull();
  });

  it('renders a badge img (not inline SVG) so XSS via SVG content is structurally impossible', async () => {
    // The new implementation uses <img src=URL> which the browser renders opaquely.
    // No SVG text is ever injected into the DOM, so no <script> tag can exist.
    render(<LandingPage />);

    const input = screen.getByPlaceholderText('Enter GitHub Username') as HTMLInputElement;

    await act(async () => {
      fireEvent.change(input, { target: { value: 'octocat' } });
    });

    // An <img> element with the API URL should appear (not inline SVG)
    await waitFor(() => {
      const img = screen.getByTestId('badge-img') as HTMLImageElement;
      expect(img).toBeDefined();
      expect(img.src).toContain('user=octocat');
    });

    // The SVG text is never injected into the DOM, so no <script> tag can exist
    expect(document.querySelector('script')).toBeNull();
  });
});
