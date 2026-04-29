import { createServerFn } from '@tanstack/react-start';
import { prisma } from '../lib/prisma';

export const getResumes = createServerFn({ method: 'GET' })
  .inputValidator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    return prisma.resume.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
    });
  });

export const getResume = createServerFn({ method: 'GET' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    return prisma.resume.findUnique({
      where: { id },
    });
  });

export const deleteResume = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    return prisma.resume.delete({
      where: { id },
    });
  });

export const createResume = createServerFn({ method: 'POST' })
  .inputValidator((data: { user_id: string; title: string; content: any }) => data)
  .handler(async ({ data }) => {
    return prisma.resume.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        content: data.content,
      },
    });
  });

export const updateResume = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; title: string; content: any }) => data)
  .handler(async ({ data }) => {
    return prisma.resume.update({
      where: { id: data.id },
      data: {
        title: data.title,
        content: data.content,
      },
    });
  });

export const incrementResumeViews = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    return prisma.resume.update({
      where: { id },
      data: {
        views: { increment: 1 }
      },
    });
  });

export const incrementResumeDownloads = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    return prisma.resume.update({
      where: { id },
      data: {
        downloads: { increment: 1 }
      },
    });
  });
