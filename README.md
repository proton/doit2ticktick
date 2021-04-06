# Doit.im to Todoist converter
This is a tool for exporting all your tasks from a popular GTD-compliant todo service doit.im to Todoist.

## Usage:
```
npm start -- --login=<your login> --password=<your password> --todoistToken=<your todoist token>
```
You can find your todoist token on this page: https://todoist.com/prefs/integrations

## What's done:

- Sync projects
- Sync tags/contexts (as Todoist's labels)
- Sync tasks

## What's doesn't work (yet):

- Project descriptions
- Repeated tasks
- Deadlines
- Reminders