import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { storeDocument, getDocumentVersion, getDocumentHistory } from './controller/DocumentManager'
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
    -- document: JSON content of the document
  GET /document/{documentId}
  GET /document/{documentId}/{changeDate}`)
  })

  app.post('/document', async (req: Request, res: Response) => {
    try {
      if (!req.body || !req.body.changeDate || !req.body.documentId || !req.body.document) {
        return res.status(400).json({ error: `You must provide changeDate, documentId, document` })
      }
      const date = moment(req.body.changeDate)
      if (!date.isValid()) {
        return res.status(400).json({ error: `Unrecognized date format for changeDate param` })
      }
      if (!JSON.stringify(req.body.document)) {
        return res.status(400).json({ error: `Unrecognized json format for document param` })
      }
      let result = await storeDocument(date.toDate(), req.body.documentId, req.body.document)
      res.send({ version: result })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.toString() })
    }
  })

  app.get('/document/:documentId', async (req: Request, res: Response) => {
    try {
      if (!req.params.documentId) {
        return res.status(400).json({ error: `You must provide a documentId` })
      }
      let result = await getDocumentHistory(req.params.documentId)
      if (!result) {
        return res.status(404).json()
      }
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.toString() })
    }
        })

  app.get('/document/:documentId/:version', async (req: Request, res: Response) => {
    try {
      if (!req.params.documentId || !req.params.version) {
        return res.status(400).json({ error: `You must provide documentId & changeDate` })
      }

      const result = await getDocumentVersion(req.params.documentId, req.params.version)
      if (!result) {
        return res.status(404).json()
      }
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.toString() })
    }
  })

  app.get('/document/:documentId/compare', async (req: Request, res: Response) => {
    try {
      if (!req.params.documentId || !req.params.version) {
        return res.status(400).json({ error: `You must provide documentId & 2 versions` })
      }

      const result = await getDocumentVersion(req.params.documentId, req.params.version)
      if (!result) {
        return res.status(404).json()
      }
      res.send(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: error.toString() })
    }
  })

  app.listen(PORT, () => {
    console.log(`server is running on PORT ${PORT}`)
  })
})
