import type { NextApiRequest, NextApiResponse } from "next";
import { graph } from "../../lib/onedrive";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const q = (req.query.q as string)?.toLowerCase();
  if (!q) return res.status(200).json([]);

  // Search OneDrive
  const data = await graph(`/me/drive/root/search(q='${q}')`);

  const shows = new Map<string, any>();

  for (const item of data.value || []) {
    if (!item.parentReference?.path) continue;

    // Example path:
    // /drive/root:/BotUpload/Streaming/Bleach/S01
    const parts = item.parentReference.path.split("/");
    const streamingIndex = parts.indexOf("Streaming");

    if (streamingIndex === -1) continue;

    const showName = parts[streamingIndex + 1];
    if (!showName) continue;

    if (!shows.has(showName)) {
      shows.set(showName, {
        title: showName,
        href: `/BotUpload/Streaming/${showName}`
      });
    }
  }

  res.status(200).json(Array.from(shows.values()));
}
