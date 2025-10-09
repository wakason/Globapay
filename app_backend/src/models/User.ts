import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';
import { PaymentMethod } from './PaymentMethod';
import bcrypt from 'bcryptjs';
import { encryptField, decryptField } from '../utils/crypto';

export enum UserRole {
    CUSTOMER = 'customer',
    EMPLOYEE = 'employee'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    fullName: string;

    @Column({ unique: true, transformer: { to: (v: string) => encryptField(v), from: (v: string) => decryptField(v) } })
    accountNumber: string;

    @Column({ unique: true, transformer: { to: (v: string) => encryptField(v), from: (v: string) => decryptField(v) } })
    idNumber: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER
    })
    role: UserRole;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ nullable: true })
    lastLogin: Date;

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions: Transaction[];

    @OneToMany(() => PaymentMethod, paymentMethod => paymentMethod.user)
    paymentMethods: PaymentMethod[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    async hashPassword(): Promise<void> {
        if (this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }
}
