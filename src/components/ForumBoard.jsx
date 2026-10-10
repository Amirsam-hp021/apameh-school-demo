import { useMemo, useState } from 'react';
import { ArrowLeft, MessageSquare, MessagesSquare, Pin, PinOff, Plus, Send, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAsync } from '../hooks/useAsync';
import { useFormat, useLocalize } from '../utils/format';
import Avatar from './Avatar';
import Badge from './Badge';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import Modal from './Modal';
import { SkeletonList } from './Skeleton';

/**
 * Per-class discussion board, shared by the teacher's class page and the student forum.
 *
 * - canModerate: pin / unpin / delete topics and replies (teachers)
 * - canCreateTopic: start new topics
 * - classes: [{ id, name }] - more than one shows the class name and a class filter
 */
export default function ForumBoard({ classes, canModerate = false, canCreateTopic = false }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notify } = useToast();
  const [classFilter, setClassFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const classIds = useMemo(() => classes.map((c) => c.id), [classes]);
  const multi = classes.length > 1;

  const { data: topics, loading, error, reload } = useAsync(() => api.forum.listTopics({ classIds }), [classIds.join(',')]);
  const visible = (topics || []).filter((tp) => classFilter === 'all' || tp.classId === classFilter);

  const togglePin = async (topic) => {
    await api.forum.togglePin(topic.id);
    notify(topic.pinned ? t('forum.unpinned') : t('forum.pinned'));
    reload({ silent: true });
  };

  const deleteTopic = async (topic) => {
    await api.forum.deleteTopic(topic.id);
    notify(t('forum.topicDeleted'));
    setSelectedId(null);
    reload({ silent: true });
  };

  if (selectedId) {
    return (
      <TopicView
        topicId={selectedId}
        canModerate={canModerate}
        onBack={() => {
          setSelectedId(null);
          reload({ silent: true });
        }}
        onTogglePin={togglePin}
        onDelete={deleteTopic}
        currentUser={user}
      />
    );
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        {multi ? (
          <select className="input sm:w-64" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} aria-label={t('forum.filterClass')}>
            <option value="all">{t('common.allClasses')}</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <h2 className="font-semibold text-slate-900">{t('forum.topics')}</h2>
        )}
        {canCreateTopic && (
          <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" /> {t('forum.newTopic')}
          </button>
        )}
      </div>

      {error && <ErrorState onRetry={reload} />}
      {loading && <div className="p-4"><SkeletonList rows={4} /></div>}
      {!loading && !error && visible.length === 0 && (
        <EmptyState icon={MessagesSquare} title={t('forum.empty')} description={canCreateTopic ? t('forum.emptyHintTeacher') : t('forum.emptyHint')} />
      )}
      {!loading && !error && visible.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {visible.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              showClass={multi}
              canModerate={canModerate}
              onOpen={() => setSelectedId(topic.id)}
              onTogglePin={() => togglePin(topic)}
              onDelete={() => deleteTopic(topic)}
            />
          ))}
        </ul>
      )}

      <NewTopicModal
        open={creating}
        classes={classes}
        defaultClassId={classFilter !== 'all' ? classFilter : classes[0]?.id}
        onClose={() => setCreating(false)}
        onCreated={(topic) => {
          setCreating(false);
          notify(t('forum.topicCreated'));
          reload({ silent: true });
          setSelectedId(topic.id);
        }}
      />
    </div>
  );
}

