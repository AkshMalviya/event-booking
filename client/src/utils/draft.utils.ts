import dayjs from "dayjs";
import { UseFormReturnType } from "@mantine/form";
import { EventDraft } from "@/generated/graphql";

/**
 * Format comma-separated draft tags into Title Cased, clean tags.
 * e.g. "navratri, garba night" -> "Navratri, Garba Night"
 */
export const formatDraftTags = (tags?: string | null): string => {
  if (!tags) return "";
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((tag) =>
      tag
        .split(/\s+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" "),
    )
    .join(", ");
};

/**
 * Parse start and end dates from a draft using dayjs.
 * Defaults to 10:00 for start time and 18:00 (or start + 2 hours) for end time.
 */
export const parseDraftDates = (draft: {
  startDate?: string | null;
  endDate?: string | null;
  date?: string | null;
}): { startDate: Date; endDate: Date } | null => {
  const dateToUse = draft.startDate || draft.date;
  if (!dateToUse) return null;

  let start = dayjs(dateToUse);
  if (!dateToUse.includes("T")) {
    start = start.hour(10).minute(0).second(0);
  }

  if (!start.isValid()) return null;

  let end: dayjs.Dayjs;
  if (draft.endDate) {
    end = dayjs(draft.endDate);
    if (!draft.endDate.includes("T")) {
      end = end.hour(18).minute(0).second(0);
    }
  } else {
    end = start.add(2, "hour");
  }

  if (!end.isValid() || end.isBefore(start)) {
    end = start.add(2, "hour");
  }

  return {
    startDate: start.toDate(),
    endDate: end.toDate(),
  };
};

/**
 * Format date range for UI display in event draft previews using dayjs.
 * e.g. "18 - 20 Oct 2026", duration "3 days"
 */
export const formatDraftDisplayDates = (
  startDate?: string | null,
  endDate?: string | null,
  fallbackDate?: string | null,
): { label: string; duration: string | null } => {
  const startRaw = startDate || fallbackDate;
  if (!startRaw) return { label: "Not specified", duration: null };

  const start = dayjs(
    startRaw.includes("T") ? startRaw : `${startRaw}T00:00:00`,
  );
  if (!start.isValid()) return { label: startRaw, duration: null };

  if (!endDate || endDate === startRaw) {
    return {
      label: start.format("D MMM YYYY"),
      duration: "1 day",
    };
  }

  const end = dayjs(endDate.includes("T") ? endDate : `${endDate}T00:00:00`);
  if (!end.isValid()) {
    return {
      label: `${start.format("D MMM YYYY")} - ${endDate}`,
      duration: null,
    };
  }

  const diffDays = Math.max(1, Math.round(end.diff(start, "day", true)));
  const durationStr = diffDays === 1 ? "1 day" : `${diffDays} days`;

  if (start.isSame(end, "year") && start.isSame(end, "month")) {
    return {
      label: `${start.format("D")} - ${end.format("D MMM YYYY")}`,
      duration: durationStr,
    };
  }

  if (start.isSame(end, "year")) {
    return {
      label: `${start.format("D MMM")} - ${end.format("D MMM YYYY")}`,
      duration: durationStr,
    };
  }

  return {
    label: `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`,
    duration: durationStr,
  };
};

export interface ApplyDraftOptions {
  onImageFile?: (file: File) => void;
  onImagePreview?: (url: string) => void;
}

/**
 * Centralized function to apply an event draft to a Mantine form.
 * Handles dates via dayjs, tags normalization, capacity, price, and image downloading.
 */
export const applyDraftToForm = async (
  draft: EventDraft,
  form?: UseFormReturnType<unknown> | null,
  options?: ApplyDraftOptions,
): Promise<void> => {
  if (!form) return;

  if (draft.title) {
    form.setFieldValue("title", draft.title);
  }
  if (draft.description) {
    form.setFieldValue("description", draft.description);
  }
  if (draft.capacity) {
    form.setFieldValue("availableSeats", Number(draft.capacity));
  }
  if (draft.price !== undefined && draft.price !== null) {
    form.setFieldValue("price", Number(draft.price));
  }
  if (draft.tags) {
    form.setFieldValue("tags", formatDraftTags(draft.tags));
  }

  const dates = parseDraftDates(draft);
  if (dates) {
    form.setFieldValue("startDate", dates.startDate);
    form.setFieldValue("endDate", dates.endDate);
  }

  if (draft.imageUrl) {
    try {
      form.setFieldValue("imageUrl", draft.imageUrl);
    } catch {
      // Ignored if field is not registered in form
    }
    options?.onImagePreview?.(draft.imageUrl);

    if (options?.onImageFile) {
      try {
        const res = await fetch(draft.imageUrl);
        if (res.ok) {
          const blob = await res.blob();
          const ext = blob.type.includes("png") ? "png" : "jpg";
          const file = new File([blob], `ai-banner-${Date.now()}.${ext}`, {
            type: blob.type || "image/jpeg",
          });
          options.onImageFile(file);
        }
      } catch (err) {
        console.warn("Could not download draft image to file:", err);
      }
    }
  }
};
