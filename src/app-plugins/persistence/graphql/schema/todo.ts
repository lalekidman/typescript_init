import {
  Field,
  Int,
  ObjectType,
  Float,
} from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity
} from 'typeorm'

@ObjectType()
@Entity()
export abstract class Todo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  public _id!: number;

  @Field()
  @Column()
  public content!: string;

  @Field(() => Float)
  @Column("int", {default: 0})
  public createdAt!: number;
}