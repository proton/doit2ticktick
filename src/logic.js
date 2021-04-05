import Q from 'q';
const _ = require('lodash');
import moment from 'moment';
import naturalSort from 'javascript-natural-sort';
// const fs = require('fs-extra');

const nextBoxName = 'Next';
const somedayBoxName = 'Someday';
const waitingBoxName = 'Waiting';

const todoist = require('todoist').v8

export default class GrabberLogic {
	static async sync(lib, argv) {
		const todoistApi = todoist(argv.todoistToken);
		await this.syncProjects(lib, todoistApi);
		await this.syncProjectNotes(lib, todoistApi);
		await this.syncTags(lib, todoistApi);
		await this.syncContexts(lib, todoistApi);
		await this.syncBoxes(lib, todoistApi);
		await this.syncTasks(lib, todoistApi);
	}

	static formatName(name) {
		return name.replace(/[\(\)]/g, '_')
	}

	static async syncProjects(doitLib, todoistApi) {
		await todoistApi.sync();

		let doitProjects = await doitLib.getProjects();
		doitProjects.push({ name: 'Inbox' });
		
		const todoistProjects = todoistApi.projects.get();

		for (const doitProject of doitProjects) {
			const todoistProject = todoistProjects.find(p => this.formatName(p.name) == this.formatName(doitProject.name));
			if (!todoistProject) {
				await todoistApi.projects.add({ name: this.formatName(doitProject.name) });
			}
		}

		await todoistApi.commit();
	}

	static async syncProjectNotes(doitLib, todoistApi) {
		await todoistApi.sync();

		let doitProjects = await doitLib.getProjects();
		
		const todoistProjects = todoistApi.projects.get();
		const todoistProjectNotes = todoistApi.projectNotes.get();

		for (const doitProject of doitProjects) {
			const todoistProject = todoistProjects.find(p => this.formatName(p.name) == this.formatName(doitProject.name));
			if (todoistProject && doitProject.notes) {
				const todoistProjectNote = todoistProjectNotes.find(n => n.project_id == todoistProject.id)
				if (!todoistProjectNote) {
					// Error: An invalid sync command was sent
					// await todoistApi.projectNotes.add({ content: doitProject.notes.replace(/\s+/g, ' '), project_id: todoistProject.id });
				}
			}
		}

		await todoistApi.commit();
	}

	static async syncTags(doitLib, todoistApi) {
		await todoistApi.sync();

		const doitTasks = await doitLib.getAllTasks();
		let tags = doitTasks.filter(t => t.tags).flatMap(t => t.tags);
		tags = [...new Set(tags)];

		const todoistLabels = todoistApi.labels.get();
		for (const name of tags) {
			const label = todoistLabels.find(l => this.formatName(l.name) === this.formatName(name));
			if (!label) {
				await todoistApi.labels.add({ name: this.formatName(name) });
			}
		}

		await todoistApi.commit();
	}

	static async syncContexts(doitLib, todoistApi) {
		await todoistApi.sync();

		const doitContexts = await doitLib.getContexts();
		let contexts = doitContexts.map(c => c.name);

		const todoistLabels = todoistApi.labels.get();
		for (const name of contexts) {
			const label = todoistLabels.find(l => this.formatName(l.name) === this.formatName(name));
			if (!label) {
				await todoistApi.labels.add({ name: this.formatName(name) });
			}
		}

		await todoistApi.commit();
	}

	static async syncBoxes(_doitLib, todoistApi) {
		await todoistApi.sync();

		const boxNames = [nextBoxName, somedayBoxName, waitingBoxName];

		// add labels
		const todoistLabels = todoistApi.labels.get();
		for (const name of boxNames) {
			const label = todoistLabels.find(l => l.name.includes(name));
			if (!label) {
				await todoistApi.labels.add({ name: name, favorite: true });
			}
		}

		// add sections
		const todoistSections = todoistApi.sections.get();
		const todoistProjects = todoistApi.projects.get();
		for (const project of todoistProjects) {
			for (const name of boxNames) {
				const section = todoistSections.find(s => s.name == name && s.project_id == project.id);
				if (!section) {
					await todoistApi.sections.add({ name: name, project_id: project.id });
				}
			}
		}

		await todoistApi.commit();
	}

	static async syncTasks(doitLib, todoistApi) {
		await todoistApi.sync();

		const doitProjects = await doitLib.getProjects();
		let doitTasks = await doitLib.getAllTasks();
		doitTasks = doitTasks.filter(t => t.completed === 0 && t.archived === 0 && t.hidden === 0);
		const doitContexts = await doitLib.getContexts();
		const todoistSections = todoistApi.sections.get();
		const todoistProjects = todoistApi.projects.get();
		const todoistTasks = todoistApi.items.get();
		const todoistNotes = todoistApi.notes.get();
		const todoistLabels = todoistApi.labels.get();

		// let projectMap = {};
		const contextMap = {};
		for (const doitContext of doitContexts) {
			const label = todoistLabels.find(l => this.formatName(l.name) === this.formatName(doitContext.name));
			if (!label) throw `label with name "${doitContext.name}" not found`
			contextMap[doitContext.uuid] = label.id;
		}
		const tagsMap = {};
		for (const doitTask of doitTasks) {
			if (!doitTask.tags) continue;
				for (const tag of doitTask.tags) {
				const label = todoistLabels.find(l => this.formatName(l.name) === this.formatName(tag));
				if (!label) throw `label with name "${tag}" not found`
				tagsMa[tag] = label.id;
			}
		}

		for (const doitTask of doitTasks) {
			// console.log(doitTask);

			// content
			// project_id
			// section_id
			// parent_id
			// order
			// label_ids
			// priority
			// due_date
			// due_datetime

			// + note!!!
		
			// const t = await todoistApi.items.add({ content: 'delete me plz' })
			// console.log(t);
		}

		await todoistApi.commit();
	}
}
