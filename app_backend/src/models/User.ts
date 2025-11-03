import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';
import { PaymentMethod } from './PaymentMethod';
import bcrypt from 'bcryptjs';
import { encryptField, decryptField } from '../utils/crypto';

function getBcryptCost(): number {
    const parsed = parseInt(process.env.BCRYPT_COST || '12', 10);
    if (!Number.isFinite(parsed)) return 12;
    // Reasonable bounds to avoid accidental extreme costs
    if (parsed < 10) return 10;
    if (parsed > 15) return 15;
    return parsed;
}

function getPepper(): string {
    return process.env.PEPPER || '';
}

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
            const salt = await bcrypt.genSalt(getBcryptCost());
            const peppered = `${this.password}${getPepper()}`;
            this.password = await bcrypt.hash(peppered, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        const peppered = `${password}${getPepper()}`;
        return bcrypt.compare(peppered, this.password);
    }

    needsRehash(): boolean {
        try {
            const currentRounds = (bcrypt as any).getRounds
                ? (bcrypt as any).getRounds(this.password)
                : undefined;
            if (typeof currentRounds !== 'number') return false;
            return currentRounds !== getBcryptCost();
        } catch (_err) {
            return false;
        }
    }
}