function TopicRow({ topic, showClass, canModerate, onOpen, onTogglePin, onDelete }) {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  return (
    <li className="flex items-start gap-3 p-4 hover:bg-slate-50/60">
      <Avatar person={topic.author} size="sm" />
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-start">
        <div className="flex flex-wrap items-center gap-2">
          {topic.pinned && <Badge tone="teal" icon={Pin}>{t('forum.pinnedLabel')}</Badge>}
          <span className="font-medium text-slate-900 hover:text-primary-700" dir="auto">{topic.title}</span>
        </div>
        <p className="mt-0.5 line-clamp-1 text-sm text-slate-500" dir="auto">{topic.body}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span>{nameOf(topic.author)}</span>
          {showClass && <span>{topic.class?.name}</span>}
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-3 w-3" aria-hidden="true" /> {t('forum.replyCount', { n: fmt.number(topic.replyCount) })}
          </span>
          <span>{fmt.relative(topic.lastActivity)}</span>
        </p>
      </button>
      {canModerate && (
        <div className="flex shrink-0 gap-1">
          <button type="button" className="icon-btn" onClick={onTogglePin} aria-label={topic.pinned ? t('forum.unpin') : t('forum.pin')} title={topic.pinned ? t('forum.unpin') : t('forum.pin')}>
            {topic.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
          <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" onClick={onDelete} aria-label={t('common.delete')} title={t('common.delete')}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  );
}

function TopicView({ topicId, canModerate, onBack, onTogglePin, onDelete, currentUser }) {
  const { t } = useTranslation();
  const { nameOf } = useLocalize();
  const fmt = useFormat();
  const { notify } = useToast();
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const { data: topic, loading, error, reload, setData } = useAsync(() => api.forum.getTopic(topicId), [topicId]);

  const send = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    const updated = await api.forum.reply(topicId, currentUser.id, reply.trim());
    setData(updated);
    setReply('');
    setSending(false);
    notify(t('forum.replyPosted'));
  };

  const removeReply = async (replyId) => {
    const updated = await api.forum.deleteReply(topicId, replyId);
    setData(updated);
    notify(t('forum.replyDeleted'));
  };

  return (
    <div className="space-y-4">
      <button type="button" className="btn-ghost -ms-2" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /> {t('forum.backToTopics')}
      </button>
      {error && <ErrorState onRetry={reload} />}
      {loading && <div className="card p-5"><SkeletonList rows={3} /></div>}
      {topic && !loading && (
        <>
          <article className="card p-5">
            <div className="flex items-start gap-3">
              <Avatar person={topic.author} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {topic.pinned && <Badge tone="teal" icon={Pin}>{t('forum.pinnedLabel')}</Badge>}
                  <Badge>{topic.class?.name}</Badge>
                </div>
                <h2 className="mt-1 text-lg font-semibold text-slate-900" dir="auto">{topic.title}</h2>
                <p className="text-xs text-slate-500">
                  {nameOf(topic.author)} · {t(`roles.${topic.author?.role}`)} · {fmt.dateTime(topic.createdAt)}
                </p>
              </div>
              {canModerate && (
                <div className="flex gap-1">
                  <button type="button" className="icon-btn" onClick={async () => { await onTogglePin(topic); reload({ silent: true }); }} aria-label={topic.pinned ? t('forum.unpin') : t('forum.pin')} title={topic.pinned ? t('forum.unpin') : t('forum.pin')}>
                    {topic.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </button>
                  <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" onClick={() => onDelete(topic)} aria-label={t('common.delete')} title={t('common.delete')}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="mt-4 whitespace-pre-line text-slate-700" dir="auto">{topic.body}</p>
          </article>

          <section className="card">
            <h3 className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-700">
              {t('forum.replies')} ({fmt.number(topic.replies.length)})
            </h3>
            {topic.replies.length === 0 ? (
              <EmptyState compact icon={MessageSquare} title={t('forum.noReplies')} />
            ) : (
              <ul className="divide-y divide-slate-100">
                {topic.replies.map((r) => (
                  <li key={r.id} className="flex gap-3 px-5 py-4">
                    <Avatar person={r.author} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium text-slate-900">{nameOf(r.author)}</span>
                        {r.author?.role === 'teacher' && <Badge tone="purple" className="ms-2">{t('roles.teacher')}</Badge>}
                        <span className="ms-2 text-xs text-slate-400">{fmt.relative(r.createdAt)}</span>
                      </p>
                      <p className="mt-1 text-sm text-slate-700" dir="auto">{r.body}</p>
                    </div>
                    {canModerate && (
                      <button type="button" className="icon-btn hover:bg-red-50 hover:text-red-600" onClick={() => removeReply(r.id)} aria-label={t('forum.deleteReply')} title={t('forum.deleteReply')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <form onSubmit={send} className="flex flex-col gap-2 border-t border-slate-100 p-4 sm:flex-row">
              <label htmlFor="reply" className="sr-only">{t('forum.writeReply')}</label>
              <textarea id="reply" rows={2} className="input flex-1" placeholder={t('forum.writeReply')} value={reply} onChange={(e) => setReply(e.target.value)} dir="auto" />
              <button type="submit" className="btn-primary sm:self-end" disabled={!reply.trim() || sending}>
                <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" /> {t('forum.postReply')}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

function NewTopicModal({ open, classes, defaultClassId, onClose, onCreated }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({ title: '', body: '', classId: '' });
  const [saving, setSaving] = useState(false);
  const classId = form.classId || defaultClassId;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    const topic = await api.forum.createTopic(classId, user.id, { title: form.title.trim(), body: form.body.trim() });
    setSaving(false);
    setForm({ title: '', body: '', classId: '' });
    onCreated(topic);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('forum.newTopic')}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" form="topic-form" className="btn-primary" disabled={saving || !form.title.trim() || !form.body.trim()}>
            {t('forum.createTopic')}
          </button>
        </>
      }
    >
      <form id="topic-form" onSubmit={submit} className="space-y-4">
        {classes.length > 1 && (
          <div>
            <label className="label" htmlFor="tp-class">{t('common.class')}</label>
            <select id="tp-class" className="input" value={classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="tp-title">{t('forum.topicTitle')}</label>
          <input id="tp-title" className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} dir="auto" />
        </div>
        <div>
          <label className="label" htmlFor="tp-body">{t('forum.topicBody')}</label>
          <textarea id="tp-body" rows={5} className="input" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} dir="auto" />
        </div>
      </form>
    </Modal>
  );
}
