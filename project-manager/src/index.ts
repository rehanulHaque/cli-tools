#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises'
import chalk from 'chalk';
import Table from 'cli-table3';

const program = new Command();

const DATA_FILE= 'C:/Users/User/Desktop/data.json' // yur data file path

program
    .version('1.0.0')
    .description('A simple project manager tool for cli.');

function colorStatus(status: string) {
    if (!status) return status;
    switch (status.toLowerCase()) {
        case 'completed':
            return chalk.green.bold(status);
        case 'in-progress':
        case 'in progress':
            return chalk.yellow.bold(status);
        case 'planned':
            return chalk.cyan.bold(status);
        default:
            return chalk.red.bold(status);
    }
}

program
    .command('list')
    .description('List all projects')
    .action(async () => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf-8');
            const data = JSON.parse(file);
            const projects = data.projects || [];

            if (projects.length === 0) {
                console.log(chalk.dim('No projects found.'));
                return;
            }

            const table = new Table({
                head: [chalk.bold('ID'), chalk.bold('Title'), chalk.bold('Status'), chalk.bold('Start'), chalk.bold('End'), chalk.bold('Description')],
                colWidths: [6, 24, 16, 12, 12, 40],
                wordWrap: true
            } as any);

            projects.forEach((p: any) => {
                table.push([
                    p.id,
                    chalk.white(p.title || ''),
                    colorStatus(p.status || ''),
                    chalk.gray(p.start_date || ''),
                    chalk.gray(p.end_date || ''),
                    chalk.dim(p.description || '')
                ]);
            });

            console.log(table.toString());
        } catch (err: any) {
            console.error(chalk.red('Failed to read projects:'), err.message || err);
            process.exitCode = 1;
        }
    });

program.command('add <title> <description> <start_date> <end_date>')
    .description('Add a new project')
    .action(async (title: string, description: string, start_date: string, end_date: string) => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf-8');
            const data = JSON.parse(file);
            const projects = data.projects || [];
            const newProject = {
                id: projects.length,
                title,
                description,
                status: "planned",
                start_date,
                end_date,
                tasks: []
            };
            projects.push(newProject);
            await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
            console.log(chalk.green(`Added project ${chalk.bold(title)} (id: ${newProject.id})`));
        } catch (err: any) {
            console.error(chalk.red('Failed to add project:'), err.message || err);
            process.exitCode = 1;
        }
    })

program.command('status <id> <status>')
    .description('Update the status of a project')
    .action(async (id: string, status: string) => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf-8');
            const data = JSON.parse(file);
            const projects = data.projects || [];
            const pid = parseInt(id, 10);
            const project = projects.find((project: any) => project.id === pid);
            if (!project) {
                console.error(chalk.red(`Project with id ${id} not found`));
                process.exitCode = 2;
                return;
            }
            project.status = status;
            project.updated_at = new Date().toISOString();
            await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
            console.log(chalk.green(`Updated status for ${chalk.bold(project.title)} to ${colorStatus(status)}`));
        } catch (err: any) {
            console.error(chalk.red('Failed to update status:'), err.message || err);
            process.exitCode = 1;
        }
    })

program.command('delete <id>')
    .description('Delete a project')
    .action(async (id: string) => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf-8');
            const data = JSON.parse(file);
            const projects = data.projects || [];
            const pid = parseInt(id, 10);
            const idx = projects.findIndex((project: any) => project.id === pid);
            if (idx === -1) {
                console.error(chalk.red(`Project with id ${id} not found`));
                process.exitCode = 2;
                return;
            }
            const removed = projects.splice(idx, 1)[0];
            // reindex ids to keep them contiguous
            projects.forEach((p: any, i: number) => p.id = i);
            await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
            console.log(chalk.green(`Deleted project ${chalk.bold(removed.title)} (id: ${id})`));
        } catch (err: any) {
            console.error(chalk.red('Failed to delete project:'), err.message || err);
            process.exitCode = 1;
        }
    })

