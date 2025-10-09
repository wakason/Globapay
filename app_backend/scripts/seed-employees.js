/* eslint-disable no-console */
require('dotenv').config();
const { AppDataSource } = require('../dist/config/database');
const { User, UserRole } = require('../dist/models/User');

async function upsertEmployee({ username, fullName, accountNumber, idNumber, password }) {
	const repo = AppDataSource.getRepository(User);
	let user = await repo.findOne({ where: [{ username }, { accountNumber }, { idNumber }] });
	if (!user) {
		user = new User();
		user.username = username;
		user.fullName = fullName;
		user.accountNumber = accountNumber;
		user.idNumber = idNumber;
		user.password = password;
		user.role = UserRole.EMPLOYEE;
		await user.hashPassword();
		await repo.save(user);
		console.log(`Created employee: ${username}`);
		return;
	}

	// Ensure role and password are correct; update if needed
	let updated = false;
	if (user.role !== UserRole.EMPLOYEE) {
		user.role = UserRole.EMPLOYEE;
		updated = true;
	}
	if (password) {
		user.password = password;
		await user.hashPassword();
		updated = true;
	}
	if (updated) {
		await repo.save(user);
		console.log(`Updated employee: ${username}`);
	} else {
		console.log(`No changes for employee: ${username}`);
	}
}

async function run() {
	try {
		await AppDataSource.initialize();
		const employees = [
			{
				username: 'ops_agent_1',
				fullName: 'Operations Agent One',
				accountNumber: '700000000001',
				idNumber: '8001015009087',
				password: process.env.SEED_EMPLOYEE_PW || 'Employee!234'
			},
			{
				username: 'ops_supervisor',
				fullName: 'Ops Supervisor',
				accountNumber: '700000000002',
				idNumber: '8202025009086',
				password: process.env.SEED_EMPLOYEE_PW_SUP || 'Supervisor!234'
			}
		];

		for (const emp of employees) {
			await upsertEmployee(emp);
		}

		console.log('Employee seeding completed.');
	} catch (err) {
		console.error('Seeding failed:', err);
		process.exitCode = 1;
	} finally {
		if (AppDataSource?.destroy) {
			await AppDataSource.destroy();
		}
	}
}

run();


