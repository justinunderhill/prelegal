import { renderHook, waitFor } from "@testing-library/react";
import { useTemplates } from "@/lib/hooks/useTemplates";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe("useTemplates hook", () => {
  it("fetches and returns both templates on success", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("# Cover Page"),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("# Standard Terms"),
      });

    const { result } = renderHook(() =>
      useTemplates("/templates/cover.md", "/templates/terms.md")
    );

    // Initially empty
    expect(result.current.coverTemplate).toBe("");
    expect(result.current.termsTemplate).toBe("");
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.coverTemplate).toBe("# Cover Page");
    });

    expect(result.current.termsTemplate).toBe("# Standard Terms");
    expect(result.current.error).toBeNull();
  });

  it("sets error when fetch fails with network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() =>
      useTemplates("/templates/cover.md", "/templates/terms.md")
    );

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });

    expect(result.current.coverTemplate).toBe("");
    expect(result.current.termsTemplate).toBe("");
  });

  it("sets error when fetch returns non-OK status", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: () => Promise.resolve("Not Found"),
    });

    const { result } = renderHook(() =>
      useTemplates("/templates/missing.md", "/templates/terms.md")
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });

  it("calls fetch with both URLs", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("content"),
    });

    renderHook(() =>
      useTemplates("/templates/cover.md", "/templates/terms.md")
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockFetch).toHaveBeenCalledWith("/templates/cover.md");
    expect(mockFetch).toHaveBeenCalledWith("/templates/terms.md");
  });

  it("does not update state after unmount (cancellation)", async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValue(pendingPromise);

    const { result, unmount } = renderHook(() =>
      useTemplates("/templates/cover.md", "/templates/terms.md")
    );

    // Unmount before the fetch resolves
    unmount();

    // Resolve the fetch after unmount
    resolvePromise!({
      ok: true,
      text: () => Promise.resolve("should not appear"),
    });

    // Give time for any state updates
    await new Promise((r) => setTimeout(r, 50));

    // The hook's last state should still be empty (no state update after unmount)
    expect(result.current.coverTemplate).toBe("");
    expect(result.current.termsTemplate).toBe("");
  });
});
