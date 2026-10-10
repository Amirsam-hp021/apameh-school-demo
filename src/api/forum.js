import { respond, fail, newId } from './client';
import { db, person, classSummary } from './db';

function enrich(topic) {
  const last = topic.replies[topic.replies.length - 1];
  return {
    ...topic,
    author: person(topic.authorId),
    class: classSummary(topic.classId),
    replyCount: topic.replies.length,
    lastActivity: last ? last.createdAt : topic.createdAt,
    replies: topic.replies.map((r) => ({ ...r, author: person(r.authorId) })),
  };
}

/** Topics in the given classes; pinned first, then most recent activity. */
export function listTopics({ classIds }) {
  const items = db.forumTopics
    .filter((t) => classIds.includes(t.classId))
    .map(enrich)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.lastActivity) - new Date(a.lastActivity));
  return respond(items);
}

export function getTopic(id) {
  const t = db.forumTopics.find((x) => x.id === id);
  return t ? respond(enrich(t)) : fail('Topic not found');
}

export function createTopic(classId, authorId, { title, body }) {
  const t = { id: newId('ft'), classId, authorId, title, body, pinned: false, createdAt: new Date().toISOString(), replies: [] };
  db.forumTopics.push(t);
  return respond(enrich(t));
}

export function reply(topicId, authorId, body) {
  const t = db.forumTopics.find((x) => x.id === topicId);
  if (!t) return fail('Topic not found');
  t.replies.push({ id: newId('fr'), authorId, body, createdAt: new Date().toISOString() });
  return respond(enrich(t));
}

/** Moderation (teacher only). */
export function togglePin(topicId) {
  const t = db.forumTopics.find((x) => x.id === topicId);
  if (!t) return fail('Topic not found');
  t.pinned = !t.pinned;
  return respond(enrich(t));
}

export function deleteTopic(topicId) {
  db.forumTopics = db.forumTopics.filter((t) => t.id !== topicId);
  return respond({ ok: true });
}

export function deleteReply(topicId, replyId) {
  const t = db.forumTopics.find((x) => x.id === topicId);
  if (!t) return fail('Topic not found');
  t.replies = t.replies.filter((r) => r.id !== replyId);
  return respond(enrich(t));
}
