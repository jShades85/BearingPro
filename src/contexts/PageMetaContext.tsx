import { createContext, useContext, useMemo, useState } from "react";

type PageMeta = {
  title: string;
  subtitle?: string;
  newLabel?: string;
  onNew?: () => void;
};

type PageMetaContextValue = {
  meta: PageMeta;
  setMeta: (meta: PageMeta) => void;
};

const defaultMeta: PageMeta = { title: "" };

const PageMetaContext = createContext<PageMetaContextValue>({
  meta: defaultMeta,
  setMeta: () => undefined,
});

export function PageMetaProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = useState<PageMeta>(defaultMeta);
  const value = useMemo(() => ({ meta, setMeta }), [meta]);
  return (
    <PageMetaContext.Provider value={value}>
      {children}
    </PageMetaContext.Provider>
  );
}

export function useMeta() {
  return useContext(PageMetaContext);
}
