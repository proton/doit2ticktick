import Q from 'q';
const _ = require('lodash');
import moment from 'moment';
import naturalSort from 'javascript-natural-sort';
// const fs = require('fs-extra');

const todoist = require('todoist').v8

export default class GrabberLogic {
	static async do(lib, argv) {
		const todoistApi = todoist(argv.todoistToken);
		await this.createMissingProjects(lib, todoistApi);

		// await todoistApi.sync();
		// todoistApi.commit();


		// getProjects
		// save projects
		// getAllTasks
		// save tasks

		// return Q()
		// .then(() => {
		// 	return lib.getProjects();
		// })
		// .then((projects) => {
		// 	console.log(projects);
		// 	return projects;
		// })
		// .then((projects) => {
		// 	return [projects, lib.getAllTasks()];
		// })
		// .then(([projects, tasks]) => {
		// 	// if (argv.output) {
		// 	// 	//noinspection JSUnresolvedFunction
		// 	// 	return fs.writeFile(argv.output, JSON.stringify(tasks, null, 4));
		// 	// }
		// 	console.log(projects);
		// 	console.log(tasks);
		// });
	}

	static async createMissingProjects(doitLib, todoistApi) {
		const doitProjects = await doitLib.getProjects();
		const doitProjectNames = Object.values(doitProjects);
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
}
