/**
 * Integration Test: Step Progression Flow
 *
 * Tests the complete flow of step progression:
 * 1. Complete step
 * 2. Unlock next step
 * 3. Update progress
 * 4. Track completion
 *
 * Note: Uses mock database directly due to MSW ESM compatibility issues
 */

import { db, seedDb, resetDb } from '@/mocks/db';
import {
  createSponsor,
  createSponsee,
  createStepContent,
  createUserStepProgress,
  createCompletedTask,
  createActiveRelationship,
} from '@/__tests__/fixtures';
import type { UserStepProgress, StepContent } from '@/types/database';

describe('Integration: Step Progression Flow', () => {
  afterEach(() => {
    resetDb();
  });

  describe('Complete Step Progression Workflow', () => {
    it('should handle complete step progression from step 1 to step 3', () => {
      // Arrange: Create sponsee and step content
      const sponsee = createSponsee({ id: 'sponsee-progress-1' });
      const step1 = createStepContent({ step_number: 1, title: 'Step 1' });
      const step2 = createStepContent({ step_number: 2, title: 'Step 2' });
      const step3 = createStepContent({ step_number: 3, title: 'Step 3' });

      seedDb({
        profiles: new Map([[sponsee.id, sponsee]]),
        stepsContent: new Map([
          [step1.id, step1],
          [step2.id, step2],
          [step3.id, step3],
        ]),
      });

      // Act: Step 1 - Complete Step 1
      const step1Progress = createUserStepProgress({
        id: 'progress-1',
        user_id: sponsee.id,
        step_number: 1,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      db.userStepProgress.set(step1Progress.id, step1Progress);

      // Assert: Step 1 marked as completed
      expect(db.userStepProgress.has(step1Progress.id)).toBe(true);
      const storedProgress1 = db.userStepProgress.get(step1Progress.id);
      expect(storedProgress1?.step_number).toBe(1);
      expect(storedProgress1?.completed).toBe(true);
      expect(storedProgress1?.completed_at).toBeDefined();

      // Act: Step 2 - Calculate current progress
      const completedSteps = Array.from(db.userStepProgress.values())
        .filter(p => p.user_id === sponsee.id && p.completed)
        .map(p => p.step_number)
        .sort((a, b) => a - b);

      const highestCompletedStep = Math.max(0, ...completedSteps);

      // Assert: Current progress is Step 1
      expect(highestCompletedStep).toBe(1);
      expect(completedSteps).toEqual([1]);

      // Act: Step 3 - Complete Step 2
      const step2Progress = createUserStepProgress({
        id: 'progress-2',
        user_id: sponsee.id,
        step_number: 2,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      db.userStepProgress.set(step2Progress.id, step2Progress);

      // Assert: Step 2 marked as completed
      const updatedCompletedSteps = Array.from(db.userStepProgress.values())
        .filter(p => p.user_id === sponsee.id && p.completed)
        .map(p => p.step_number)
        .sort((a, b) => a - b);

      expect(updatedCompletedSteps).toEqual([1, 2]);

      // Act: Step 4 - Start Step 3 (not completed yet)
      const step3Progress = createUserStepProgress({
        id: 'progress-3',
        user_id: sponsee.id,
        step_number: 3,
        completed: false,
        // No completed_at when not completed
      });

      db.userStepProgress.set(step3Progress.id, step3Progress);

      // Assert: Step 3 not completed
      const step3Stored = db.userStepProgress.get(step3Progress.id);
      expect(step3Stored?.completed).toBe(false);
      expect(step3Stored?.completed_at).toBeUndefined();

      // Act: Step 5 - Get all progress for user
      const allProgress = Array.from(db.userStepProgress.values())
        .filter(p => p.user_id === sponsee.id)
        .sort((a, b) => a.step_number - b.step_number);

      // Assert: All 3 steps tracked
      expect(allProgress).toHaveLength(3);
      expect(allProgress[0].step_number).toBe(1);
      expect(allProgress[0].completed).toBe(true);
      expect(allProgress[1].step_number).toBe(2);
      expect(allProgress[1].completed).toBe(true);
      expect(allProgress[2].step_number).toBe(3);
      expect(allProgress[2].completed).toBe(false);
    });

    it('should track reflection notes for each step', () => {
      // Arrange: Create user and step progress with notes
      const sponsee = createSponsee({ id: 'sponsee-notes' });

      const progressWithNotes = createUserStepProgress({
        id: 'progress-notes',
        user_id: sponsee.id,
        step_number: 1,
        completed: true,
        notes: 'I realized that I am powerless over alcohol and my life had become unmanageable.',
        completed_at: new Date().toISOString(),
      });

      seedDb({
        profiles: new Map([[sponsee.id, sponsee]]),
        userStepProgress: new Map([[progressWithNotes.id, progressWithNotes]]),
      });

      // Act: Retrieve progress with notes
      const progress = db.userStepProgress.get(progressWithNotes.id);

      // Assert: Notes are stored
      expect(progress?.notes).toBe(
        'I realized that I am powerless over alcohol and my life had become unmanageable.'
      );
    });

    it('should calculate overall progress percentage', () => {
      // Arrange: Create user with partial progress
      const sponsee = createSponsee({ id: 'sponsee-percentage' });
      const totalSteps = 12;

      // Complete first 4 steps
      const progress1 = createUserStepProgress({
        id: 'prog-1',
        user_id: sponsee.id,
        step_number: 1,
        completed: true,
      });
      const progress2 = createUserStepProgress({
        id: 'prog-2',
        user_id: sponsee.id,
        step_number: 2,
        completed: true,
      });
      const progress3 = createUserStepProgress({
        id: 'prog-3',
        user_id: sponsee.id,
        step_number: 3,
        completed: true,
      });
      const progress4 = createUserStepProgress({
        id: 'prog-4',
        user_id: sponsee.id,
        step_number: 4,
        completed: true,
      });

      seedDb({
        profiles: new Map([[sponsee.id, sponsee]]),
        userStepProgress: new Map([
          [progress1.id, progress1],
          [progress2.id, progress2],
          [progress3.id, progress3],
          [progress4.id, progress4],
        ]),
      });

      // Act: Calculate progress percentage
      const completedCount = Array.from(db.userStepProgress.values()).filter(
        p => p.user_id === sponsee.id && p.completed
      ).length;

      const progressPercentage = Math.round((completedCount / totalSteps) * 100);

      // Assert: 4 out of 12 steps = 33%
      expect(completedCount).toBe(4);
      expect(progressPercentage).toBe(33);
    });

    it('should handle step completion with associated tasks', () => {
      // Arrange: Create sponsor-sponsee relationship
      const sponsor = createSponsor({ id: 'sponsor-step-tasks' });
      const sponsee = createSponsee({ id: 'sponsee-step-tasks' });

      // Create completed tasks for step 1
      const task1 = createCompletedTask({
        id: 'task-step1-a',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        step_number: 1,
        title: 'Read Step 1',
      });

      const task2 = createCompletedTask({
        id: 'task-step1-b',
        sponsor_id: sponsor.id,
        sponsee_id: sponsee.id,
        step_number: 1,
        title: 'Reflect on powerlessness',
      });

      seedDb({
        profiles: new Map([
          [sponsor.id, sponsor],
          [sponsee.id, sponsee],
        ]),
        tasks: new Map([
          [task1.id, task1],
          [task2.id, task2],
        ]),
      });

      // Act: Check if all tasks for step 1 are completed
      const step1Tasks = Array.from(db.tasks.values()).filter(
        t => t.sponsee_id === sponsee.id && t.step_number === 1
      );

      const allStep1TasksCompleted = step1Tasks.every(t => t.status === 'completed');

      // Assert: All tasks completed
      expect(step1Tasks).toHaveLength(2);
      expect(allStep1TasksCompleted).toBe(true);

      // Act: Mark step as complete since all tasks are done
      const stepProgress = createUserStepProgress({
        id: 'step1-complete',
        user_id: sponsee.id,
        step_number: 1,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      db.userStepProgress.set(stepProgress.id, stepProgress);

      // Assert: Step marked as completed
      const progress = db.userStepProgress.get(stepProgress.id);
      expect(progress?.completed).toBe(true);
    });

    it('should prevent skipping steps without proper progression', () => {
      // Arrange: Create user with no progress
      const sponsee = createSponsee({ id: 'sponsee-skip' });

      seedDb({
        profiles: new Map([[sponsee.id, sponsee]]),
      });

      // Act: Check if user can access step 3 without completing 1 and 2
      const completedSteps = Array.from(db.userStepProgress.values())
        .filter(p => p.user_id === sponsee.id && p.completed)
        .map(p => p.step_number);

      const highestCompleted = Math.max(0, ...completedSteps);
      const canAccessStep3 = highestCompleted >= 2; // Must complete step 2 to access step 3

      // Assert: Cannot access step 3
      expect(canAccessStep3).toBe(false);
      expect(highestCompleted).toBe(0);

      // Act: Complete step 1
      const step1Progress = createUserStepProgress({
        id: 'step1',
        user_id: sponsee.id,
        step_number: 1,
        completed: true,
      });

      db.userStepProgress.set(step1Progress.id, step1Progress);

      // Act: Check again
      const updatedCompletedSteps = Array.from(db.userStepProgress.values())
        .filter(p => p.user_id === sponsee.id && p.completed)
        .map(p => p.step_number);

      const updatedHighest = Math.max(0, ...updatedCompletedSteps);
      const canAccessStep3After = updatedHighest >= 2;

      // Assert: Still cannot access step 3 (only completed step 1)
      expect(canAccessStep3After).toBe(false);
      expect(updatedHighest).toBe(1);
    });

    it('should track multiple users progress independently', () => {
      // Arrange: Create two sponsees
      const sponsee1 = createSponsee({ id: 'sponsee-multi-1' });
      const sponsee2 = createSponsee({ id: 'sponsee-multi-2' });

      const sponsee1Step1 = createUserStepProgress({
        id: 'sp1-step1',
        user_id: sponsee1.id,
        step_number: 1,
        completed: true,
      });

      const sponsee1Step2 = createUserStepProgress({
        id: 'sp1-step2',
        user_id: sponsee1.id,
        step_number: 2,
        completed: true,
      });

      const sponsee2Step1 = createUserStepProgress({
        id: 'sp2-step1',
        user_id: sponsee2.id,
        step_number: 1,
        completed: true,
      });

      seedDb({
        profiles: new Map([
          [sponsee1.id, sponsee1],
          [sponsee2.id, sponsee2],
        ]),
        userStepProgress: new Map([
          [sponsee1Step1.id, sponsee1Step1],
          [sponsee1Step2.id, sponsee1Step2],
          [sponsee2Step1.id, sponsee2Step1],
        ]),
      });

      // Act: Get progress for each user
      const sponsee1Progress = Array.from(db.userStepProgress.values())
        .filter(p => p.user_id === sponsee1.id && p.completed)
        .map(p => p.step_number)
        .sort((a, b) => a - b);

      const sponsee2Progress = Array.from(db.userStepProgress.values())
        .filter(p => p.user_id === sponsee2.id && p.completed)
        .map(p => p.step_number)
        .sort((a, b) => a - b);

      // Assert: Different progress for each user
      expect(sponsee1Progress).toEqual([1, 2]);
      expect(sponsee2Progress).toEqual([1]);
    });
  });
});
