import Q from 'q';
const _ = require('lodash');
import moment from 'moment';
import naturalSort from 'javascript-natural-sort';
// const fs = require('fs-extra');

const todoist = require('todoist').v8

export default class GrabberLogic {
	static async sync(lib, argv) {
		const todoistApi = todoist(argv.todoistToken);
		await this.syncProjects(lib, todoistApi);
		await this.syncTasks(lib, todoistApi);
	}

	static formatName(name) {
		return name.replace(/[\(\)]/g, '_')
	}

	static async syncProjects(doitLib, todoistApi) {
		const doitProjects = await doitLib.getProjects();
		const doitProjectNames = Object.values(doitProjects).map(this.formatName);
		doitProjectNames.push('Inbox');
		
		await todoistApi.sync();
		const todoistProjects = todoistApi.projects.get();
		const todoistProjectNames = todoistProjects.map(project => project.name);
		
		const missingProjectNames = [...new Set(doitProjectNames.filter(name => !todoistProjectNames.includes(name)))];
		console.log(missingProjectNames);

		for (const name of missingProjectNames) {
			await todoistApi.projects.add({ name: name });
		}
		await todoistApi.commit();
	}

	static async syncTasks(doitLib, todoistApi) {
		const doitProjects = await doitLib.getProjects();
		// const doitProjectNames = Object.values(doitProjects);
		// doitProjectNames.push('Inbox');

		const doitTasks = await doitLib.getAllTasks();
		// console.log(doitTasks);
	}
}
