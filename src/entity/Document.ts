import { PrimaryColumn, Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { DocumentVersion } from './DocumentVersion';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  index: string

  @Column('varchar', {
    name: 'document_id',
    length: 100,
    unique: true
  })
  documentId: string

  @Column('datetime', {name: 'last_change_date'})
  lastChangeDate: Date

  @OneToMany(() => DocumentVersion, version => version.document)
  versions: DocumentVersion
}
