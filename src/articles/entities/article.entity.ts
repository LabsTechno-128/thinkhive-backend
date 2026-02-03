import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  @Index()
  title: string;

  // slug added 
  @Column({ nullable: true })
  slug: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  createdDate: Date;

  @Column({ type: 'date', nullable: true })
  updatedDate: Date;

  @Column('simple-array', { nullable: true })
  keywords: string[];

  @Column({ nullable: true })
  @Index()
  category: string;

  @Column({ nullable: true })
  author: string;

  @Column({ type: 'int', nullable: true })
  readingTime: number;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
