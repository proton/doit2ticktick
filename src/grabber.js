import DoItLib from './lib/lib';
const lib = new DoItLib();
import prompt from 'prompt';
prompt.message = '';
prompt.delimiter = '';
import Q from 'q';
//noinspection JSUnresolvedVariable
import {argv} from 'yargs';
import GrabberLogic from './logic';
function main() {
	return Q()
		.then(() => {
			return { login: argv.doitLogin, password: argv.doitPassword };
		})
		.then(function tryAuthenticate(promptResult) {
			return lib.auth(promptResult)
				.then(() => lib);
		})
		.then((lib) => GrabberLogic.sync(lib, argv))
		.then(() => console.log('done'))
		.catch(console.error)
		.done();
}
main();



