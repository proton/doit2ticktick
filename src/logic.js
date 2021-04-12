import Q from 'q';
const _ = require('lodash');
import moment from 'moment';

const ticktick = require('ticktick-wrapper');

export default class GrabberLogic {
	static async sync(lib, argv) {
		await ticktick.login({
			email: {
				username: argv.ticktickLogin,
				password: argv.ticktickPassword,
			},
		});

		await this.pushTasksToInbox(lib);
	}

	static async syncProjects(doitLib) {
		await todoistApi.sync();

		let doitProjects = await doitLib.getProjects();
		
		const todoistProjects = todoistApi.projects.get();

		for (const doitProject of doitProjects) {
			const todoistProject = todoistProjects.find(p => this.formatName(p.name) == this.formatName(doitProject.name));
			if (!todoistProject) {
				await todoistApi.projects.add({ name: this.formatName(doitProject.name) });
			}
		}

		await todoistApi.commit();
	}
	
	static async pushTasksToInbox(doitLib) {
		let doitTasks = await doitLib.getAllTasks();
		doitTasks = doitTasks.filter(t => t.completed === 0 && t.archived === 0 && t.hidden === 0);
		const doitProjects = await doitLib.getProjects();

		const projectMap = {};
		for (const doitProject of doitProjects) {
			projectMap[doitProject.uuid] = doitProject.name
		}
		
		for (const doitTask of doitTasks) {
			const title = doitTask.title;
			const projectName = projectMap[doitTask.project];
			const description = `project: ${projectName}\n${doitTask.notes}`;
			await ticktick.Inbox.addSimpleTask(title, description);
		}
	}
}
