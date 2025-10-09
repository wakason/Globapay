import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum TransactionType {
    SWIFT = 'swift',
    SEPA = 'sepa',
    ACH = 'ach'
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.transactions)
    user: User;

    @Column()
    amount: number;

    @Column()
    currency: string;

    @Column()
    recipientName: string;

    @Column()
    recipientAccount: string;

    @Column()
    swiftCode: string;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING
    })
    status: TransactionStatus;

    @Column({
        type: 'enum',
        enum: TransactionType,
        default: TransactionType.SWIFT
    })
    type: TransactionType;

    @Column({ nullable: true })
    reference: string;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @Column({ nullable: true })
    errorMessage: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
