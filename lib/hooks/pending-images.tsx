"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type PendingStatus = "local" | "processed" | "failed";

export type PendingImage = {
  id: string;
  url: string; // local object url or remote url
  title?: string;
  description?: string;
  status: PendingStatus;
  createdAt: number;
  finalId?: string; // database id when processed
};

type PendingImagesContextType = {
  items: PendingImage[];
  add: (item: PendingImage) => void;
  update: (id: string, patch: Partial<PendingImage>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const noop = () => {};
const defaultCtx: PendingImagesContextType = {
  items: [],
  add: noop,
  update: noop,
  remove: noop,
  clear: noop,
};
const PendingImagesContext =
  createContext<PendingImagesContextType>(defaultCtx);

export function PendingImagesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<PendingImage[]>([]);

  const api = useMemo<PendingImagesContextType>(
    () => ({
      items,
      add: (item) => setItems((prev) => [item, ...prev]),
      update: (id, patch) =>
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
        ),
      remove: (id) => setItems((prev) => prev.filter((it) => it.id !== id)),
      clear: () => setItems([]),
    }),
    [items]
  );

  return (
    <PendingImagesContext.Provider value={api}>
      {children}
    </PendingImagesContext.Provider>
  );
}

export function usePendingImages() {
  return useContext(PendingImagesContext);
}
