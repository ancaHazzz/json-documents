import { getManager } from 'typeorm'
import { DocumentVersion } from '../entity/DocumentVersion'
import { Document } from '../entity/Document'
import { Moment } from 'moment'

export async function storeDocument(date: Moment, documentId: string, newContent: any) {
  try {
    let document = await getManager().findOne(Document, documentId)
    if (!document) {
      document = new Document()
      document.documentId = documentId
      document.lastChangeDate = date.toDate()
      console.debug('doc to save:', document)
      document = await getManager().save(document)
    }
    const docUpdate = new DocumentVersion()
    docUpdate.changeDate = date.toDate()
    docUpdate.document = document
    docUpdate.content = newContent
    console.debug('docUpdate to save:', document)
    await getManager().save(docUpdate)
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}
