import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import { logger } from '../core/utils'
import routes from '../routes'
import { StatistiquesPage } from '../views/pages'
import { v1Router } from './v1Router'

const { METABASE_SECRET_KEY, METABASE_SITE_URL } = process.env

if (!METABASE_SECRET_KEY || !METABASE_SITE_URL) {
  logger.error('Missing METABASE_SECRET_KEY and/or METABASE_SITE_URL environment variables')
}

v1Router.get(
  routes.STATS,
  asyncHandler(async (request, response) => {
    if (!METABASE_SECRET_KEY || !METABASE_SITE_URL) {
      response.status(500).send('Service indisponible')
    }

    const payload = {
      resource: { dashboard: 2 },
      params: {},
      exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minute expiration
    }
    const token = jwt.sign(payload, METABASE_SECRET_KEY)

    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=false&titled=false`

    response.send(
      StatistiquesPage({
        request,
        iframeUrl,
      })
    )
  })
)
