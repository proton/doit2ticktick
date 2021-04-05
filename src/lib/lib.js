//noinspection JSUnresolvedVariable
const agent = require('superagent-promise')(require('superagent'), Q.Promise);
import Q from 'q';
//noinspection JSUnresolvedVariable
import _ from 'lodash';

export default class DoItLib {
	auth({ login, password }) {
		return Q()
			.then(() => agent.post('http://i.doit.im/signin?original=http://i.doit.im/home/')
				.redirects(0)
				.send(`username=${login}&password=${password}`)
				.set('Content-Type', 'application/x-www-form-urlencoded')
				.end())
			.catch(err => {
				if (err.status == 302) { // actually success, we just don't follow their redirects
					this.cookies = err.response.headers['set-cookie'];
					console.log('Auth success');
					return;
				}
				console.error('Auth failure');
				throw err;
			});
	}

	getResources() {
		//noinspection JSUnresolvedVariable
		return this.plainGet('https://i.doit.im/api/resources_init').then(res => res.resources);
	}

	getProjects() {
		//noinspection JSUnresolvedVariable
		return this.getResources()
			.then((resources) => _(resources.projects).filter(p => !p.trashed && p.status !== 'inactive').value()); //.map(p => [p.uuid, p.name]).fromPairs().value());
	}

	getBoxes() {
		//noinspection JSUnresolvedVariable
		return this.getResources()
			.then((resources) => _.map(resources.boxes, box => box.type))
	}

	getContexts() {
		//noinspection JSUnresolvedVariable
		return this.getResources()
			.then((resources) => resources.contexts)
	}

	plainGet(url) {
		return Q()
			.then(() => agent
				.get(url)
				.set('Cookie', this.cookies)
				.end())
			.then(r => r.body);
	}

	getTaskList(box = 'today') {
		return this.plainGet(`https://i.doit.im/api/tasks/${box}`).then(res => res.entities);
	}

	tryGetTaskList(box) {
		return this.getTaskList(box).catch(() => []);
	}

	getAllTasks(dropTrash = true) {
		//noinspection JSUnresolvedFunction
		return Q()
			.then(() => this.getBoxes())
			.then((boxes) => Q.all(_.map(boxes, box => this.tryGetTaskList(box))))
			.then(boxesTasks => _.flatten(boxesTasks))
			.then(boxesTasks => _.filter(boxesTasks, t => {
				if(!dropTrash)
					return true;
				//noinspection JSUnresolvedVariable
				return !(t.trashed || t.deleted);

			}))
	}
}
