import { init } from '../src/service/Database'
import {
  storeDocument,
  getDocumentVersion,
  getDocumentHistory
} from '../src/controller/DocumentManager'

const JSON_TEMPLATE = {
  property1: 'value1',
  property2: 'value2',
  property3: 'value3'
}

describe('test sncf operations', () => {
  beforeAll(async () => {
    await init()
    // I should also clean the test db
  })

  test('store & get document', async done => {
    const docId = 'abc'
    const documentVersion = await storeDocument(new Date(), docId, JSON_TEMPLATE)
    expect(documentVersion).toBeTruthy()
    const savedDocument = await getDocumentVersion(docId, documentVersion!.toString())
    expect(savedDocument).toBeTruthy()
    expect(savedDocument.content).toEqual(JSON_TEMPLATE)
    done()
  })

  test('store multiple versions & get document history', async done => {
    const docId = 'multi-123-abc'
    let content1: any = {},
      content2: any = {}
    const v0 = await storeDocument(new Date(), docId, JSON_TEMPLATE)

    Object.assign(content1, JSON_TEMPLATE)
    content1!.property1 = 'changed value'
    const v1 = await storeDocument(new Date(), docId, content1)

    Object.assign(content2, JSON_TEMPLATE)
    content2!.property1 = 'super changed value'
    content2!.property2 = 'another changed value'
    const v2 = await storeDocument(new Date(), docId, content2)

    const docHistory = await getDocumentHistory(docId)
    expect(docHistory).toBeTruthy()
    expect(docHistory?.length).toEqual(3)
    expect(docHistory![0].version).not.toEqual(docHistory![1].version)
    expect(docHistory![0].content).not.toEqual(docHistory![1].content)
    expect(docHistory![0].document).toEqual(docHistory![1].document)
    done()
  })
})
