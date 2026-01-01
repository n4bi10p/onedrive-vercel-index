import type { NextApiRequest, NextApiResponse } from "next";
import searchHandler from "./search";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Call existing search logic internally
  const q = req.query.q as string;
  if (!q) return res.status(400).json([]);

  // Manually call Graph (simpler + safer)
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/search?q=${encodeURIComponent(q)}`
  ).then(r => r.json());

  const files = result
    .filter((item: any) => item.file)
    .map((item: any) => ({
      title: item.name,
      path:
        item.parentReference.path.replace("/drive/root:", "") +
        "/" +
        item.name
    }));

  res.status(200).json(files);
}
