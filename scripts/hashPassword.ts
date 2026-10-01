/** Prints the value for the ADMIN_PASSWORD_HASH env variable: yarn hash-password <password> */
import { hashPassword } from '../src/lib/server/auth';

const password = process.argv[2];
if (!password) {
	console.error('Usage: yarn hash-password <password>');
	process.exit(1);
}

console.log(await hashPassword(password));
