import Q from 'q';
const _ = require('lodash');
import moment from 'moment';
import naturalSort from 'javascript-natural-sort';
// const fs = require('fs-extra');

const nextContextName = 'Next';
const somedayContextName = 'Someday';
const waitingContextName = 'Waiting';

const todoist = require('todoist').v8

export default class GrabberLogic {
	static async sync(lib, argv) {
		const todoistApi = todoist(argv.todoistToken);
		await this.syncProjects(lib, todoistApi);
		await this.syncContexts(lib, todoistApi);
		await this.syncTasks(lib, todoistApi);
	}

	static formatName(name) {
		return name.replace(/[\(\)]/g, '_')
	}

	static async syncProjects(doitLib, todoistApi) {
		await todoistApi.sync();

		const doitProjects = await doitLib.getProjects();
		const doitProjectNames = Object.values(doitProjects).map(this.formatName);
		doitProjectNames.push('Inbox');
		
		const todoistProjects = todoistApi.projects.get();
		const todoistProjectNames = todoistProjects.map(project => project.name);
		
		const missingProjectNames = [...new Set(doitProjectNames.filter(name => !todoistProjectNames.includes(name)))];
		console.log(missingProjectNames);

		for (const name of missingProjectNames) {
			await todoistApi.projects.add({ name: name });
		}

		await todoistApi.commit();
	}

	static async syncContexts(doitLib, todoistApi) {
		await todoistApi.sync();

		const contextNames = [nextContextName, somedayContextName, waitingContextName];

		const todoistLabels = todoistApi.labels.get();
		for (const name of contextNames) {
			const label = todoistLabels.filter(filter => filter.name.includes(name))[0];
			if (!label) {
				await todoistApi.labels.add({ name: name, favorite: true });
			}
		}
		// add labels
		// add sections

		// const somedayContextName = 'Someday';
		// const nextContextName = 'Next';
		// const waitingContextName = 'Waiting';
		// 1. get contexts
		// 2. check missing
		// 3. add missing

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
