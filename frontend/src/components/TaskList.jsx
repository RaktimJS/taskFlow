import React from "react"
import { TaskItem } from "./TaskItem"
import { EmptyState } from "./EmptyState"

export function TaskList({
  tasks,
  totalTasksCount,
  currentFilter,
  onToggleTask,
  onDeleteTask,
  onOpenNewTask,
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[220px]">
        <EmptyState
          filter={currentFilter}
          onAddNewTask={onOpenNewTask}
          totalCount={totalTasksCount}
        />
      </div>
    )
  }

  return (
    <div
      role="list"
      aria-label="Tasks list"
      className="flex-1 min-h-[220px] flex flex-col gap-2.5 mt-4 overflow-y-auto pr-1"
    >
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
        />
      ))}
    </div>
  )
}
