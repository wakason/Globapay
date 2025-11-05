import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Initial database schema migration
 * Creates all tables with proper indexes and foreign keys
 * 
 * To run: npm run migration:run
 * To revert: npm run migration:revert
 */
export class InitialSchema1699000000000 implements MigrationInterface {
    name = 'InitialSchema1699000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: '(UUID())',
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        length: '255',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'fullName',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'accountNumber',
                        type: 'text',
                        isUnique: true,
                        isNullable: false,
                        comment: 'Encrypted field',
                    },
                    {
                        name: 'idNumber',
                        type: 'text',
                        isUnique: true,
                        isNullable: false,
                        comment: 'Encrypted field',
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'role',
                        type: 'enum',
                        enum: ['customer', 'employee'],
                        default: "'customer'",
                        isNullable: false,
                    },
                    {
                        name: 'isVerified',
                        type: 'tinyint',
                        default: 0,
                        isNullable: false,
                    },
                    {
                        name: 'lastLogin',
                        type: 'datetime',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create indexes for users table
        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'IDX_users_username',
                columnNames: ['username'],
            })
        );

        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'IDX_users_role',
                columnNames: ['role'],
            })
        );

        // Create transactions table
        await queryRunner.createTable(
            new Table({
                name: 'transactions',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: '(UUID())',
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'amount',
                        type: 'decimal',
                        precision: 15,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        length: '3',
                        isNullable: false,
                    },
                    {
                        name: 'recipientName',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'recipientAccount',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'swiftCode',
                        type: 'varchar',
                        length: '11',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['pending', 'completed', 'failed'],
                        default: "'pending'",
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['swift', 'sepa', 'ach'],
                        default: "'swift'",
                        isNullable: false,
                    },
                    {
                        name: 'reference',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'errorMessage',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create indexes for transactions table (PERFORMANCE OPTIMIZATION)
        await queryRunner.createIndex(
            'transactions',
            new TableIndex({
                name: 'IDX_transactions_userId',
                columnNames: ['userId'],
            })
        );

        await queryRunner.createIndex(
            'transactions',
            new TableIndex({
                name: 'IDX_transactions_status',
                columnNames: ['status'],
            })
        );

        await queryRunner.createIndex(
            'transactions',
            new TableIndex({
                name: 'IDX_transactions_status_createdAt',
                columnNames: ['status', 'createdAt'],
            })
        );

        await queryRunner.createIndex(
            'transactions',
            new TableIndex({
                name: 'IDX_transactions_reference',
                columnNames: ['reference'],
            })
        );

        // Create foreign key
        await queryRunner.createForeignKey(
            'transactions',
            new TableForeignKey({
                name: 'FK_transactions_user',
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            })
        );

        // Create payment_methods table
        await queryRunner.createTable(
            new Table({
                name: 'payment_methods',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: '(UUID())',
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                        length: '36',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['swift', 'sepa', 'ach'],
                        isNullable: false,
                    },
                    {
                        name: 'accountNumber',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'swiftCode',
                        type: 'varchar',
                        length: '11',
                        isNullable: true,
                    },
                    {
                        name: 'bankName',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'bankAddress',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'isActive',
                        type: 'tinyint',
                        default: 1,
                        isNullable: false,
                    },
                    {
                        name: 'metadata',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create indexes for payment_methods table
        await queryRunner.createIndex(
            'payment_methods',
            new TableIndex({
                name: 'IDX_payment_methods_userId',
                columnNames: ['userId'],
            })
        );

        await queryRunner.createIndex(
            'payment_methods',
            new TableIndex({
                name: 'IDX_payment_methods_isActive',
                columnNames: ['isActive'],
            })
        );

        // Create foreign key
        await queryRunner.createForeignKey(
            'payment_methods',
            new TableForeignKey({
                name: 'FK_payment_methods_user',
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            })
        );

        // Create audit_logs table
        await queryRunner.createTable(
            new Table({
                name: 'audit_logs',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: '(UUID())',
                    },
                    {
                        name: 'actorUserId',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        comment: 'User ID or "anonymous" for unauthenticated actions',
                    },
                    {
                        name: 'action',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'transactionId',
                        type: 'varchar',
                        length: '36',
                        isNullable: true,
                    },
                    {
                        name: 'details',
                        type: 'json',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        // Create indexes for audit_logs table
        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_audit_logs_actorUserId',
                columnNames: ['actorUserId'],
            })
        );

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_audit_logs_action',
                columnNames: ['action'],
            })
        );

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_audit_logs_createdAt',
                columnNames: ['createdAt'],
            })
        );

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'IDX_audit_logs_transactionId',
                columnNames: ['transactionId'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        await queryRunner.dropForeignKey('payment_methods', 'FK_payment_methods_user');
        await queryRunner.dropForeignKey('transactions', 'FK_transactions_user');

        // Drop tables in reverse order
        await queryRunner.dropTable('audit_logs', true);
        await queryRunner.dropTable('payment_methods', true);
        await queryRunner.dropTable('transactions', true);
        await queryRunner.dropTable('users', true);
    }
}

