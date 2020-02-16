import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn} from 'typeorm'
import { Document } from './Document'

@Entity()
export class DocumentVersion {
  @ManyToOne(() => Document)
  @JoinColumn({name: 'document_index'})
  @PrimaryColumn('int', { name: 'document_index' })
  document: Document
  
  @PrimaryColumn('datetime', { name: 'change_date' })
  changeDate: Date

  @Column('json')
  content: Object

}
