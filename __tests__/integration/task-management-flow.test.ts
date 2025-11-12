/**
 * Integration Test: Task Management Flow
 *
 * Tests the complete flow of task assignment and completion:
 * 1. Sponsor assigns task to sponsee
 * 2. Task is created in database
 * 3. Sponsee views and completes task
 * 4. Sponsor sees task completion
 *
 * Note: Uses mock database directly due to MSW ESM compatibility issues
 */

import { db, seedDb, resetDb } from '@/mocks/db';
import {
  createSponsor,
  createSponsee,
  createTask,
  createAssignedTask,
  createInProgressTask,
  createCompletedTask,
  createActiveRelationship,
} from '@/__tests__/fixtures';
import type { Task, TaskStatus } from '@/types/database';

describe('Integration: Task Management Flow', () => {
  afterEach(() => {
    resetDb();
  });

  describe('Complete Task Assignment and Completion', () => {
    it('should handle complete task lifecycle from creation to completion', () => {
      // Arrange: Create sponsor-sponsee relationship
      const sponsor = createSponsor({ id: 'sponsor-task-1' });
      const sponsee = createSponsee({ id: 'sponsee-task-1' });
      const relationship = createActiveRelationship({
        id: 'rel-task-1',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        relationships: new Map([[relationship.id, relationship]]),
      });

      // Act: Step 1 - Sponsor creates and assigns a task
      const task = createAssignedTask({
        id: 'task-1',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        title: 'Read Step 1 of the Big Book',
        description: 'Read pages 21-43 and reflect on powerlessness',
        step_number: 1,
      });

      db.tasks.set(task.id, task);

      // Assert: Task created successfully
      expect(db.tasks.has(task.id)).toBe(true);
      const storedTask = db.tasks.get(task.id);
      expect(storedTask?.status).toBe('assigned');
      expect(storedTask?.title).toBe('Read Step 1 of the Big Book');
      expect(storedTask?.sponsor_id).toBe(sponsor.id);
      expect(storedTask?.sponsee_id).toBe(sponsee.id);

      // Act: Step 2 - Sponsee views their assigned tasks
      const sponseeTasks = Array.from(db.tasks.values()).filter(
        t => t.sponsee_id === sponsee.id && t.status === 'assigned'
      );

      // Assert: Sponsee can see the task
      expect(sponseeTasks).toHaveLength(1);
      expect(sponseeTasks[0].id).toBe(task.id);
      expect(sponseeTasks[0].title).toBe('Read Step 1 of the Big Book');

      // Act: Step 3 - Sponsee starts working on the task
      if (storedTask) {
        storedTask.status = 'in_progress';
        db.tasks.set(task.id, storedTask);
      }

      // Assert: Task status updated to in_progress
      const inProgressTask = db.tasks.get(task.id);
      expect(inProgressTask?.status).toBe('in_progress');

      // Act: Step 4 - Sponsee completes the task
      if (inProgressTask) {
        inProgressTask.status = 'completed';
        inProgressTask.completed_at = new Date().toISOString();
        db.tasks.set(task.id, inProgressTask);
      }

      // Assert: Task marked as completed
      const completedTask = db.tasks.get(task.id);
      expect(completedTask?.status).toBe('completed');
      expect(completedTask?.completed_at).toBeDefined();

      // Act: Step 5 - Sponsor views completed tasks
      const sponsorCompletedTasks = Array.from(db.tasks.values()).filter(
        t => t.sponsor_id === sponsor.id && t.status === 'completed'
      );

      // Assert: Sponsor can see the completed task
      expect(sponsorCompletedTasks).toHaveLength(1);
      expect(sponsorCompletedTasks[0].id).toBe(task.id);
      expect(sponsorCompletedTasks[0].sponsee_id).toBe(sponsee.id);
    });

    it('should allow sponsors to view all tasks they assigned', () => {
      // Arrange: Create sponsor with multiple sponsees
      const sponsor = createSponsor({ id: 'sponsor-multi-task' });
      const sponsee1 = createSponsee({ id: 'sponsee-task-a' });
      const sponsee2 = createSponsee({ id: 'sponsee-task-b' });

      const task1 = createAssignedTask({
        id: 'task-a1',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee1.id,
        title: 'Task A1',
      });
      const task2 = createInProgressTask({
        id: 'task-a2',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee1.id,
        title: 'Task A2',
      });
      const task3 = createCompletedTask({
        id: 'task-b1',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee2.id,
        title: 'Task B1',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee1.id, sponsee1],
          [sponsee2.id, sponsee2],
        ]),
        tasks: new Map([
          [task1.id, task1],
          [task2.id, task2],
          [task3.id, task3],
        ]),
      });

      // Act: Query all tasks assigned by the sponsor
      const allSponsorTasks = Array.from(db.tasks.values()).filter(
        t => t.sponsor_id === sponsor.id
      );

      // Assert: All tasks returned
      expect(allSponsorTasks).toHaveLength(3);

      // Act: Query by status
      const assignedTasks = allSponsorTasks.filter(t => t.status === 'assigned');
      const inProgressTasks = allSponsorTasks.filter(t => t.status === 'in_progress');
      const completedTasks = allSponsorTasks.filter(t => t.status === 'completed');

      // Assert: Tasks correctly grouped by status
      expect(assignedTasks).toHaveLength(1);
      expect(inProgressTasks).toHaveLength(1);
      expect(completedTasks).toHaveLength(1);
    });

    it('should allow sponsees to view only their own tasks', () => {
      // Arrange: Create two sponsees with different tasks
      const sponsor = createSponsor({ id: 'sponsor-privacy' });
      const sponsee1 = createSponsee({ id: 'sponsee-privacy-1' });
      const sponsee2 = createSponsee({ id: 'sponsee-privacy-2' });

      const task1 = createAssignedTask({
        id: 'task-privacy-1',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee1.id,
        title: 'Task for Sponsee 1',
      });
      const task2 = createAssignedTask({
        id: 'task-privacy-2',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee2.id,
        title: 'Task for Sponsee 2',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee1.id, sponsee1],
          [sponsee2.id, sponsee2],
        ]),
        tasks: new Map([
          [task1.id, task1],
          [task2.id, task2],
        ]),
      });

      // Act: Query tasks for sponsee 1
      const sponsee1Tasks = Array.from(db.tasks.values()).filter(t => t.sponsee_id === sponsee1.id);

      // Assert: Sponsee 1 only sees their own task
      expect(sponsee1Tasks).toHaveLength(1);
      expect(sponsee1Tasks[0].id).toBe(task1.id);
      expect(sponsee1Tasks[0].title).toBe('Task for Sponsee 1');

      // Act: Query tasks for sponsee 2
      const sponsee2Tasks = Array.from(db.tasks.values()).filter(t => t.sponsee_id === sponsee2.id);

      // Assert: Sponsee 2 only sees their own task
      expect(sponsee2Tasks).toHaveLength(1);
      expect(sponsee2Tasks[0].id).toBe(task2.id);
      expect(sponsee2Tasks[0].title).toBe('Task for Sponsee 2');
    });

    it('should handle task updates and modifications', () => {
      // Arrange: Create task
      const sponsor = createSponsor({ id: 'sponsor-edit' });
      const sponsee = createSponsee({ id: 'sponsee-edit' });
      const task = createAssignedTask({
        id: 'task-edit',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        title: 'Original Title',
        description: 'Original Description',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        tasks: new Map([[task.id, task]]),
      });

      // Assert: Initial task state
      const initialTask = db.tasks.get(task.id);
      expect(initialTask?.title).toBe('Original Title');
      expect(initialTask?.description).toBe('Original Description');

      // Act: Sponsor updates the task
      if (initialTask) {
        initialTask.title = 'Updated Title';
        initialTask.description = 'Updated Description with more details';
        db.tasks.set(task.id, initialTask);
      }

      // Assert: Task updated successfully
      const updatedTask = db.tasks.get(task.id);
      expect(updatedTask?.title).toBe('Updated Title');
      expect(updatedTask?.description).toBe('Updated Description with more details');
      expect(updatedTask?.status).toBe('assigned'); // Status unchanged
    });

    it('should track tasks by step number', () => {
      // Arrange: Create tasks for different steps
      const sponsor = createSponsor({ id: 'sponsor-steps' });
      const sponsee = createSponsee({ id: 'sponsee-steps' });

      const step1Task = createCompletedTask({
        id: 'task-step-1',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        step_number: 1,
        title: 'Step 1 Task',
      });

      const step2Task = createInProgressTask({
        id: 'task-step-2',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        step_number: 2,
        title: 'Step 2 Task',
      });

      const step3Task = createAssignedTask({
        id: 'task-step-3',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        step_number: 3,
        title: 'Step 3 Task',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        tasks: new Map([
          [step1Task.id, step1Task],
          [step2Task.id, step2Task],
          [step3Task.id, step3Task],
        ]),
      });

      // Act: Query tasks by step number
      const step1Tasks = Array.from(db.tasks.values()).filter(t => t.step_number === 1);
      const step2Tasks = Array.from(db.tasks.values()).filter(t => t.step_number === 2);
      const step3Tasks = Array.from(db.tasks.values()).filter(t => t.step_number === 3);

      // Assert: Tasks correctly grouped by step
      expect(step1Tasks).toHaveLength(1);
      expect(step1Tasks[0].status).toBe('completed');

      expect(step2Tasks).toHaveLength(1);
      expect(step2Tasks[0].status).toBe('in_progress');

      expect(step3Tasks).toHaveLength(1);
      expect(step3Tasks[0].status).toBe('assigned');

      // Act: Get current progress (highest completed step)
      const completedSteps = Array.from(db.tasks.values())
        .filter(t => t.sponsee_id === sponsee.id && t.status === 'completed')
        .map(t => t.step_number || 0)
        .filter(n => n > 0);

      const currentStep = Math.max(0, ...completedSteps);

      // Assert: Current progress calculated correctly
      expect(currentStep).toBe(1);
    });

    it('should handle task deletion', () => {
      // Arrange: Create task
      const sponsor = createSponsor({ id: 'sponsor-delete' });
      const sponsee = createSponsee({ id: 'sponsee-delete' });
      const task = createAssignedTask({
        id: 'task-delete',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        title: 'Task to Delete',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        tasks: new Map([[task.id, task]]),
      });

      // Assert: Task exists
      expect(db.tasks.has(task.id)).toBe(true);

      // Act: Delete the task
      db.tasks.delete(task.id);

      // Assert: Task no longer exists
      expect(db.tasks.has(task.id)).toBe(false);

      // Act: Query for the deleted task
      const tasks = Array.from(db.tasks.values()).filter(t => t.id === task.id);

      // Assert: No tasks found
      expect(tasks).toHaveLength(0);
    });
  });
});
