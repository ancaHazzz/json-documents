import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { storeDocument } from './controller/DocumentManager'
import { createConnection } from 'typeorm'
import moment from 'moment'

const PORT = process.env.PORT || 3000

async function initApp() {
  await createConnection()
  const app = express()
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  return app
}

initApp().then(app => {
  app.get('/', (req: Request, res: Response) => {
    res.send(`Available endpoints:
  POST /document:
    -- changeDate: optional date for this version of the document
    -- documentId: string identifying the document
    -- document: JSON content of the document`)
  })

  app.post('/document', async (req: Request, res: Response) => {
    try {
      if (!req.body) {
        // TODO: validation
        res.status(400).json({
          error: `You must provide changeDate, documentId, document`
        })
        return
      }
      let result = await storeDocument(moment(req.body.date), req.body.documentId, req.body.document)
      res.send({ success: result })
    } catch (error) {
      res.status(500).json({ error: error.toString() })
    }
  })

  app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`)
  })
})
