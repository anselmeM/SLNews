import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signOut: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock("next-auth", () => ({
  default: vi.fn(),
  auth: vi.fn(() => Promise.resolve(null)),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/app/actions/user-actions", () => ({
  toggleSavedArticle: vi.fn(),
  getSavedArticleIds: vi.fn(() => Promise.resolve([])),
  loadPreferences: vi.fn(() =>
    Promise.resolve({ preferredRegion: null, preferredTopics: [] })
  ),
  savePreferences: vi.fn(),
}));

vi.mock("@/app/actions/feed-actions", () => ({
  getPersonalizedNews: vi.fn(() => Promise.resolve([])),
}));

vi.mock("next/link", async () => {
  const React = await import("react");
  const Link = React.forwardRef<HTMLAnchorElement, { children: React.ReactNode; href: string; className?: string }>(
    ({ children, href, className }, ref) => React.createElement("a", { href, className, ref }, children)
  );
  return { default: Link };
});

vi.mock("next/image", async () => {
  const React = await import("react");
  const Image = React.forwardRef<HTMLImageElement, { src: string; alt: string; fill?: boolean; priority?: boolean; sizes?: string; className?: string; [key: string]: unknown }>(
    (props, ref) => React.createElement("img", { ...props, ref })
  );
  return { default: Image };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const createTag = (tag: string) => {
    const Component = ({
      children,
      ...props
    }: { children?: React.ReactNode;[key: string]: unknown }) => {
      const { whileHover, initial, animate, exit, transition, variants, ...rest } = props;
      return React.createElement(tag, rest, children);
    };
    Component.displayName = `mock-${tag}`;
    return Component;
  };
  return {
    motion: {
      article: createTag("article"),
      div: createTag("div"),
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});