"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
  tag?: "h1" | "h2" | "h3" | "p" | "span" | "li";
}

export default function EditableText({
  value,
  onChange,
  className = "",
  multiline = false,
  tag: Tag = "p",
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function handleSave() {
    onChange(text);
    setEditing(false);
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setText(value);
              setEditing(false);
            }
          }}
          className={`${className} w-full bg-yellow-50 border border-yellow-300 rounded px-1 py-0.5 outline-none resize-none min-h-[60px]`}
        />
      );
    }
    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setText(value);
            setEditing(false);
          }
        }}
        className={`${className} w-full bg-yellow-50 border border-yellow-300 rounded px-1 py-0.5 outline-none`}
      />
    );
  }

  return (
    <Tag
      onClick={() => setEditing(true)}
      className={`${className} cursor-pointer hover:bg-yellow-50/50 hover:outline hover:outline-1 hover:outline-yellow-300/50 rounded transition-all group relative`}
    >
      {value}
      <Pencil className="w-3 h-3 text-yellow-500 opacity-0 group-hover:opacity-100 inline-block ml-1 transition-opacity print:hidden" />
    </Tag>
  );
}
