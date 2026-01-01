import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

import { getAccessToken } from '.'
import apiConfig from '../../../config/api.config'
import siteConfig from '../../../config/site.config'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q = '' } = req.query

  if (typeof q !== 'string' || !q.trim()) {
    return res.status(200).json([])
  }

  try {
    const accessToken = await getAccessToken()

    // SAME Graph search used by UI
    const searchApi = `${apiConfig.driveApi}/root/search(q='${q.replace(/'/g, "''")}')`

    const { data } = await axios.get(searchApi, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        select: 'id,name,file,parentReference,size',
        top: siteConfig.maxItems,
      },
    })

    const baseDir = siteConfig.baseDirectory || ''

    const results = data.value
      .filter((item: any) => item.file)
      .map((item: any) => {
        const parentPath =
          item.parentReference?.path?.replace('/drive/root:', '') || ''

        return {
          title: item.name,
          path: parentPath + '/' + item.name,
          size: item.size,
        }
      })
      .filter((item: any) =>
        baseDir ? item.path.startsWith(baseDir) : true
      )

    res.status(200).json(results)
  } catch (error: any) {
    console.error('Sora search error:', error?.response?.data || error)
    res
      .status(error?.response?.status ?? 500)
      .json({ error: 'Sora search failed' })
  }
}
