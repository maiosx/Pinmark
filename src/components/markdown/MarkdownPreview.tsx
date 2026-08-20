import { createContext, useContext, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { toggleNthTask } from "@/lib/markdown";
import { cn } from "@/lib/utils";

type Ctx = {
  source: string;
  onChange?: (next: string) => void;
  nextIndex: () => number;
};

const MdCtx = createContext<Ctx | null>(null);

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    input: [
      ...((defaultSchema.attributes?.input as string[] | undefined) ?? []),
      "type",
      "checked",
      "disabled",
    ],
    li: [
      ...((defaultSchema.attributes?.li as string[] | undefined) ?? []),
      "className",
      "class",
    ],
    ul: [
      ...((defaultSchema.attributes?.ul as string[] | undefined) ?? []),
      "className",
      "class",
    ],
    ol: [
      ...((defaultSchema.attributes?.ol as string[] | undefined) ?? []),
      "className",
      "class",
    ],
    code: [
      ...((defaultSchema.attributes?.code as string[] | undefined) ?? []),
      "className",
      "class",
    ],
  },
};

function isSafeHref(href?: string) {
  if (!href) return false;
  return /^(https?:|mailto:|#)/i.test(href);
}

function TaskCheckbox({ checked }: { checked?: boolean }) {
  const ctx = useContext(MdCtx);
  const index = useRef<number | null>(null);
  if (index.current === null && ctx) index.current = ctx.nextIndex();
  const i = index.current ?? 0;
  const interactive = Boolean(ctx?.onChange);
  return (
    <input
      type="checkbox"
      checked={Boolean(checked)}
      readOnly={!interactive}
      onChange={(e) => {
        e.stopPropagation();
        if (!ctx?.onChange) return;
        ctx.onChange(toggleNthTask(ctx.source, i));
      }}
      onClick={(e) => e.stopPropagation()}
      className={cn(interactive && "cursor-pointer")}
    />
  );
}

type Props = {
  source: string;
  onChange?: (next: string) => void;
  className?: string;
  paper?: boolean;
};

export function MarkdownPreview({ source, onChange, className, paper }: Props) {
  const counter = useRef(0);
  counter.current = 0;
  const empty = source.trim().length === 0;

  return (
    <MdCtx.Provider
      value={{
        source,
        onChange,
        nextIndex: () => counter.current++,
      }}
    >
      <div className={cn("md", paper && "md-paper", className)}>
        {empty ? (
          <p className="opacity-40 italic">Take a note…</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[[rehypeSanitize, schema]]}
            components={{
              a: ({ href, children }) =>
                isSafeHref(href) ? (
                  <a href={href} target="_blank" rel="noreferrer">
                    {children}
                  </a>
                ) : (
                  <span>{children}</span>
                ),
              input: ({ type, checked }) =>
                type === "checkbox" ? (
                  <TaskCheckbox checked={checked} />
                ) : null,
            }}
          >
            {source}
          </ReactMarkdown>
        )}
      </div>
    </MdCtx.Provider>
  );
}
