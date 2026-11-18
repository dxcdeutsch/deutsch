(function () {
  'use strict';

  const STORAGE_KEY = 'deutsch_completed_lessons_v1';
  const COLLAPSE_KEY = 'deutsch_archive_collapsed_v1';
  const DEFAULT_COMPLETED = [1, 3, 4, 6];

  const LESSONS = [
    { id: 1, file: 'index.html', shortTitle: 'Meetings & Vielredner', title: '1. Meetings & Vielredner', prefix: 'l1' },
    { id: 2, file: 'ki-produktivitaet.html', shortTitle: 'KI & Produktivität', title: '2. KI & Produktivität', prefix: 'l2' },
    { id: 3, file: 'nein-sagen.html', shortTitle: '»Nein« sagen im Job', title: '3. »Nein« sagen im Job', prefix: 'l3' },
    { id: 4, file: 'stretch-collaboration.html', shortTitle: 'Schwierige Kollegen', title: '4. Schwierige Kollegen', prefix: 'l4' },
    { id: 5, file: 'gefuehle-entscheidungen.html', shortTitle: 'Gefühle & Entscheidungen', title: '5. Gefühle & Entscheidungen', prefix: 'l5' },
    { id: 6, file: 'mittagsschlaf-powernap.html', shortTitle: 'Power Nap & Gehirn', title: '6. Power Nap & Gehirn', prefix: 'l6' },
    { id: 7, file: 'freundlichkeit-job.html', shortTitle: 'Freundlichkeit im Job', title: '7. Freundlichkeit im Job', prefix: 'l7' },
    { id: 8, file: 'bienen-honig.html', shortTitle: 'Bienen & Honig', title: '8. Bienen & Honig', prefix: 'l8' }
  ];

  function getCompletedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPLETED));
        return DEFAULT_COMPLETED.slice();
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return DEFAULT_COMPLETED.slice();
      return Array.from(new Set(parsed.map(Number).filter(n => LESSONS.some(l => l.id === n)))).sort((a, b) => a - b);
    } catch (e) {
      return DEFAULT_COMPLETED.slice();
    }
  }

  function saveCompletedIds(ids) {
    const clean = Array.from(new Set(ids.map(Number).filter(n => LESSONS.some(l => l.id === n)))).sort((a, b) => a - b);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (e) {}
    return clean;
  }

  function resetToDefaults() {
    return saveCompletedIds(DEFAULT_COMPLETED);
  }

  function toggleLessonCompleted(id) {
    const current = getCompletedIds();
    const idx = current.indexOf(id);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    return saveCompletedIds(current);
  }

  function getCurrentFilename() {
    const path = (window.location.pathname || '').split('/').pop() || '';
    return path === '' ? 'index.html' : path;
  }

  function getCurrentLessonId() {
    const file = getCurrentFilename();
    if (file === 'archiv.html') return null;
    const found = LESSONS.find(l => l.file === file);
    return found ? found.id : null;
  }

  function isArchiveCollapsed() {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setArchiveCollapsed(val) {
    try {
      localStorage.setItem(COLLAPSE_KEY, val ? '1' : '0');
    } catch (e) {}
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderNav() {
    const nav = document.querySelector('nav[aria-label="Lektionsübersicht"]');
    if (!nav) return;

    const completedIds = getCompletedIds();
    const currentId = getCurrentLessonId();
    const isArchivePage = getCurrentFilename() === 'archiv.html';

    const activeLessons = LESSONS.filter(l => !completedIds.includes(l.id));
    const archivedLessons = LESSONS.filter(l => completedIds.includes(l.id));
    const pct = Math.round((archivedLessons.length / LESSONS.length) * 100);
    const collapsed = isArchiveCollapsed();

    const activeHtml = activeLessons.length
      ? activeLessons.map(l => {
          const isCurrent = l.id === currentId;
          const cls = isCurrent
            ? 'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border bg-[#009ee3] text-white border-[#009ee3] font-bold shadow-sm'
            : 'flex items-center gap-1.5 px-2.5 py-2 rounded-lg border bg-white/10 hover:bg-white/20 text-blue-100 border-white/15 transition';
          const badgeCls = isCurrent ? 'bg-white/20' : 'bg-white/10';
          return `<a href="${l.file}" class="${cls}">
            <span class="w-5 h-5 rounded-full ${badgeCls} flex items-center justify-center text-[10px] shrink-0">${l.id}</span>
            <span class="truncate">${escapeHtml(l.shortTitle)}</span>
          </a>`;
        }).join('\n')
      : `<div class="col-span-full text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 rounded-lg px-3 py-2">🎉 Всички теми са маркирани като направени и обединени в архива!</div>`;

    const archiveChipsHtml = archivedLessons.length
      ? archivedLessons.map(l => {
          const isCurrent = l.id === currentId;
          const cls = isCurrent
            ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-emerald-500 text-white border-emerald-400 font-bold shadow-sm text-[11px]'
            : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-100 border-emerald-400/30 transition text-[11px]';
          return `<a href="${l.file}" class="${cls}" title="Направена тема (отвори урока)">
            <span class="text-emerald-300 font-bold">✓</span>
            <span class="font-bold">${l.id}.</span>
            <span>${escapeHtml(l.shortTitle)}</span>
          </a>`;
        }).join('\n')
      : `<span class="text-[11px] text-blue-300/80 italic">Все още няма архивирани теми.</span>`;

    const archiveLinkCls = isArchivePage
      ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400 text-slate-900 font-bold text-[11px] shadow-sm'
      : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/90 hover:bg-amber-300 text-slate-900 font-bold text-[11px] shadow-sm transition';

    nav.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div class="text-[11px] uppercase tracking-wider text-blue-200 font-bold flex items-center gap-2">
          <span>🎓</span> <span>Активни теми (${activeLessons.length}) • Deutsch (B1 ➔ B1+)</span>
          <span class="hidden sm:inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-emerald-200">
            Прогрес: ${archivedLessons.length}/${LESSONS.length} (${pct}%)
          </span>
        </div>
        <div class="flex items-center gap-2">
          <a href="archiv.html" class="${archiveLinkCls}">
            <span>📦</span> <span>Обединен архив (${archivedLessons.length})</span>
          </a>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 text-xs">
        ${activeHtml}
      </div>
      <div class="mt-2.5 pt-2 border-t border-white/10">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <button type="button" id="toggle-archive-strip-btn" class="text-[11px] text-emerald-200 hover:text-white font-semibold flex items-center gap-1.5 transition">
            <span>📦</span>
            <span>Архивирани / Направени теми (${archivedLessons.length})</span>
            <span class="text-blue-300 text-[10px]">${collapsed ? '▼ Покажи' : '▲ Скрий'}</span>
          </button>
          <span class="text-[10px] text-blue-300/80 hidden sm:inline">Кликнете върху подчертана дума в текста за превод</span>
        </div>
        <div id="archive-strip-list" class="${collapsed ? 'hidden ' : ''}flex flex-wrap items-center gap-1.5 mt-2">
          ${archiveChipsHtml}
        </div>
      </div>
    `;

    const stripBtn = document.getElementById('toggle-archive-strip-btn');
    if (stripBtn) {
      stripBtn.addEventListener('click', function () {
        setArchiveCollapsed(!isArchiveCollapsed());
        renderNav();
      });
    }
  }

  function renderHeaderCompletionButton() {
    const currentId = getCurrentLessonId();
    if (!currentId) return;
    const header = document.querySelector('header');
    if (!header) return;
    const topRow = header.querySelector('.flex');
    if (!topRow) return;

    let btn = document.getElementById('lesson-archive-toggle-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'lesson-archive-toggle-btn';
      btn.type = 'button';
      topRow.appendChild(btn);
      btn.addEventListener('click', function () {
        toggleLessonCompleted(currentId);
        renderAll();
      });
    }

    const isDone = getCompletedIds().includes(currentId);
    if (isDone) {
      btn.className = 'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition cursor-pointer';
      btn.innerHTML = '<span>✓</span> <span>Направена • В архив (Върни в активни)</span>';
      btn.title = 'Кликнете, за да върнете темата в активните уроци';
    } else {
      btn.className = 'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/15 hover:bg-emerald-500 text-white border border-white/25 hover:border-emerald-400 shadow-sm transition cursor-pointer';
      btn.innerHTML = '<span>☐</span> <span>Маркирай като направена (В архив)</span>';
      btn.title = 'Кликнете, за да преместите темата в архива на направените теми';
    }
  }

  function renderFooterArchiveState() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const completedIds = getCompletedIds();
    const currentId = getCurrentLessonId();
    const linksWrap = footer.querySelector('div');
    if (!linksWrap) return;

    const items = LESSONS.map(l => {
      const done = completedIds.includes(l.id);
      const mark = done ? '✓ ' : '';
      if (l.id === currentId) {
        return `<a href="${l.file}" class="text-slate-900 underline font-bold">${mark}${escapeHtml(l.title)}</a>`;
      }
      if (done) {
        return `<a href="${l.file}" class="text-emerald-700 hover:underline font-semibold">${mark}${escapeHtml(l.title)}</a>`;
      }
      return `<a href="${l.file}" class="text-[#009ee3] hover:underline">${escapeHtml(l.title)}</a>`;
    });

    const archiveItem = `<a href="archiv.html" class="text-amber-700 hover:underline font-bold">📦 Обединен архив (${completedIds.length})</a>`;
    linksWrap.innerHTML = items.concat([archiveItem]).join('\n<span>•</span>\n');
  }

  function renderAll() {
    renderNav();
    renderHeaderCompletionButton();
    renderFooterArchiveState();
    if (typeof window.onCourseProgressUpdated === 'function') {
      window.onCourseProgressUpdated(getCompletedIds());
    }
  }

  window.CourseProgress = {
    LESSONS: LESSONS,
    DEFAULT_COMPLETED: DEFAULT_COMPLETED,
    getCompletedIds: getCompletedIds,
    saveCompletedIds: saveCompletedIds,
    toggleLessonCompleted: toggleLessonCompleted,
    resetToDefaults: resetToDefaults,
    renderAll: renderAll
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
})();
