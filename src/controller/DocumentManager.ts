import { getManager, createQueryBuilder } from 'typeorm'
import { DocumentVersion } from '../entity/DocumentVersion'
import { Document } from '../entity/Document'

export async function storeDocument(date: Date, documentId: string, newContent: any) {
  try {
    let document = await getManager().findOne(Document, { documentId })
    if (!document) {
      document = new Document()
      document.documentId = documentId
      document.lastChangeDate = date
      console.debug('doc to save:', document)
      document = await getManager().save(document)
    }
    const docUpdate = new DocumentVersion()
    docUpdate.changeDate = date
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

export async function getDocumentHistory(documentId: string) {
  const document = await getManager().findOne(Document, {
    where: { documentId },
    relations: ['versions']
  })
  return document?.versions
}

export async function getDocumentVersion(documentId: string, date: Date) {
  return await createQueryBuilder('DocumentVersion')
    .select('DocumentVersion.content')
    .innerJoin('DocumentVersion.document', 'document')
    .where('document.documentId = :documentId', { documentId })
    .andWhere('DocumentVersion.changeDate = :changeDate', { changeDate: date })
    .getOne()
}
