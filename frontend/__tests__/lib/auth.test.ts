import { getStoredUser, signIn, signOut } from "@/lib/auth/client";

describe("auth client", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    Object.defineProperty(global, "fetch", {
      writable: true,
      value: jest.fn(),
    });
  });

  it("stores the user returned by the signin endpoint", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "server-user", email: "user@example.com" }),
    } as Response);

    const user = await signIn("User@Example.com", "secret");

    expect(user).toEqual({ id: "server-user", email: "user@example.com" });
    expect(getStoredUser()).toEqual(user);
  });

  it("creates an account when signin returns unauthorized", async () => {
    jest
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 401 } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "new-user", email: "user@example.com" }),
      } as Response);

    const user = await signIn("user@example.com", "secret");

    expect(user.id).toBe("new-user");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("falls back to stable local auth when the API is unreachable", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("offline"));

    const first = await signIn("User@Example.com", "secret");
    signOut();
    const second = await signIn(" user@example.com ", "secret");

    expect(first.id).toBe(second.id);
    expect(second.email).toBe("user@example.com");
  });

  it("clears the stored user on sign out", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("offline"));
    await signIn("user@example.com", "secret");
    signOut();

    expect(getStoredUser()).toBeNull();
  });
});
