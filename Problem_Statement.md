# TaskFlow: Problem Statement

## What we are building

Build a simple task manager web app called **TaskFlow**. Users can add tasks, see their list, mark tasks as done, and delete tasks. The app should work in a browser and save tasks so they are still there after a page refresh.

## Why it matters

To-do lists are one of the most common everyday tools. Building one teaches the full path of a real product: a user interface, a backend API, a database, and a public deployment. You will finish with something you can show to anyone.

## What you need to build

### Must have

1. Add a new task with a title.
2. See a list of all tasks.
3. Mark a task as done (and mark it open again).
4. Delete a task.

### Should have

5. Filter the list by status: All, Open, or Done.

### Could have

6. A due date or a priority label (High, Medium, Low) for each task.

### Stretch goal

7. Deploy the app so anyone can open it with a public link.

## Technical requirements

- **Frontend:** React with Vite. You may use shadcn/ui for ready-made components.
- **Backend:** Python with FastAPI. Your API must expose endpoints to create, list, update, and delete tasks.
- **Database:** Supabase (Postgres). Tasks must be stored there, not only in memory.
- **Secrets:** Store keys and passwords in environment variables. Never commit a `.env` file or hardcode a key.

## Definition of done

Your project is complete when:

- The Must-have features work in the browser.
- Tasks persist after a page refresh.
- Your README explains how to run the app and which environment variables it needs.
- Your code is pushed to your own GitHub repository.

## Deliverables

1. A GitHub repository link.
2. A short README with setup steps and one screenshot.
3. A live link, if you completed the deployment stretch goal.
4. One pull request to the class repository with a real change and a clear description.

## Time

About 1.5 hours. Start with the Must-have features and only move to the next level when those work.

## Judging criteria

Judges look at these, roughly in this order:

- It works when they open it.
- The problem and the features are clear.
- The demo runs smoothly.
- The code and README are clean and easy to follow.
- It is deployed.

**A simple app that works beats an ambitious app that is broken.**

## Ground rules

- Never paste API keys, passwords, or tokens into an AI chat.
- Read every AI-generated change before you accept it.
- Only install tools and agent skills from trusted, official sources.
- Check the license before you reuse someone else's code.
