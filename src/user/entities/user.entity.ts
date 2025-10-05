import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Roles } from '../enums/user-roles.enum';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  facebookId: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'enum',
    enum: Roles,
    array: true,
    default: [Roles.USER],
  })
  roles: Roles[];

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'json', nullable: true })
  tokens: {
    accessToken?: string;
    refreshToken?: string;
  };

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: false })
  availToSetPassword: boolean;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    nullable: true,
    cascade: true,
    onDelete: 'SET NULL',
  })
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
