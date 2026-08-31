"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import {
  defaultPortfolioCategoryCoverImages,
  portfolioCategories,
} from "@/lib/portfolio-categories";

type Gallery = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
};

type Photo = {
  id: string;
  title: string | null;
  image_url: string;
  public_id: string | null;
  gallery_id: string;
};

const categories = [
  "Wedding",
  "Portraits",
  "Events",
  "Fashion",
  "Commercial",
  "Drone",
];

const categoryCoverEntries = portfolioCategories.map((category) => ({
  ...category,
  galleryCategory:
    category.slug === "wedding" ? "Wedding" : category.name,
}));

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createStorageFileName(prefix: string, extension: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${timestamp}-${crypto.randomUUID()}.${extension}`;
}

function formatSupabaseError(error: unknown) {
  if (!error || typeof error !== "object") {
    return error instanceof Error ? error.message : "Unknown error.";
  }

  const supabaseError = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };

  const parts = [
    supabaseError.message,
    supabaseError.code ? `Code: ${supabaseError.code}` : undefined,
    supabaseError.details ? `Details: ${supabaseError.details}` : undefined,
    supabaseError.hint ? `Hint: ${supabaseError.hint}` : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : "Unknown error.";
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");

  const [category, setCategory] = useState("Wedding");

  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [galleryId, setGalleryId] = useState("");

  const [photos, setPhotos] = useState<Photo[]>([]);

  const [galleryName, setGalleryName] = useState("");
  const [gallerySlug, setGallerySlug] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [creatingGallery, setCreatingGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [categoryCoverImages, setCategoryCoverImages] = useState<Record<string, string>>(
    defaultPortfolioCategoryCoverImages
  );

  type PortfolioCategoryRow = {
    slug?: string;
    image_url?: string;
  };

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check login using the cached session first so a transient auth/network issue does not leave the dashboard stuck on Loading.
  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.replace("/admin/login");
        return;
      }

      setEmail(session.user.email || "");
      setLoading(false);
    }

    checkUser();
  }, [router, supabase]);

  // Load category cover image URLs
  useEffect(() => {
    async function loadCategoryCoverImages() {
      const { data, error } = await supabase
        .from("portfolio_categories")
        .select("slug, image_url");

      if (error) {
        setError(error.message);
        return;
      }

      const rows = (data ?? []) as PortfolioCategoryRow[];
      const savedCovers = rows.reduce<Record<string, string>>((result, item) => {
        if (item.slug && item.image_url) {
          result[item.slug] = item.image_url;
        }
        return result;
      }, {});

      setCategoryCoverImages({
        ...defaultPortfolioCategoryCoverImages,
        ...savedCovers,
      });
    }

    if (!loading) {
      loadCategoryCoverImages();
    }
  }, [loading, supabase]);

  // Load galleries
  useEffect(() => {
    async function loadGalleries() {
      setError("");
      setPhotos([]);

      const { data, error } = await supabase
        .from("galleries")
        .select(
          "id, name, slug, category, description"
        )
        .eq("category", category)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        setError(error.message);
        return;
      }

      const galleryList = data || [];

      setGalleries(galleryList);

      if (galleryList.length > 0) {
        setGalleryId(galleryList[0].id);
      } else {
        setGalleryId("");
      }
    }

    if (!loading) {
      loadGalleries();
    }
  }, [category, loading, supabase]);

  // Load photos
  useEffect(() => {
    async function loadPhotos() {
      if (!galleryId) {
        setPhotos([]);
        return;
      }

      const { data, error } = await supabase
        .from("portfolio_photos")
        .select(
          "id, title, image_url, public_id, gallery_id"
        )
        .eq("gallery_id", galleryId)
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        setError(error.message);
        return;
      }

      setPhotos(data || []);
    }

    loadPhotos();
  }, [galleryId, supabase]);

  // Create gallery
  async function createGallery(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCreatingGallery(true);

    const finalSlug = createSlug(gallerySlug || galleryName);

    if (!galleryName.trim()) {
      setError("Please enter a gallery name.");
      setCreatingGallery(false);
      return;
    }

    if (!finalSlug) {
      setError("Please enter a valid gallery name.");
      setCreatingGallery(false);
      return;
    }

    const { data, error } = await supabase
      .from("galleries")
      .insert({
        name: galleryName.trim(),
        slug: finalSlug,
        category,
        description:
          description.trim() || null,
      })
      .select(
        "id, name, slug, category, description"
      )
      .single();

    if (error) {
      console.error(error);
      setError(error.message);
      setCreatingGallery(false);
      return;
    }

    setGalleries((current) => [
      data,
      ...current,
    ]);

    setGalleryId(data.id);

    setGalleryName("");
    setGallerySlug("");
    setDescription("");

    setSuccess(
      `Gallery "${data.name}" created successfully.`
    );

    setCreatingGallery(false);
  }

  // Upload photos
  async function uploadPhotos(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;

    if (!files || files.length === 0 || !galleryId) {
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const extension =
          file.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const fileName = createStorageFileName("photo", extension);

        const storagePath = `${category.toLowerCase()}/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("portfolio")
            .upload(storagePath, file, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("portfolio")
          .getPublicUrl(storagePath);

        const { error: databaseError } =
          await supabase
            .from("portfolio_photos")
            .insert({
              title: file.name,
              category,
              image_url: publicUrl,
              public_id: storagePath,
              gallery_id: galleryId,
            });

        if (databaseError) {
          await supabase.storage
            .from("portfolio")
            .remove([storagePath]);

          throw databaseError;
        }
      }

      const { data } = await supabase
        .from("portfolio_photos")
        .select(
          "id, title, image_url, public_id, gallery_id"
        )
        .eq("gallery_id", galleryId)
        .order("created_at", {
          ascending: true,
        });

      setPhotos(data || []);

      setSuccess("Photos uploaded successfully.");
    } catch (err: unknown) {
      const message = formatSupabaseError(err) || "Photo upload failed.";
      console.error("Photo upload error:", err);
      setError(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  // Update category cover image
  async function uploadCategoryCover(
    event: React.ChangeEvent<HTMLInputElement>,
    slug: string
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setCoverUploading(slug);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";
      const storagePath = `category-covers/${slug}/${createStorageFileName(slug, extension)}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio").getPublicUrl(storagePath);

      const { error: databaseError } = await supabase
        .from("portfolio_categories")
        .upsert(
          {
            slug,
            name: categoryCoverEntries.find((item) => item.slug === slug)?.name || slug,
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        );

      if (databaseError) {
        await supabase.storage.from("portfolio").remove([storagePath]);
        throw databaseError;
      }

      setCategoryCoverImages((current) => ({
        ...current,
        [slug]: publicUrl,
      }));

      setSuccess(`${categoryCoverEntries.find((item) => item.slug === slug)?.name || "Category"} cover updated.`);
    } catch (err: unknown) {
      const message = formatSupabaseError(err) || "Category cover upload failed.";
      console.error("Category cover upload error:", err);
      setError(message);
    } finally {
      setCoverUploading(null);
      event.target.value = "";
    }
  }

  async function resetCategoryCover(slug: string) {
    const categoryName = categoryCoverEntries.find((item) => item.slug === slug)?.name || "Category";
    const confirmed = window.confirm(
      `Reset ${categoryName} to the default cover image? This removes the custom override for this category.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setCoverUploading(slug);

    try {
      const defaultImage = defaultPortfolioCategoryCoverImages[slug];
      const { error: databaseError } = await supabase
        .from("portfolio_categories")
        .upsert(
          {
            slug,
            name: categoryName,
            image_url: defaultImage,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "slug" }
        );

      if (databaseError) {
        throw databaseError;
      }

      setCategoryCoverImages((current) => ({
        ...current,
        [slug]: defaultImage,
      }));

      setSuccess(`${categoryName} was reset to the default cover.`);
    } catch (err: unknown) {
      const message = formatSupabaseError(err) || "Could not reset the category cover.";
      console.error("Category cover reset error:", err);
      setError(message);
    } finally {
      setCoverUploading(null);
    }
  }

  // Delete photo
  async function deletePhoto(photo: Photo) {
    const confirmed = window.confirm(
      "Delete this photo permanently?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeleting(photo.id);

    try {
      if (photo.public_id) {
        const { error: storageError } =
          await supabase.storage
            .from("portfolio")
            .remove([photo.public_id]);

        if (storageError) {
          console.error(
            "Storage delete error:",
            storageError
          );
        }
      }

      const { error: databaseError } =
        await supabase
          .from("portfolio_photos")
          .delete()
          .eq("id", photo.id);

      if (databaseError) {
        throw databaseError;
      }

      setPhotos((current) =>
        current.filter(
          (item) => item.id !== photo.id
        )
      );

      setSuccess("Photo deleted.");
    } catch (err: unknown) {
      const message = formatSupabaseError(err) || "Delete failed.";
      console.error("Delete photo error:", err);
      setError(message);
    } finally {
      setDeleting(null);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-white/50">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-white/50">
              F Point Studio
            </p>

            <h1 className="mt-2 text-4xl font-light">
              Portfolio Manager
            </h1>

            <p className="mt-2 text-sm text-white/40">
              {email}
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/home" className="w-fit border border-white/15 px-5 py-2 text-sm transition hover:bg-white/10">
              Edit Homepage
            </Link>
            <button
              onClick={logout}
              className="w-fit border border-white/15 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
            >
              Logout
            </button>
          </div>
        </header>

        {/* CATEGORY */}
        <section className="mb-10">
          <label className="mb-3 block text-sm text-white/60">
            Category
          </label>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setCategory(item);
                  setSuccess("");
                  setError("");
                }}
                className={`px-5 py-3 text-sm transition ${
                  category === item
                    ? "bg-white text-black"
                    : "border border-white/15 text-white/70 hover:bg-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* CATEGORY COVER IMAGES */}
        <section className="mb-10 border border-white/10 bg-white/5 p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-light">
              Category Cover Images
            </h2>
            <span className="text-xs uppercase tracking-[2px] text-white/40">
              Supabase storage
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categoryCoverEntries.map((item) => (
              <div
                key={item.slug}
                className="border border-white/10 bg-black/20 p-4"
              >
                <div className="mb-4 aspect-[4/3] overflow-hidden border border-white/10 bg-black">
                  <img
                    src={categoryCoverImages[item.slug] || item.defaultImage}
                    alt={`${item.name} cover`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-light">{item.name}</p>
                    <p className="text-xs uppercase tracking-[2px] text-white/40">
                      {item.slug}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer border border-white/15 px-3 py-2 text-center text-xs uppercase tracking-[2px] transition hover:bg-white/10">
                      {coverUploading === item.slug ? "Uploading..." : "Replace"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={coverUploading !== null}
                        onChange={(event) => uploadCategoryCover(event, item.slug)}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => resetCategoryCover(item.slug)}
                      disabled={coverUploading !== null}
                      className="border border-white/15 px-3 py-2 text-center text-[10px] uppercase tracking-[2px] text-white/70 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      {coverUploading === item.slug ? "Resetting..." : "Reset to default cover"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CREATE GALLERY */}
        <section className="mb-10 border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-light">
            Create {category} Gallery
          </h2>

          <form
            onSubmit={createGallery}
            className="mt-6 grid gap-4 md:grid-cols-2"
          >
            <input
              type="text"
              value={galleryName}
              onChange={(event) => {
                setGalleryName(
                  event.target.value
                );

                if (
                  !gallerySlug ||
                  gallerySlug ===
                    createSlug(galleryName)
                ) {
                  setGallerySlug(
                    createSlug(
                      event.target.value
                    )
                  );
                }
              }}
              placeholder="Gallery name"
              required
              className="border border-white/15 bg-black px-4 py-3 outline-none focus:border-white/40"
            />

            <input
              type="text"
              value={gallerySlug}
              onChange={(event) =>
                setGallerySlug(
                  createSlug(
                    event.target.value
                  )
                )
              }
              placeholder="gallery-slug"
              required
              className="border border-white/15 bg-black px-4 py-3 outline-none focus:border-white/40"
            />

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Description (optional)"
              rows={3}
              className="resize-none border border-white/15 bg-black px-4 py-3 outline-none focus:border-white/40 md:col-span-2"
            />

            <button
              type="submit"
              disabled={creatingGallery}
              className="bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50 md:col-span-2"
            >
              {creatingGallery
                ? "Creating..."
                : "Create Gallery"}
            </button>
          </form>
        </section>

        {/* GALLERY SELECT */}
        <section className="mb-10">
          <label className="mb-3 block text-sm text-white/60">
            Select Gallery
          </label>

          {galleries.length === 0 ? (
            <div className="border border-white/10 bg-white/5 p-6">
              <p className="text-white/50">
                No {category} galleries yet.
              </p>
            </div>
          ) : (
            <select
              value={galleryId}
              onChange={(event) =>
                setGalleryId(
                  event.target.value
                )
              }
              className="w-full max-w-xl border border-white/15 bg-black px-4 py-3 text-white outline-none focus:border-white/40"
            >
              {galleries.map((gallery) => (
                <option
                  key={gallery.id}
                  value={gallery.id}
                >
                  {gallery.name}
                </option>
              ))}
            </select>
          )}
        </section>

        {/* UPLOAD */}
        {galleryId && (
          <section className="mb-12">
            <label
              className={`flex cursor-pointer items-center justify-center border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center transition hover:bg-white/10 ${
                uploading
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              <div>
                <p className="text-lg">
                  {uploading
                    ? "Uploading..."
                    : "Click to upload photos"}
                </p>

                <p className="mt-2 text-sm text-white/40">
                  Multiple photos can be selected.
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={uploadPhotos}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </section>
        )}

        {/* MESSAGES */}
        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </div>
        )}

        {/* PHOTOS */}
        {galleryId && (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-light">
                Photos
              </h2>

              <span className="text-sm text-white/40">
                {photos.length} photo
                {photos.length === 1
                  ? ""
                  : "s"}
              </span>
            </div>

            {photos.length === 0 ? (
              <div className="border border-white/10 bg-white/5 p-12 text-center">
                <p className="text-white/50">
                  No photos in this gallery yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="group overflow-hidden border border-white/10 bg-white/5"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={photo.image_url}
                        alt={
                          photo.title ||
                          "Portfolio photo"
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-3">
                      <p className="truncate text-xs text-white/50">
                        {photo.title ||
                          "Photo"}
                      </p>

                      <button
                        onClick={() =>
                          deletePhoto(photo)
                        }
                        disabled={
                          deleting ===
                          photo.id
                        }
                        className="mt-3 w-full border border-red-500/30 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deleting ===
                        photo.id
                          ? "Deleting..."
                          : "Delete Photo"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
