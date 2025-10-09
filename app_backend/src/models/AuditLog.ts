import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    actorUserId: string;

    @Column()
    action: string;

    @Column({ nullable: true })
    transactionId?: string;

    @Column({ type: 'json', nullable: true })
    details?: any;

    @CreateDateColumn()
    createdAt: Date;
}


