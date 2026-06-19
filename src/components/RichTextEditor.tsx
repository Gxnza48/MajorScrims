"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Bold, Italic, Strikethrough, Type, X } from "lucide-react";

const PRESET_COLORS = [
    "#FFFFFF",
    "#22D962",
    "#9CA3AF",
    "#FCD34D",
    "#F97316",
    "#EF4444",
    "#60A5FA",
    "#A855F7",
    "#EC4899",
];

interface Props {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [StarterKit, TextStyle, Color],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: { class: "rich-editor" },
        },
    });

    if (!editor) return null;

    const btn = (active: boolean, danger = false) =>
        `rounded-md px-2.5 py-1.5 flex items-center justify-center transition-colors duration-150 ${
            danger
                ? "text-white/60 hover:bg-red-500/15 hover:text-red-400"
                : active
                ? "bg-primary/15 text-primary"
                : "text-white/60 hover:bg-white/10 hover:text-white"
        }`;

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden transition-colors duration-300 focus-within:border-primary/35">
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2.5 border-b border-white/10">

                {/* Format */}
                <button type="button" title="Negrita (Ctrl+B)"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={btn(editor.isActive("bold"))}>
                    <Bold size={14} />
                </button>
                <button type="button" title="Cursiva (Ctrl+I)"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={btn(editor.isActive("italic"))}>
                    <Italic size={14} />
                </button>
                <button type="button" title="Tachado"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={btn(editor.isActive("strike"))}>
                    <Strikethrough size={14} />
                </button>

                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Text size */}
                <button type="button" title="Normal"
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={btn(!editor.isActive("heading"))}>
                    <Type size={13} />
                </button>
                {([1, 2, 3] as const).map(level => (
                    <button key={level} type="button" title={`Título ${level}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                        className={`${btn(editor.isActive("heading", { level }))} text-[11px] font-bold`}>
                        H{level}
                    </button>
                ))}

                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Preset colors */}
                {PRESET_COLORS.map(color => (
                    <button key={color} type="button" title={color}
                        onClick={() => editor.chain().focus().setColor(color).run()}
                        className="w-4.5 h-4.5 rounded-md border border-white/20 transition-colors hover:border-primary/50 flex-shrink-0"
                        style={{ backgroundColor: color, width: "18px", height: "18px" }}
                    />
                ))}

                {/* Custom color picker */}
                <label title="Color personalizado"
                    className="relative w-[18px] h-[18px] rounded-md overflow-hidden border border-white/20 cursor-pointer transition-colors hover:border-primary/50 flex-shrink-0">
                    <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        onChange={e => editor.chain().focus().setColor(e.target.value).run()} />
                    <div className="w-full h-full bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" />
                </label>

                <div className="w-px h-5 bg-white/10 mx-0.5" />

                {/* Clear all formatting */}
                <button type="button" title="Limpiar formato"
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    className={btn(false, true)}>
                    <X size={13} />
                </button>
            </div>

            {/* Editor area */}
            <EditorContent editor={editor} data-placeholder={placeholder} />
        </div>
    );
}
