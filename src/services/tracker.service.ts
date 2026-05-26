import * as trackerModel from '../models/tracker.model';
import { TrackerEntry, TrackerFilters, AppError } from '../types';

async function createEntry(userId: number, data: Record<string, unknown>): Promise<TrackerEntry> {
  return trackerModel.create(userId, data as Parameters<typeof trackerModel.create>[1]);
}

async function getAllEntries(userId: number, filters: TrackerFilters): Promise<TrackerEntry[]> {
  return trackerModel.findAll(userId, filters);
}

async function getEntry(id: number, userId: number): Promise<TrackerEntry> {
  const entry = await trackerModel.findById(id);

  if (!entry) {
    throw new AppError('Tracker entry not found', 404);
  }

  if (entry.user_id !== userId) {
    throw new AppError('You do not have permission to view this entry', 403);
  }

  return entry;
}

async function updateEntry(
  id: number,
  userId: number,
  data: Record<string, unknown>
): Promise<TrackerEntry> {
  const entry = await trackerModel.findById(id);

  if (!entry) {
    throw new AppError('Tracker entry not found', 404);
  }

  if (entry.user_id !== userId) {
    throw new AppError('You do not have permission to update this entry', 403);
  }

  const updated = await trackerModel.update(id, data as Parameters<typeof trackerModel.update>[1]);
  return updated!;
}

async function deleteEntry(id: number, userId: number): Promise<void> {
  const entry = await trackerModel.findById(id);

  if (!entry) {
    throw new AppError('Tracker entry not found', 404);
  }

  if (entry.user_id !== userId) {
    throw new AppError('You do not have permission to delete this entry', 403);
  }

  await trackerModel.deleteById(id);
}

export { createEntry, getAllEntries, getEntry, updateEntry, deleteEntry };
