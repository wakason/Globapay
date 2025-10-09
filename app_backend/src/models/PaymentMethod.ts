import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum PaymentMethodType {
    SWIFT = 'swift',
    SEPA = 'sepa',
    ACH = 'ach'
}

@Entity('payment_methods')
export class PaymentMethod {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.paymentMethods)
    user: User;

    @Column({
        type: 'enum',
        enum: PaymentMethodType
    })
    type: PaymentMethodType;

    @Column()
    accountNumber: string;

    @Column({ nullable: true })
    swiftCode: string;

    @Column({ nullable: true })
    bankName: string;

    @Column({ nullable: true })
    bankAddress: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
