import { SuggestedEvent } from "@/components/chatbot/EventSuggestionCard";

export function parseEventSuggestions(text: string): {
  headline: string;
  events: SuggestedEvent[];
} {
  if (!text) return { headline: "", events: [] };

  // 1. Check for structured <!--EVENTS_DATA:...-->
  const dataMatch = text.match(/<!--EVENTS_DATA:([\s\S]*?)-->/);
  if (dataMatch) {
    try {
      const events: SuggestedEvent[] = JSON.parse(dataMatch[1]);
      const headline = text.replace(/<!--EVENTS_DATA:[\s\S]*?-->/, "").trim();
      return { headline, events };
    } catch {
      // Fall through to markdown parser
    }
  }

  // 2. Check for markdown pattern: ### [Title](/event/slug)
  if (!text.includes("/event/")) {
    return { headline: text, events: [] };
  }

  const eventBlocks = text.split(/(?=###\s*\[)/g);
  if (eventBlocks.length <= 1) {
    return { headline: text, events: [] };
  }

  const rawHeadline = eventBlocks[0].replace(/---\s*$/, "").trim();
  const events: SuggestedEvent[] = [];

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = eventBlocks[i];
    const titleMatch = block.match(/###\s*\[([^\]]+)\]\(\/event\/([^)]+)\)/);
    if (!titleMatch) continue;

    const title = titleMatch[1].trim();
    const slug = titleMatch[2].trim();

    // Extract price
    let price = 0;
    const priceMatch = block.match(/💰\s*\*\*([^*]+)\*\*/);
    if (priceMatch) {
      const pText = priceMatch[1].trim().toLowerCase();
      if (pText !== "free") {
        const num = pText.replace(/[^0-9.]/g, "");
        price = Number(num) || 0;
      }
    }

    // Extract date
    let startDate: string | undefined = undefined;
    const dateMatch = block.match(/📅\s*([^•\n]+)/);
    if (dateMatch) {
      startDate = dateMatch[1].trim();
    }

    // Extract seats
    let availableSeats: number | undefined = undefined;
    const seatsMatch = block.match(/🎟️\s*(\d+)\s*seats/);
    if (seatsMatch) {
      availableSeats = Number(seatsMatch[1]);
    }

    // Extract tags
    let tags: string[] = [];
    const tagsMatch = block.match(/🏷️\s*([^>\n]+)/);
    if (tagsMatch) {
      tags = tagsMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // Extract description (lines between title and blockquote)
    const lines = block
      .replace(/###\s*\[[^\]]+\]\(\/event\/[^)]+\)/, "")
      .replace(/>.*$/gm, "")
      .replace(/👉.*$/gm, "")
      .replace(/---/g, "")
      .replace(/\*Click on any event.*$/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const description = lines.join(" ").trim();

    events.push({
      id: slug,
      title,
      slug,
      description,
      price,
      startDate,
      availableSeats,
      tags,
    });
  }

  if (events.length === 0) {
    return { headline: text, events: [] };
  }

  return {
    headline: rawHeadline || "Here are the events found:",
    events,
  };
}
