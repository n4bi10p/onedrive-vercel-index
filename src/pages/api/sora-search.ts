import type { NextApiRequest, NextApiResponse } from "next";
import { getAccessToken } from "../../lib/auth";
import { graph } from "../../lib/onedrive";
import siteConfig from "../../../config/site.config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const q = req.query.q as string;

  if (!q) {
    return res.status(200).json([]);
  }

  try {
    const token = await getAccessToken();

    // SAME Graph search used by UI
    const result = await graph(token)
      .api(`/me/drive/root/search(q='${q}')`)
      .get();

    const baseDir = siteConfig.baseDirectory || "";

    const files = result.value
      .filter((item: any) => item.file)
      .map((item: any) => {
        const parentPath =
          item.parentReference?.path?.replace("/drive/root:", "") || "";

        return {
          title: item.name,
          path: parentPath + "/" + item.name,
          size: item.size
        };
      })
      // restrict to base directory (BotUpload)
      .filter(item =>
        baseDir ? item.path.startsWith(baseDir) : true
      );

    res.status(200).json(files);
  } catch (err) {
    console.error("Sora search error:", err);
    res.status(500).json({ error: "Sora search failed" });
  }
}
