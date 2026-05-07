import { createContext, ReactNode, useContext } from "react";

// TODO: F1c will remove this file entirely once all screens migrate to real hooks.
type Stub = { posts: never[]; commentsByPost: Record<string, never[]>; users: never[] };
const stub: Stub = { posts: [], commentsByPost: {}, users: [] };
const Ctx = createContext<Stub>(stub);

export const FORCE_REGISTERED_TEST_MODE = false;

export function PrototypeStoreProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={stub}>{children}</Ctx.Provider>;
}

export function usePrototypeStore() {
  return useContext(Ctx);
}
