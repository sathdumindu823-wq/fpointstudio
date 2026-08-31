"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  defaultHomepageContent,
  type HomepageContent,
} from "@/lib/homepage-content";

const imageFields: Array<{
  key: "heroImageUrl" | "aboutImageUrl" | "contactImageUrl";
  label: string;
}> = [
  { key: "heroImageUrl", label: "Hero background" },
  { key: "aboutImageUrl", label: "About section image" },
  { key: "contactImageUrl", label: "Contact section background" },
];

export default function HomepageEditorPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [content, setContent] = useState<HomepageContent>(defaultHomepageContent);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<HomepageContent[keyof HomepageContent] | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadEditor() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.replace("/admin/login");
        return;
      }

      setEmail(session.user.email || "");

      const { data, error: loadError } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      if (loadError) {
        setError(`Could not load homepage settings: ${loadError.message}`);
      } else if (data?.content && typeof data.content === "object") {
        setContent({ ...defaultHomepageContent, ...(data.content as Partial<HomepageContent>) });
      }

      setLoading(false);
    }

    loadEditor();
  }, [router, supabase]);

  function updateField(key: keyof HomepageContent, value: string) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const { error: saveError } = await supabase
      .from("homepage_content")
      .upsert({ id: 1, content, updated_at: new Date().toISOString() });

    if (saveError) {
      setError(`Could not save: ${saveError.message}`);
    } else {
      setSuccess("Homepage saved. Refresh the public homepage to see the update.");
    }

    setSaving(false);
  }

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>,
    key: "heroImageUrl" | "aboutImageUrl" | "contactImageUrl"
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setUploading(key);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const storagePath = `homepage/${timestamp}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
    } else {
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio").getPublicUrl(storagePath);
      updateField(key, publicUrl);
      setSuccess("Image uploaded. Click Save homepage to publish it.");
    }

    setUploading(null);
    event.target.value = "";
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-black text-white/50">Loading homepage editor…</main>;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-white/50">F Point Studio</p>
            <h1 className="mt-2 text-4xl font-light">Edit Homepage</h1>
            <p className="mt-2 text-sm text-white/40">{email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="border border-white/15 px-5 py-2 text-sm hover:bg-white/10">Portfolio manager</Link>
            <button onClick={logout} className="border border-white/15 px-5 py-2 text-sm hover:bg-white hover:text-black">Logout</button>
          </div>
        </header>

        <p className="mb-8 text-sm leading-6 text-white/55">Edit the wording, paste an image link, or upload a new image. Use a new line in a heading where you want it to break onto a second line.</p>

        {error && <div className="mb-6 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
        {success && <div className="mb-6 border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">{success}</div>}

        <form onSubmit={saveContent} className="space-y-8">
          <EditorSection title="Hero">
            <Field label="Small heading" value={content.heroEyebrow} onChange={(value) => updateField("heroEyebrow", value)} />
            <Field label="Main heading" value={content.heroTitle} multiline onChange={(value) => updateField("heroTitle", value)} />
            <Field label="Description" value={content.heroDescription} multiline onChange={(value) => updateField("heroDescription", value)} />
          </EditorSection>

          <EditorSection title="Services">
            <Field label="Small heading" value={content.servicesEyebrow} onChange={(value) => updateField("servicesEyebrow", value)} />
            <Field label="Main heading" value={content.servicesTitle} multiline onChange={(value) => updateField("servicesTitle", value)} />
            <Field label="Description" value={content.servicesDescription} multiline onChange={(value) => updateField("servicesDescription", value)} />
          </EditorSection>

          <EditorSection title="About">
            <Field label="Small heading" value={content.aboutEyebrow} onChange={(value) => updateField("aboutEyebrow", value)} />
            <Field label="Main heading" value={content.aboutTitle} multiline onChange={(value) => updateField("aboutTitle", value)} />
            <Field label="First paragraph" value={content.aboutParagraphOne} multiline onChange={(value) => updateField("aboutParagraphOne", value)} />
            <Field label="Second paragraph" value={content.aboutParagraphTwo} multiline onChange={(value) => updateField("aboutParagraphTwo", value)} />
          </EditorSection>

          <EditorSection title="Contact">
            <Field label="Small heading" value={content.contactEyebrow} onChange={(value) => updateField("contactEyebrow", value)} />
            <Field label="Main heading" value={content.contactTitle} multiline onChange={(value) => updateField("contactTitle", value)} />
            <Field label="Description" value={content.contactDescription} multiline onChange={(value) => updateField("contactDescription", value)} />
            <Field label="Contact email" value={content.contactEmail} type="email" onChange={(value) => updateField("contactEmail", value)} />
          </EditorSection>

          <EditorSection title="Homepage images">
            {imageFields.map(({ key, label }) => (
              <div key={key} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                <Field label={`${label} URL`} value={content[key]} type="url" onChange={(value) => updateField(key, value)} />
                <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img src={content[key]} alt={`${label} preview`} className="h-28 w-44 border border-white/10 object-cover" />
                  <label className="w-fit cursor-pointer border border-white/15 px-4 py-2 text-sm hover:bg-white/10">
                    {uploading === key ? "Uploading…" : `Upload ${label.toLowerCase()}`}
                    <input type="file" accept="image/*" className="hidden" disabled={uploading !== null} onChange={(event) => uploadImage(event, key)} />
                  </label>
                </div>
              </div>
            ))}
          </EditorSection>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50">{saving ? "Saving…" : "Save homepage"}</button>
            <Link href="/" target="_blank" className="border border-white/15 px-6 py-3 text-sm hover:bg-white/10">Preview website</Link>
          </div>
        </form>
      </div>
    </main>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-5 border border-white/10 bg-white/5 p-6"><h2 className="text-2xl font-light">{title}</h2>{children}</section>;
}

function Field({ label, value, onChange, multiline = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string }) {
  const classes = "w-full border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-white/50";
  return <label className="block text-sm text-white/65"><span className="mb-2 block">{label}</span>{multiline ? <textarea value={value} rows={3} onChange={(event) => onChange(event.target.value)} className={`${classes} resize-y`} /> : <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={classes} />}</label>;
}
