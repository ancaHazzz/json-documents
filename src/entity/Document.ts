import { PrimaryColumn, Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  index: string

  @Column('varchar', {
    length: 100
  })
  documentId: string

  @Column('datetime', {name: 'last_change_date'})
  lastChangeDate: Date
}