program
    .command('update <id>')
    .description('Update a project by id. Only provided options are changed.')
    .option('-t, --title <title>', 'Title')
    .option('-d, --description <description>', 'Description')
    .option('-s, --start_date <start_date>', 'Start date (YYYY-MM-DD)')
    .option('-e, --end_date <end_date>', 'End date (YYYY-MM-DD)')
    .action(async (id, options) => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf8');
            const data = JSON.parse(file);
            const projects = data.projects || [];

            const pid = parseInt(id, 10);
            const project = projects.find((p: any) => p.id === pid);

            if (!project) {
                console.error(chalk.red(`Project with id ${id} not found`));
                process.exitCode = 2;
                return;
            }

            // Only update fields that were actually passed
            if (options.title !== undefined) project.title = options.title;
            if (options.description !== undefined) project.description = options.description;
            if (options.start_date !== undefined) project.start_date = options.start_date;
            if (options.end_date !== undefined) project.end_date = options.end_date;

            // optional: touch an updated_at
            project.updated_at = new Date().toISOString();

            await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
            console.log(chalk.green(`Project ${chalk.bold(String(id))} updated successfully.`));
        } catch (err: any) {
            console.error(chalk.red('Error updating project:'), err.message || err);
            process.exitCode = 1;
        }
    });

    program.command("add-task <project_id> <task>")
    .description("Add a task to a project")
    .action(async (project_id, task) => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf-8');
            const data = JSON.parse(file);
            const projects = data.projects || [];
            const pid = parseInt(project_id, 10);
            const project = projects.find((project: any) => project.id === pid);
            if (!project) {
                console.error(chalk.red(`Project with id ${project_id} not found`));
                process.exitCode = 2;
                return;
            }
            project.tasks.push({
                id: project.tasks.length + 1,
                title: task,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
            console.log(chalk.green(`Added task ${chalk.bold(task)} to project ${chalk.bold(project.title)} (id: ${project_id})`));
        } catch (err: any) {
            console.error(chalk.red('Failed to add task:'), err.message || err);
            process.exitCode = 1;
        }
    })

    program.command("list-task <project_id>")
    .description("List tasks for a project")
    .action(async (project_id) => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf-8');
            const data = JSON.parse(file);
            const projects = data.projects || [];
            const pid = parseInt(project_id, 10);
            const project = projects.find((project: any) => project.id === pid);
            if (!project) {
                console.error(chalk.red(`Project with id ${project_id} not found`));
                process.exitCode = 2;
                return;
            }
            if (project.tasks && project.tasks.length > 0) {
                console.log(chalk.bold(`Tasks for project ${chalk.bold(project.title)} (id: ${project_id}):`))
                const table = new Table({
                    head: ['ID','Task', "Status", "Updated At"],
                    colAligns: ['left']
                });
                project.tasks.forEach((task: any) => {
                    table.push([task.id, task.title, task.status, task.updated_at]);
                });
                console.log(table.toString());
            } else {
                console.log(chalk.dim(`No tasks found for project ${chalk.bold(project.title)} (id: ${project_id})`));
            }
        } catch (err: any) {
            console.error(chalk.red('Failed to list tasks:'), err.message || err);
            process.exitCode = 1;
        }
    })

    program.command("del-task <project_id> <task_id>")
    .description("Delete a task from a project")
    .action(async (project_id, task_id) => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf-8');
            const data = JSON.parse(file);
            const projects = data.projects || [];
            const pid = parseInt(project_id, 10);
            const project = projects.find((project: any) => project.id === pid);
            if (!project) {
                console.error(chalk.red(`Project with id ${project_id} not found`));
                process.exitCode = 2;
                return;
            }
            const idx = project.tasks.findIndex((t: any) => t.id == task_id);
            if (idx === -1) {
                console.error(chalk.red(`Task with id ${task_id} not found in project ${project.title} (id: ${project_id})`));
                process.exitCode = 2;
                return;
            }
            project.tasks.splice(idx, 1);
            await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
            console.log(chalk.green(`Deleted task with id ${chalk.bold(task_id)} from project ${chalk.bold(project.title)} (id: ${project_id})`));
        } catch (err: any) {
            console.error(chalk.red('Failed to delete task:'), err.message || err);
            process.exitCode = 1;
        }
    })

    program.command("update-task <project_id> <task_id>").description("Update a task by id. Only provided options are changed.")
    .action(async (project_id, task_id) => {
        try {
            const file = await fs.readFile(DATA_FILE, 'utf-8');
            const data = JSON.parse(file);
            const projects = data.projects || [];
            const pid = parseInt(project_id, 10);
            const project = projects.find((project: any) => project.id === pid);
            if (!project) {
                console.error(chalk.red(`Project with id ${project_id} not found`));
                process.exitCode = 2;
                return;
            }
            const task = project.tasks.find((t: any) => t.id == task_id);
            if (!task) {
                console.error(chalk.red(`Task with id ${task_id} not found in project ${project.title} (id: ${project_id})`));
                process.exitCode = 2;
                return;
            }
            // optional: touch an updated_at
            task.updated_at = new Date().toISOString();
            task.status = "completed";
            await fs.writeFile(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
            console.log(chalk.green(`Updated task with id ${chalk.bold(task_id)} in project ${chalk.bold(project.title)} (id: ${project_id})`));
        } catch (err: any) {
            console.error(chalk.red('Failed to update task:'), err.message || err);
            process.exitCode = 1;
        }
    })

program.parse(process.argv);