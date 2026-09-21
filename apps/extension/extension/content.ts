import {
  ApiResult,
  AskResponse,
  BackgroundMessage,
  CompanyResearch,
  JobsResponse,
  StorySearchResponse,
} from '../src/contracts';
import { betonCompanySlug, companyNamesMatch, decodeLeetText, escapeHtml, researchSlugForBeton, slugFromCompanyUrl, trucareerCandidateSlug, trucareerCompanyId } from '../src/text';

const SUPPORT_URL = 'https://www.supportkori.com/montasim';
const B4JOIN_URL = 'https://b4joinacompany.netlify.app';
const send = <T>(payload: BackgroundMessage): Promise<T> =>
  chrome.runtime.sendMessage(payload) as Promise<T>;

const api = async <T>(
  request: Extract<BackgroundMessage, { type: 'api' }>['request'],
): Promise<T> => {
  const result = await send<ApiResult<T>>({ type: 'api', request });
  if (!result.ok || result.data === undefined) {
    throw new Error(result.error || 'The research API did not return data.');
  }
  return result.data;
};

const icon = (paths: string): string =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
const brandIcon = `
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <path d="M8 7.5h10.5a5.5 5.5 0 0 1 0 11H13"></path>
    <path d="M8 7.5v17M8 24.5h8"></path>
    <path d="m20 22 2.5 2.5L27 19"></path>
  </svg>`;
const searchIcon = icon(
  '<circle cx="11" cy="11" r="6"></circle><path d="m16 16 4 4"></path>',
);
const triggerLogo = `<img src="${chrome.runtime.getURL('media/logo-32.png')}" alt="" />`;
const externalIcon = icon(
  '<path d="M14 5h5v5"></path><path d="m19 5-8 8"></path><path d="M17 13v6H5V7h6"></path>',
);
const heartIcon = icon(
  '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path>',
);
const chevronIcon = icon('<path d="m9 6 6 6-6 6"></path>');

const renderAnswerInline = (
  value: string,
  citations: AskResponse['citations'],
): string => {
  const byId = new Map(citations.map((citation) => [citation.id, citation]));
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(S\d+)\]/g, (token, id: string) => {
      const citation = byId.get(id);
      return citation
        ? `<a class="ml-inline-citation" href="${escapeHtml(citation.url)}" target="_blank" rel="noreferrer" title="${escapeHtml(citation.title)}">${token}</a>`
        : token;
    });
};

const renderAnswerText = (
  value: string,
  citations: AskResponse['citations'],
): string => {
  const blocks: string[] = [];
  let listType: 'ol' | 'ul' | undefined;
  let items: string[] = [];
  const flushList = () => {
    if (!listType || !items.length) return;
    blocks.push(
      `<${listType}>${items.map((item) => `<li>${item}</li>`).join('')}</${listType}>`,
    );
    listType = undefined;
    items = [];
  };

  value.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      return;
    }
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const nextType = unordered ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      items.push(renderAnswerInline((unordered || ordered)?.[1] || '', citations));
      return;
    }
    flushList();
    const heading = line.match(/^#{1,4}\s+(.+)$/);
    blocks.push(
      heading
        ? `<h4>${renderAnswerInline(heading[1] || line, citations)}</h4>`
        : `<p>${renderAnswerInline(line, citations)}</p>`,
    );
  });
  flushList();
  return blocks.join('');
};

interface Identity {
  slug: string;
  sourceName: string;
  element: HTMLElement;
  trigger: HTMLButtonElement;
}

class ResearchPanel {
  private readonly root: HTMLElement;
  private readonly panel: HTMLElement;
  private readonly backdrop: HTMLElement;
  private active?: Identity;
  private company: CompanyResearch | undefined;
  private jobs: JobsResponse | undefined;
  private consentedToAiRetention = false;
  private requestVersion = 0;
  private storyVersion = 0;
  private askVersion = 0;
  private storyTimer?: number;

  constructor() {
    this.root = document.createElement('div');
    this.root.dataset.mlUi = 'research-root';
    this.root.innerHTML = `
      <div class="ml-backdrop" data-backdrop hidden></div>
      <aside class="ml-panel" data-panel role="dialog" aria-modal="true" aria-labelledby="ml-panel-company" aria-hidden="true">
        <header class="ml-panel-header">
          <div class="ml-extension-mark">${brandIcon}</div>
          <div class="ml-panel-title"><span>Inside view</span><h2 id="ml-panel-company">Company</h2></div>
          <div class="ml-header-actions">
            <a class="ml-support" href="${SUPPORT_URL}" target="_blank" rel="noreferrer" aria-label="Support this project">${heartIcon}<span class="ml-visually-hidden">Support</span></a>
            <button class="ml-icon-button" data-close type="button" aria-label="Close company research">${icon('<path d="m6 6 12 12M18 6 6 18"></path>')}</button>
          </div>
        </header>
        <nav class="ml-nav" role="tablist" aria-label="Company research">
          <button class="is-active" data-tab="brief" type="button" role="tab" aria-controls="ml-view-brief">Insights</button>
          <button data-tab="jobs" type="button" role="tab" aria-controls="ml-view-jobs">Pay &amp; roles</button>
          <button data-tab="stories" type="button" role="tab" aria-controls="ml-view-stories">Stories</button>
        </nav>
        <div class="ml-scroll" data-scroll>
          <section class="ml-view is-active" id="ml-view-brief" data-view="brief" role="tabpanel"></section>
          <section class="ml-view" id="ml-view-jobs" data-view="jobs" role="tabpanel" hidden></section>
          <section class="ml-view" id="ml-view-stories" data-view="stories" role="tabpanel" hidden></section>
          <section class="ml-view" id="ml-view-ask" data-view="ask" role="tabpanel" hidden></section>
        </div>
        <footer class="ml-footer"><span><i></i><b data-snapshot>Loading published evidence</b></span><nav><a href="#" data-sources>Sources</a><a href="${B4JOIN_URL}" target="_blank" rel="noreferrer">Open b4join ↗</a></nav></footer>
      </aside>`;
    document.body.append(this.root);
    this.panel = this.required('[data-panel]');
    this.backdrop = this.required('[data-backdrop]');
    this.bind();
  }

  private required<T extends Element = HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing Research Panel element: ${selector}`);
    return element;
  }

  async open(identity: Identity) {
    this.requestVersion += 1;
    const version = this.requestVersion;
    this.storyVersion += 1;
    this.askVersion += 1;
    this.active = identity;
    this.company = undefined;
    this.jobs = undefined;
    try {
      this.consentedToAiRetention = (await send<boolean>({ type: 'consent:get' })) === true;
    } catch {
      this.consentedToAiRetention = false;
    }
    if (version !== this.requestVersion) return;
    this.required<HTMLElement>('#ml-panel-company').textContent =
      decodeLeetText(identity.sourceName || 'Company', identity.slug);
    this.select('brief');
    this.renderLoading();
    this.panel.classList.add('is-open');
    this.panel.setAttribute('aria-hidden', 'false');
    this.backdrop.hidden = false;
    requestAnimationFrame(() => this.backdrop.classList.add('is-open'));
    identity.trigger.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('ml-research-open');
    this.required<HTMLButtonElement>('[data-close]').focus();

    void api<CompanyResearch>({
      method: 'GET',
      path: `/company?slug=${encodeURIComponent(identity.slug)}`,
    }).then((company) => {
      if (version !== this.requestVersion) return;
      this.company = company;
      this.required<HTMLElement>('#ml-panel-company').textContent = decodeLeetText(company.name, company.slug);
      this.required<HTMLElement>('[data-snapshot]').textContent = `Evidence updated ${company.snapshotDate}`;
      this.renderBrief(company);
    }, (error) => {
      if (version !== this.requestVersion) return;
      this.required<HTMLElement>('[data-snapshot]').textContent = 'Research unavailable';
      this.renderError('brief', error);
    });
    void api<StorySearchResponse>({
      method: 'GET',
      path: `/stories?company=${encodeURIComponent(identity.slug)}&limit=20`,
    }).then((stories) => {
      if (version === this.requestVersion) this.renderStories(stories);
    }, (error) => {
      if (version === this.requestVersion) this.renderError('stories', error);
    });
    void api<JobsResponse>({
      method: 'GET',
      path: `/jobs?company=${encodeURIComponent(identity.slug)}`,
    }).then((jobs) => {
      if (version !== this.requestVersion) return;
      this.jobs = jobs;
      this.renderJobs(jobs);
      if (this.company) this.renderBrief(this.company);
    }, (error) => {
      if (version === this.requestVersion) this.renderError('jobs', error);
    });
  }

  close() {
    this.requestVersion += 1;
    this.storyVersion += 1;
    this.askVersion += 1;
    window.clearTimeout(this.storyTimer);
    this.panel.classList.remove('is-open');
    this.panel.setAttribute('aria-hidden', 'true');
    this.backdrop.classList.remove('is-open');
    document.documentElement.classList.remove('ml-research-open');
    this.active?.trigger.setAttribute('aria-expanded', 'false');
    this.active?.trigger.focus();
    window.setTimeout(() => {
      if (!this.panel.classList.contains('is-open')) this.backdrop.hidden = true;
    }, 220);
  }

  private bind() {
    this.required('[data-close]').addEventListener('click', () => this.close());
    this.backdrop.addEventListener('click', () => this.close());
    this.root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) =>
      button.addEventListener('click', () => this.select(button.dataset.tab || 'brief')),
    );
    this.required('[role="tablist"]').addEventListener('keydown', (event) => {
      const key = (event as KeyboardEvent).key;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
      const tabs = [...this.root.querySelectorAll<HTMLButtonElement>('[data-tab]')];
      const selected = tabs.findIndex((tab) => tab.classList.contains('is-active'));
      const next = key === 'Home' ? 0 : key === 'End' ? tabs.length - 1
        : (selected + (key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      const target = tabs[next];
      if (!target) return;
      event.preventDefault();
      this.select(target.dataset.tab || 'brief');
      target.focus();
    });
    this.required('[data-sources]').addEventListener('click', (event) => {
      event.preventDefault();
      this.select('brief');
      const sources = this.root.querySelector<HTMLDetailsElement>('[data-link-list]');
      if (sources) {
        sources.open = true;
        sources.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    document.addEventListener('keydown', (event) => {
      if (!this.panel.classList.contains('is-open')) return;
      if (event.key === 'Escape') this.close();
      if (event.key === 'Tab') this.trapFocus(event);
    });
  }

  private select(view: string) {
    this.panel.classList.toggle('is-asking', view === 'ask');
    this.root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
      const selected = button.dataset.tab === view;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    this.root.querySelectorAll<HTMLElement>('[data-view]').forEach((section) => {
      section.hidden = section.dataset.view !== view;
      section.classList.toggle('is-active', !section.hidden);
    });
    this.required<HTMLElement>('[data-scroll]').scrollTop = 0;
  }

  private trapFocus(event: KeyboardEvent) {
    const focusable = [...this.panel.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])',
    )].filter((element) => !element.closest('[hidden]'));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private renderLoading() {
    (['brief', 'stories', 'jobs'] as const).forEach((view) => {
      this.required<HTMLElement>(`[data-view="${view}"]`).innerHTML =
        '<div class="ml-state" role="status"><span class="ml-spinner"></span><strong>Reading published reports</strong><p>Building a company-specific view from the available evidence.</p></div>';
    });
    this.required<HTMLElement>('[data-view="ask"]').innerHTML = '';
    this.required<HTMLElement>('[data-snapshot]').textContent = 'Loading published evidence';
  }

  private renderError(view: string, reason: unknown) {
    const message = reason instanceof Error ? reason.message : 'Research is unavailable.';
    this.required<HTMLElement>(`[data-view="${view}"]`).innerHTML = `
      <div class="ml-state ml-state--error" role="alert">
        <strong>This section is unavailable</strong>
        <p>${escapeHtml(message)}</p>
        <button class="ml-retry" type="button">Try again</button>
      </div>`;
    this.required<HTMLElement>(`[data-view="${view}"]`).querySelector<HTMLButtonElement>('.ml-retry')
      ?.addEventListener('click', () => void this.retry(view));
  }

  private async retry(view: string) {
    if (!this.active) return;
    const version = this.requestVersion;
    const slug = this.active.slug;
    this.required<HTMLElement>(`[data-view="${view}"]`).innerHTML =
      '<div class="ml-state" role="status"><span class="ml-spinner"></span><strong>Trying again</strong></div>';
    try {
      if (view === 'brief') {
        const company = await api<CompanyResearch>({ method: 'GET', path: `/company?slug=${encodeURIComponent(slug)}` });
        if (version !== this.requestVersion) return;
        this.company = company;
        this.required<HTMLElement>('#ml-panel-company').textContent = decodeLeetText(company.name, company.slug);
        this.required<HTMLElement>('[data-snapshot]').textContent = `Evidence updated ${company.snapshotDate}`;
        this.renderBrief(company);
      } else if (view === 'stories') {
        const stories = await api<StorySearchResponse>({ method: 'GET', path: `/stories?company=${encodeURIComponent(slug)}&limit=20` });
        if (version === this.requestVersion) this.renderStories(stories);
      } else if (view === 'jobs') {
        const jobs = await api<JobsResponse>({ method: 'GET', path: `/jobs?company=${encodeURIComponent(slug)}` });
        if (version !== this.requestVersion) return;
        this.jobs = jobs;
        this.renderJobs(jobs);
        if (this.company) this.renderBrief(this.company);
      }
    } catch (error) {
      if (version === this.requestVersion) this.renderError(view, error);
    }
  }

  private openAsk(question = '') {
    this.renderAsk(question);
    this.select('ask');
    window.setTimeout(
      () => this.root.querySelector<HTMLTextAreaElement>('[data-question]')?.focus(),
      0,
    );
  }

  private bindInsightActions() {
    const view = this.required<HTMLElement>('[data-view="brief"]');
    view.querySelectorAll<HTMLButtonElement>('[data-jump]').forEach((button) =>
      button.addEventListener('click', () => this.select(button.dataset.jump || 'brief')),
    );
    view.querySelectorAll<HTMLButtonElement>('[data-evidence-question]').forEach((button) =>
      button.addEventListener('click', () =>
        this.openAsk(button.dataset.evidenceQuestion || ''),
      ),
    );
    view.querySelector<HTMLButtonElement>('[data-open-ask]')?.addEventListener(
      'click',
      () => this.openAsk(),
    );
  }

  private renderBrief(company: CompanyResearch) {
    const sentiment = company.metrics.sentiment;
    const totalStories = Math.max(company.metrics.stories, 1);
    const cultureHeadline =
      company.metrics.stories === 0
        ? 'No workplace story is available yet'
        : sentiment.negative > sentiment.positive &&
            sentiment.negative > sentiment.mixed
        ? 'Most published reports raise concerns'
        : sentiment.positive > sentiment.negative &&
            sentiment.positive > sentiment.mixed
          ? 'Most published reports are positive'
          : 'Published reports show mixed experiences';
    const cultureDetail =
      company.metrics.stories === 0
        ? 'No story mix to compare'
        : `${sentiment.positive} positive · ${sentiment.mixed} mixed · ${sentiment.negative} concerning`;

    const arrangement = company.workArrangement;
    const mode = arrangement?.workArrangement.reportedMode ?? 'unknown';
    const modeLabel =
      !arrangement || mode === 'unknown'
        ? 'No clear work setup reported'
        : mode === 'mixed'
          ? 'Conflicting work setups reported'
          : `${mode[0]?.toUpperCase()}${mode.slice(1)} work reported`;
    const workDetails = arrangement
      ? [
          arrangement.reportedSchedule.workdaysPerWeek[0]
            ? `${arrangement.reportedSchedule.workdaysPerWeek[0].minimum === arrangement.reportedSchedule.workdaysPerWeek[0].maximum ? arrangement.reportedSchedule.workdaysPerWeek[0].minimum : `${arrangement.reportedSchedule.workdaysPerWeek[0].minimum}–${arrangement.reportedSchedule.workdaysPerWeek[0].maximum}`} days/week mentioned`
            : '',
          arrangement.reportedSchedule.overtimeEvidenceCount
            ? `${arrangement.reportedSchedule.overtimeEvidenceCount} overtime mentions`
            : '',
          arrangement.reportedSchedule.flexibleEvidenceCount
            ? `${arrangement.reportedSchedule.flexibleEvidenceCount} flexibility mentions`
            : '',
        ].filter(Boolean)
      : [];

    const salaryRoles = this.jobs?.salary.roles.length ?? 0;
    const payHeadline = !this.jobs
      ? 'Salary data is unavailable'
      : salaryRoles
        ? `${salaryRoles} community-reported role range${salaryRoles === 1 ? '' : 's'}`
        : 'No reported salary range';
    const payDetail = this.jobs
      ? this.jobs.salary.summary
      : 'Open Pay & roles to check the available evidence.';

    const questionMarkup = (question: NonNullable<CompanyResearch['questions']>[number]) => `
      <button class="ml-question-card" type="button" data-evidence-question="${escapeHtml(question.title)}">
        <span><strong>${escapeHtml(question.title)}</strong><small>${escapeHtml(question.guidance)}</small></span>
        ${chevronIcon}
      </button>`;
    const questions = company.questions || [];
    const primaryQuestions = questions.slice(0, 3).map(questionMarkup).join('');
    const moreQuestions = questions.slice(3).map(questionMarkup).join('');

    const links = company.links
      .map(
        (link) => `
          <a class="ml-source-link" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">
            <span>${escapeHtml(link.label)}</span>${externalIcon}
          </a>`,
      )
      .join('');

    const glassdoor =
      company.metrics.rating !== null || company.metrics.recommendPercent !== null
        ? `<p class="ml-context-line">Glassdoor context · ${company.metrics.rating === null ? 'rating unavailable' : `${company.metrics.rating}/5`} · ${company.metrics.recommendPercent === null ? 'recommendation unavailable' : `${company.metrics.recommendPercent}% recommend`}</p>`
        : '';

    this.required<HTMLElement>('[data-view="brief"]').innerHTML = `
      <section class="ml-intro">
        <h3>Start with the evidence for ${escapeHtml(decodeLeetText(company.name, company.slug))}.</h3>
        <p>Select Culture or Pay below to inspect details. This snapshot covers ${company.metrics.stories} workplace ${company.metrics.stories === 1 ? 'story' : 'stories'} through ${escapeHtml(company.snapshotDate)}; Deshi Mula may show newer reports.</p>
      </section>

      <section class="ml-inside-view" aria-labelledby="ml-inside-view-title">
        <div class="ml-inside-heading">
          <div><span>Decision scan</span><h3 id="ml-inside-view-title">The inside view</h3></div>
          <em>Not a verdict</em>
        </div>
        <div class="ml-signal-spine">
          <button class="ml-signal-row" type="button" data-jump="stories">
            <span class="ml-signal-key">Culture</span>
            <span class="ml-signal-copy">
              <strong>${escapeHtml(cultureHeadline)}</strong>
              <span class="ml-story-chart" aria-label="${escapeHtml(cultureDetail)}">
                <i class="is-positive" style="width:${(sentiment.positive / totalStories) * 100}%"></i>
                <i class="is-mixed" style="width:${(sentiment.mixed / totalStories) * 100}%"></i>
                <i class="is-concerning" style="width:${(sentiment.negative / totalStories) * 100}%"></i>
              </span>
              <small>${escapeHtml(cultureDetail)}</small>
            </span>
            ${chevronIcon}
          </button>
          <div class="ml-signal-row">
            <span class="ml-signal-key">Work</span>
            <span class="ml-signal-copy"><strong>${escapeHtml(modeLabel)}</strong><small>${escapeHtml(workDetails.join(' · ') || 'No schedule pattern was clear enough to summarize.')}</small></span>
          </div>
          <button class="ml-signal-row" type="button" data-jump="jobs">
            <span class="ml-signal-key">Pay</span>
            <span class="ml-signal-copy"><strong>${escapeHtml(payHeadline)}</strong><small>${escapeHtml(payDetail)}</small></span>
            ${chevronIcon}
          </button>
        </div>
        ${glassdoor}
      </section>

      <section class="ml-questions">
        <div class="ml-section-heading">
          <div><span>Interview prep</span><h3>Questions to verify</h3></div>
          <strong>${questions.length}</strong>
        </div>
        <p class="ml-section-copy">Search the published stories for clues, then confirm missing details with the company.</p>
        <div class="ml-question-list">
          ${primaryQuestions || '<p class="ml-empty-row">No repeated theme had enough evidence to create a company-specific question.</p>'}
          ${
            moreQuestions
              ? `<details class="ml-more-questions">
                  <summary>Show ${questions.length - 3} more ${questions.length - 3 === 1 ? 'question' : 'questions'}${chevronIcon}</summary>
                  <div>${moreQuestions}</div>
                </details>`
              : ''
          }
        </div>
        <button class="ml-primary ml-primary--wide" type="button" data-open-ask>
          <span>Ask your own question</span>${chevronIcon}
        </button>
      </section>

      <details class="ml-trust" data-link-list>
        <summary><span><strong>How to read this research</strong><small>Personal reports, dates, and source links</small></span>${chevronIcon}</summary>
        <div>
          <p>${escapeHtml(company.brief.disclaimer)}</p>
          <nav aria-label="Company sources">${links || '<span class="ml-empty-row">No source links are available.</span>'}</nav>
        </div>
      </details>`;
    this.bindInsightActions();
  }

  private renderStories(response: StorySearchResponse) {
    const view = this.required<HTMLElement>('[data-view="stories"]');
    view.innerHTML = `
      <section class="ml-intro ml-intro--compact">
        <p class="ml-eyebrow">Published stories</p>
        <h3>Read the reports behind the insights.</h3>
        <p>Search by role or topic, then open any story on Deshi Mula for its full context and comments.</p>
      </section>
      <label class="ml-search">${searchIcon}<input data-story-search type="search" placeholder="Search role, topic, or phrase" /></label>
      <div class="ml-story-filters" aria-label="Filter stories"><button class="is-active" data-vibe="" type="button">All</button><button data-vibe="positive" type="button">Positive</button><button data-vibe="mixed" type="button">Mixed</button><button data-vibe="negative" type="button">Concerning</button></div>
      <div data-story-results></div>`;
    this.paintStories(response);
    view.querySelector<HTMLInputElement>('[data-story-search]')?.addEventListener(
      'input',
      () => this.scheduleStorySearch(),
    );
    view.querySelectorAll<HTMLButtonElement>('[data-vibe]').forEach((button) =>
      button.addEventListener('click', () => {
        view.querySelectorAll('[data-vibe]').forEach((item) => item.classList.remove('is-active'));
        button.classList.add('is-active');
        void this.searchStories();
      }),
    );
  }

  private paintStories(response: StorySearchResponse) {
    const target = this.required<HTMLElement>('[data-story-results]');
    if (!response.items.length) {
      target.innerHTML = '<div class="ml-state"><strong>No matching stories</strong><p>Try a shorter word or another vibe.</p></div>';
      return;
    }
    target.innerHTML = `
      <p class="ml-result-count">${response.total} matching ${response.total === 1 ? 'story' : 'stories'}</p>
      <div class="ml-story-list">${response.items
        .map((story) => {
          const vibeLabel = story.vibe === 'negative' ? 'concerning' : story.vibe;
          return `
          <a href="${escapeHtml(story.url)}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(story.title || 'Untitled story')}</strong>
            <span>${escapeHtml(story.role || 'Anonymous')} · ${escapeHtml(story.date || 'Date unavailable')}</span>
            <small><em class="ml-vibe ml-vibe--${escapeHtml(story.vibe)}">${escapeHtml(vibeLabel)}</em>${story.reactions} reactions · ${story.comments} comments</small>
            ${externalIcon}
          </a>`;
        })
        .join('')}</div>`;
  }

  private scheduleStorySearch() {
    this.storyVersion += 1;
    window.clearTimeout(this.storyTimer);
    this.storyTimer = window.setTimeout(() => void this.searchStories(), 260);
  }

  private async searchStories() {
    if (!this.active) return;
    const version = ++this.storyVersion;
    const companySlug = this.active.slug;
    const query =
      this.root.querySelector<HTMLInputElement>('[data-story-search]')?.value.trim() || '';
    const vibe =
      this.root.querySelector<HTMLButtonElement>('[data-vibe].is-active')?.dataset.vibe || '';
    const target = this.required<HTMLElement>('[data-story-results]');
    target.innerHTML = '<div class="ml-state"><span class="ml-spinner"></span><strong>Searching stories</strong></div>';
    try {
      const response = await api<StorySearchResponse>({
        method: 'GET',
        path: `/stories?company=${encodeURIComponent(companySlug)}&q=${encodeURIComponent(query)}&vibe=${encodeURIComponent(vibe)}&limit=30`,
      });
      if (version === this.storyVersion && this.active?.slug === companySlug) this.paintStories(response);
    } catch (error) {
      if (version === this.storyVersion) {
        target.innerHTML = `<div class="ml-state ml-state--error" role="alert"><strong>Search unavailable</strong><p>${escapeHtml(error instanceof Error ? error.message : String(error))}</p><button class="ml-retry" type="button">Try again</button></div>`;
        target.querySelector<HTMLButtonElement>('.ml-retry')?.addEventListener('click', () => void this.searchStories());
      }
    }
  }

  private renderJobs(response: JobsResponse) {
    const formatBdt = (value: number) =>
      `৳${new Intl.NumberFormat('en-BD', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value)}`;
    const salaryRoleItems = response.salary.roles || [];
    const maximumSalary = Math.max(
      ...salaryRoleItems.map((role) => role.maximumBdt),
      1,
    );
    const salaryRows = (
      roles: typeof salaryRoleItems,
      className = '',
    ) =>
      roles
        .map((role) => {
          const left = (role.minimumBdt / maximumSalary) * 100;
          const width = Math.max(
            ((role.maximumBdt - role.minimumBdt) / maximumSalary) * 100,
            2.5,
          );
          return `
            <article class="ml-range-row ${className}">
              <div class="ml-range-label">
                <strong>${escapeHtml(role.role)}</strong>
                <span>${escapeHtml(formatBdt(role.minimumBdt))}–${escapeHtml(formatBdt(role.maximumBdt))}</span>
              </div>
              <div class="ml-range-track" role="img" aria-label="${escapeHtml(role.role)} reported range ${escapeHtml(formatBdt(role.minimumBdt))} to ${escapeHtml(formatBdt(role.maximumBdt))}">
                <i style="left:${left}%;width:${width}%"></i>
              </div>
              <small>${role.sampleSize ? `${role.sampleSize.toLocaleString()} contributor${role.sampleSize === 1 ? '' : 's'}` : 'Contributor count unavailable'}${role.bonus ? ` · ${role.bonus.reportedCount}/${role.bonus.answeredCount} reported a bonus` : ''}</small>
            </article>`;
        })
        .join('');

    const primarySalaryRows = salaryRows(salaryRoleItems.slice(0, 6));
    const remainingSalaryRows = salaryRows(salaryRoleItems.slice(6), 'is-secondary');

    const specificJobs = response.jobs.filter(
      (job) =>
        !(
          response.careerUrl &&
          job.sourceUrl === response.careerUrl &&
          /career|opening/i.test(job.title)
        ),
    );
    const jobs = specificJobs.length
      ? specificJobs
          .map(
            (job) => `
              <a class="ml-job" href="${escapeHtml(job.sourceUrl)}" target="_blank" rel="noreferrer">
                <div><strong>${escapeHtml(job.title)}</strong><span>${escapeHtml(job.detail)}</span></div>
                <em>${escapeHtml(job.source)}</em>${externalIcon}
              </a>`,
          )
          .join('')
      : response.careerUrl
        ? `<a class="ml-career-cta" href="${escapeHtml(response.careerUrl)}" target="_blank" rel="noreferrer">
            <span><strong>Check current openings</strong><small>Open the company’s careers page</small></span>${externalIcon}
          </a>`
        : '<p class="ml-job-empty"><strong>No current opening found</strong><span>No sourced vacancy or careers page is available in this snapshot.</span></p>';

    const checkedAt = response.checkedAt
      ? new Intl.DateTimeFormat('en-BD', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(response.checkedAt))
      : 'Date unavailable';
    this.required<HTMLElement>('[data-view="jobs"]').innerHTML = `
      <section class="ml-intro ml-intro--compact">
        <p class="ml-eyebrow">Pay &amp; roles</p>
        <h3>Compare reported pay before you negotiate.</h3>
        <p>Community-submitted ranges are shown on one scale. Confirm the amount and pay period in writing.</p>
      </section>

      <section class="ml-pay-view">
        <div class="ml-section-heading">
          <div><span>Reported salary</span><h3>${escapeHtml(response.salary.label)}</h3></div>
          <strong>${salaryRoleItems.length} ${salaryRoleItems.length === 1 ? 'role' : 'roles'}</strong>
        </div>
        <p class="ml-section-copy">${escapeHtml(response.salary.summary)}</p>
        ${
          salaryRoleItems.length
            ? `<div class="ml-range-scale" aria-hidden="true"><span>৳0</span><i></i><span>${escapeHtml(formatBdt(maximumSalary))}</span></div>
              <div class="ml-range-chart">${primarySalaryRows}</div>
              ${
                remainingSalaryRows
                  ? `<details class="ml-more-ranges">
                      <summary>Show ${salaryRoleItems.length - 6} more ${salaryRoleItems.length - 6 === 1 ? 'role' : 'roles'}${chevronIcon}</summary>
                      <div class="ml-range-chart">${remainingSalaryRows}</div>
                    </details>`
                  : ''
              }`
            : '<div class="ml-empty-panel"><strong>No salary ranges yet</strong><p>The current dataset has no community-submitted pay evidence for this company.</p></div>'
        }
        <details class="ml-data-note">
          <summary>How to read these ranges${chevronIcon}</summary>
          <div>
            <p>${escapeHtml(response.salary.disclaimer || 'Salary evidence is not independently verified; confirm directly with the company.')}</p>
            ${response.salary.sourceUrl ? `<a href="${escapeHtml(response.salary.sourceUrl)}" target="_blank" rel="noreferrer">Open ${escapeHtml(response.salary.source || 'salary source')} ${externalIcon}</a>` : ''}
          </div>
        </details>
      </section>

      <section class="ml-openings">
        <div class="ml-section-heading">
          <div><span>Hiring now</span><h3>Current openings</h3></div>
          <strong>Checked ${escapeHtml(checkedAt)}</strong>
        </div>
        <div class="ml-job-card">${jobs}</div>
      </section>`;
  }

  private renderAsk(prefill = '') {
    const companyName = decodeLeetText(
      this.company?.name || this.active?.sourceName || 'this company',
      this.active?.slug,
    );
    const consented = this.consentedToAiRetention;
    const storyCount = this.company?.metrics.stories ?? 0;
    this.required<HTMLElement>('[data-view="ask"]').innerHTML = `
      <button class="ml-back" type="button" data-ask-back>${icon('<path d="m15 18-6-6 6-6"></path>')}<span>Back to insights</span></button>
      <section class="ml-intro ml-intro--ask">
        <p class="ml-eyebrow">Ask the evidence</p>
        <h3>What do you want to know about ${escapeHtml(companyName)}?</h3>
        <p>Search ${storyCount || 'the available'} published ${storyCount === 1 ? 'story' : 'stories'} and comments. Some questions may have no answer in the available reports.</p>
      </section>
      <form class="ml-ask-form" data-ask-form>
        <label for="ml-research-question">Question to verify</label>
        <textarea id="ml-research-question" data-question rows="4" maxlength="800" placeholder="Example: How often is overtime mentioned?" aria-label="Ask about ${escapeHtml(companyName)}">${escapeHtml(prefill)}</textarea>
        ${consented ? '' : `<label class="ml-consent"><input data-consent type="checkbox" /><span>I agree b4join may keep my question, cited excerpts, answer, and anonymous installation ID indefinitely.</span></label>`}
        <button class="ml-primary ml-primary--wide" type="submit"><span>Search company evidence</span>${chevronIcon}</button>
      </form>
      <div data-answer></div>
    `;
    const view = this.required<HTMLElement>('[data-view="ask"]');
    view.querySelector<HTMLButtonElement>('[data-ask-back]')?.addEventListener(
      'click',
      () => this.select('brief'),
    );
    view.querySelector<HTMLFormElement>('[data-ask-form]')?.addEventListener(
      'submit',
      (event) => void this.ask(event),
    );
  }

  private async ask(event: SubmitEvent) {
    event.preventDefault();
    if (!this.active) return;
    const version = ++this.askVersion;
    const companySlug = this.active.slug;
    const form = event.currentTarget as HTMLFormElement;
    const question = form.querySelector<HTMLTextAreaElement>('[data-question]')?.value.trim() || '';
    const consent = form.querySelector<HTMLInputElement>('[data-consent]');
    const answer = this.required<HTMLElement>('[data-answer]');
    if (question.length < 3) {
      answer.innerHTML = '<p class="ml-inline-error">Enter a specific question first.</p>';
      return;
    }
    if (consent && !consent.checked) {
      answer.innerHTML = '<p class="ml-inline-error">Confirm the storage choice before searching the evidence.</p>';
      return;
    }
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) button.disabled = true;
    answer.innerHTML = '<div class="ml-state"><span class="ml-spinner"></span><strong>Reading the evidence</strong><p>This can take a few seconds.</p></div>';
    try {
      if (consent) {
        const saved = await send<boolean>({ type: 'consent:set', consented: true });
        if (saved !== true) throw new Error('Could not save your storage choice. Try again.');
        this.consentedToAiRetention = true;
      }
      if (version !== this.askVersion) return;
      const response = await api<AskResponse>({
        method: 'POST',
        path: '/ask',
        body: { company: companySlug, question },
      });
      if (version !== this.askVersion || this.active?.slug !== companySlug) return;
      answer.innerHTML = `
        <article class="ml-answer">
          <div class="ml-source-label"><span>Answer from published reports</span><em>${response.citations.length} ${response.citations.length === 1 ? 'source' : 'sources'}</em></div>
          <div class="ml-answer-copy">${renderAnswerText(response.answer, response.citations)}</div>
          <div class="ml-citations">${response.citations
            .map(
              (citation) => `<a href="${escapeHtml(citation.url)}" target="_blank" rel="noreferrer" title="${escapeHtml(citation.title)}">[${escapeHtml(citation.id)}] <span>${escapeHtml(citation.title)}</span></a>`,
            )
            .join('')}</div>
          <small>This summarizes personal reports. Open the cited stories before drawing a conclusion.</small>
        </article>`;
      consent?.closest('.ml-consent')?.remove();
    } catch (error) {
      if (version === this.askVersion) answer.innerHTML = `<div class="ml-state ml-state--error"><strong>Ask could not complete</strong><p>${escapeHtml(error instanceof Error ? error.message : String(error))}</p></div>`;
    } finally {
      if (button) button.disabled = false;
    }
  }
}

let panel: ResearchPanel;
const identities = new Map<string, Identity[]>();
let scanTimer: number | undefined;
let profileIdentity: Identity | undefined;
const currentProfileIdentity = () => profileIdentity;
const betonVerified = new Map<string, boolean>();
const isBeton = ['betonkemon.com', 'www.betonkemon.com'].includes(location.hostname);
const isTrucareer = ['trucareer.co', 'www.trucareer.co'].includes(location.hostname);
const trucareerResolved = new Map<string, string | null>();
const trucareerPending = new Map<string, Promise<string | null>>();

const positionTrucareerButtons = () => {
  for (const items of identities.values()) for (const identity of items) {
    if (!identity.trigger.classList.contains('ml-research-trigger--trucareer-listing')) continue;
    if (!identity.element.isConnected) {
      identity.trigger.remove();
      continue;
    }
    const row = identity.element.closest('a');
    if (!row) continue;
    const name = identity.element.getBoundingClientRect();
    const bounds = row.getBoundingClientRect();
    const narrow = bounds.width < 700;
    const left = narrow || name.right + 170 > bounds.right
      ? bounds.right - 174 : name.right + 12;
    const top = narrow || name.right + 170 > bounds.right
      ? bounds.bottom - 40 : name.top - 7;
    identity.trigger.style.left = `${Math.max(bounds.left + 12, left)}px`;
    identity.trigger.style.top = `${top}px`;
    identity.trigger.hidden = bounds.bottom < 0 || bounds.top > innerHeight;
  }
};

const makeTrigger = (identity: Identity) => {
  const trigger = identity.trigger;
  trigger.type = 'button';
  trigger.className = 'ml-research-trigger';
  trigger.dataset.mlUi = 'trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `${triggerLogo}<span>MulaLens Analytics</span>`;
  trigger.addEventListener('click', (event) => {
    if (!event.isTrusted) return;
    event.preventDefault();
    event.stopPropagation();
    void panel.open(identity);
  });
};

const verifyBetonSlugs = async (slugs: string[]): Promise<Set<string>> => {
  const unknown = [...new Set(slugs)].filter((slug) => !betonVerified.has(slug));
  if (unknown.length) {
    const response = await api<{ items: CompanyResearch[] }>({
      method: 'GET',
      path: `/companies?slugs=${encodeURIComponent(unknown.join(','))}`,
    });
    const returned = new Set(response.items.map((company) => company.slug));
    unknown.forEach((slug) => betonVerified.set(slug, returned.has(slug)));
  }
  return new Set(slugs.filter((slug) => betonVerified.get(slug)));
};

const resolveTrucareerName = (name: string): Promise<string | null> => {
  const key = name.normalize('NFKC').trim();
  if (trucareerResolved.has(key)) return Promise.resolve(trucareerResolved.get(key) ?? null);
  const pending = trucareerPending.get(key);
  if (pending) return pending;
  const slug = trucareerCandidateSlug(key);
  if (!slug) return Promise.resolve(null);
  const request = api<{ items: CompanyResearch[] }>({
    method: 'GET',
    path: `/companies?slugs=${encodeURIComponent(slug)}`,
  }).then(({ items }) => {
    const match = items.find((company) => company.slug === slug &&
      (companyNamesMatch(key, company.name) || companyNamesMatch(key, company.sourceName)));
    const resolved = match?.slug ?? null;
    trucareerResolved.set(key, resolved);
    return resolved;
  }).finally(() => { trucareerPending.delete(key); });
  trucareerPending.set(key, request);
  return request;
};

const discoverTrucareerProfile = async (): Promise<Identity | undefined> => {
  const pageId = trucareerCompanyId(location.href);
  const heading = document.querySelector<HTMLElement>('main h1');
  if (!pageId || !heading) {
    profileIdentity?.trigger.remove();
    profileIdentity = undefined;
    return undefined;
  }
  const sourceName = heading.textContent?.trim() ?? '';
  if (profileIdentity?.element === heading && profileIdentity.sourceName === sourceName && profileIdentity.trigger.isConnected) return profileIdentity;
  profileIdentity?.trigger.remove();
  profileIdentity = undefined;
  let slug: string | null;
  try { slug = await resolveTrucareerName(sourceName); } catch { return undefined; }
  if (!slug || trucareerCompanyId(location.href) !== pageId || !heading.isConnected || heading.textContent?.trim() !== sourceName) return undefined;
  const current = currentProfileIdentity();
  if (current?.element === heading && current.trigger.isConnected) return current;
  const identity: Identity = { slug, sourceName, element: heading, trigger: document.createElement('button') };
  makeTrigger(identity);
  identity.trigger.classList.add('ml-research-trigger--trucareer-profile');
  heading.insertAdjacentElement('afterend', identity.trigger);
  profileIdentity = identity;
  return identity;
};

const discoverTrucareerListings = async () => {
  if (!['/', '/companies', '/companies/'].includes(location.pathname)) return;
  const candidates = [...document.querySelectorAll<HTMLAnchorElement>('main a[href*="/company/"]')]
    .map((anchor) => ({ anchor, pageId: trucareerCompanyId(anchor.href), name: anchor.querySelector<HTMLElement>('span.truncate.font-semibold') }))
    .filter((item): item is { anchor: HTMLAnchorElement; pageId: string; name: HTMLElement } =>
      Boolean(item.pageId && item.name && !item.name.dataset.mlCompanySlug && !item.anchor.closest('[data-ml-ui]')));
  await Promise.all(candidates.map(async ({ anchor, name, pageId }) => {
    const sourceName = name.textContent?.trim() ?? '';
    let slug: string | null;
    try { slug = await resolveTrucareerName(sourceName); } catch { return; }
    if (!slug || !anchor.isConnected || !name.isConnected || name.dataset.mlCompanySlug ||
      name.textContent?.trim() !== sourceName || trucareerCompanyId(anchor.href) !== pageId ||
      !['/', '/companies', '/companies/'].includes(location.pathname)) return;
    const identity: Identity = { slug, sourceName, element: name, trigger: document.createElement('button') };
    makeTrigger(identity);
    identity.trigger.classList.add('ml-research-trigger--trucareer-listing');
    document.body.append(identity.trigger);
    anchor.dataset.mlTrucareer = 'matched';
    name.dataset.mlCompanySlug = slug;
    const existing = identities.get(slug) || [];
    existing.push(identity);
    identities.set(slug, existing);
    positionTrucareerButtons();
  }));
};

const nameElementFor = (anchor: HTMLAnchorElement): HTMLElement | null => {
  const anchorText = anchor.textContent?.trim();
  if (anchorText && anchorText.length < 120) return anchor;

  const siblingName = [...(anchor.parentElement?.children ?? [])].find(
    (candidate): candidate is HTMLElement =>
      candidate instanceof HTMLElement &&
      candidate !== anchor &&
      candidate.tagName === 'SPAN' &&
      Boolean(candidate.textContent?.trim()),
  );
  if (siblingName) return siblingName;

  return (
    anchor.closest('article,section,li,div')?.querySelector<HTMLElement>('h1,h2,h3,h4,h5') ??
    null
  );
};

const discover = (): Identity[] => {
  const found: Identity[] = [];
  document.querySelectorAll<HTMLAnchorElement>('a[href*="/companies/"]').forEach((anchor) => {
    if (anchor.closest('[data-ml-ui]')) return;
    const slug = slugFromCompanyUrl(anchor.href);
    const element = nameElementFor(anchor);
    if (!slug || !element || element.dataset.mlCompanySlug) return;
    const sourceName = element.textContent?.trim() || slug;
    const displayName = decodeLeetText(sourceName, slug);
    element.dataset.mlCompanySlug = slug;
    element.dataset.mlSourceName = sourceName;
    if (element.childElementCount === 0) element.textContent = displayName;
    if (displayName !== sourceName) {
      element.title = `Originally shown as ${sourceName}`;
    }
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'ml-research-trigger';
    trigger.dataset.mlUi = 'trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `${triggerLogo}<span>MulaLens Analytics</span>`;
    const identity: Identity = {
      slug,
      sourceName,
      element,
      trigger,
    };
    trigger.addEventListener('click', (event) => {
      if (!event.isTrusted) return;
      event.preventDefault();
      event.stopPropagation();
      void panel.open(identity);
    });
    const storyHeader = element.closest<HTMLElement>('.flex.items-start.justify-between');
    const rightControls = storyHeader?.children[1];
    if (rightControls instanceof HTMLElement && rightControls.classList.contains('md:flex')) {
      trigger.classList.add('ml-research-trigger--card-end');
      rightControls.insertAdjacentElement('beforebegin', trigger);
    } else {
      element.insertAdjacentElement('afterend', trigger);
    }
    found.push(identity);
  });
  return found;
};

const discoverProfile = () => {
  const slug = location.pathname.match(/^\/companies\/([^/]+)\/?$/)?.[1];
  const heading = document.querySelector<HTMLElement>('main h1, h1');
  if (!slug || !heading) {
    profileIdentity = undefined;
    return;
  }
  if (profileIdentity?.slug === slug && profileIdentity.element === heading) return;
  profileIdentity?.trigger.remove();
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'ml-research-trigger';
  trigger.dataset.mlUi = 'trigger';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `${triggerLogo}<span>MulaLens Analytics</span>`;
  profileIdentity = { slug, sourceName: heading.textContent?.trim() || slug, element: heading, trigger };
  trigger.addEventListener('click', () => {
    if (profileIdentity) void panel.open(profileIdentity);
  });
  heading.insertAdjacentElement('afterend', trigger);
};

const discoverBetonProfile = async (): Promise<Identity | undefined> => {
  const pageSlug = betonCompanySlug(location.href);
  const heading = document.querySelector<HTMLElement>('main h1, h1');
  if (!pageSlug || !heading) {
    profileIdentity?.trigger.remove();
    profileIdentity = undefined;
    return undefined;
  }
  const slug = researchSlugForBeton(pageSlug);
  const current = currentProfileIdentity();
  if (current?.slug === slug && current.element === heading && current.trigger.isConnected) return current;
  profileIdentity?.trigger.remove();
  profileIdentity = undefined;
  let verified: Set<string>;
  try {
    verified = await verifyBetonSlugs([slug]);
  } catch {
    return undefined;
  }
  if (!verified.has(slug) || betonCompanySlug(location.href) !== pageSlug || !heading.isConnected) return undefined;
  const resolved = currentProfileIdentity();
  if (resolved?.slug === slug && resolved.element === heading && resolved.trigger.isConnected) return resolved;
  const identity: Identity = { slug, sourceName: heading.textContent?.trim() || pageSlug, element: heading, trigger: document.createElement('button') };
  makeTrigger(identity);
  identity.trigger.classList.add('ml-research-trigger--beton-profile');
  const header = heading.closest('section')?.previousElementSibling;
  if (header instanceof HTMLElement && header.tagName === 'HEADER') header.append(identity.trigger);
  else heading.insertAdjacentElement('afterend', identity.trigger);
  profileIdentity = identity;
  return identity;
};

const discoverBetonDirectory = async () => {
  const candidates = [...document.querySelectorAll<HTMLAnchorElement>('li > a[href*="/c/"]')]
    .map((anchor) => ({ anchor, pageSlug: betonCompanySlug(anchor.href), name: anchor.querySelector<HTMLElement>('div.truncate') }))
    .filter((item): item is { anchor: HTMLAnchorElement; pageSlug: string; name: HTMLElement } => Boolean(item.pageSlug && item.name && !item.name.dataset.mlCompanySlug));
  if (!candidates.length) return;
  const slugs = candidates.map(({ pageSlug }) => researchSlugForBeton(pageSlug));
  let verified: Set<string>;
  try {
    verified = await verifyBetonSlugs(slugs);
  } catch {
    return;
  }
  candidates.forEach(({ anchor, pageSlug, name }) => {
    const slug = researchSlugForBeton(pageSlug);
    if (!verified.has(slug) || !name.isConnected || name.dataset.mlCompanySlug) return;
    const identity: Identity = { slug, sourceName: name.textContent?.trim() || pageSlug, element: name, trigger: document.createElement('button') };
    makeTrigger(identity);
    name.dataset.mlCompanySlug = slug;
    const row = anchor.parentElement;
    if (!row || row.tagName !== 'LI') return;
    row.classList.add('ml-beton-directory-row');
    identity.trigger.classList.add('ml-research-trigger--beton-directory');
    row.append(identity.trigger);
    const existing = identities.get(slug) || [];
    existing.push(identity);
    identities.set(slug, existing);
  });
};

const hydrate = async (found: Identity[]) => {
  found.forEach((identity) => {
    const existing = (identities.get(identity.slug) || []).filter((item) => item.element.isConnected);
    existing.push(identity);
    identities.set(identity.slug, existing);
  });
  const slugs = [...new Set(found.map((identity) => identity.slug))];
  if (!slugs.length) return;
  try {
    const response = await api<{ items: CompanyResearch[] }>({
      method: 'GET',
      path: `/companies?slugs=${encodeURIComponent(slugs.join(','))}`,
    });
    response.items.forEach((company) => {
      (identities.get(company.slug) || []).forEach((identity) => {
        if (identity.element.isConnected && identity.element.childElementCount === 0) {
          identity.element.textContent = decodeLeetText(company.name, company.slug);
        }
        identity.element.title =
          company.name === company.sourceName
            ? ''
            : `Originally shown as ${company.sourceName}`;
      });
    });
  } catch {
    // The trigger remains useful and opens a specific recoverable API state.
  }
};

const scan = () => {
  for (const [slug, items] of identities) {
    const current = items.filter((item) => item.element.isConnected);
    items.filter((item) => !item.element.isConnected).forEach((item) => item.trigger.remove());
    if (current.length) identities.set(slug, current);
    else identities.delete(slug);
  }
  if (isBeton) {
    void discoverBetonProfile();
    void discoverBetonDirectory();
  } else if (isTrucareer) {
    void discoverTrucareerProfile();
    void discoverTrucareerListings();
    positionTrucareerButtons();
  } else {
    discoverProfile();
    void hydrate(discover());
  }
};
const scheduleScan = () => {
  if (scanTimer !== undefined) return;
  scanTimer = window.setTimeout(() => {
    scanTimer = undefined;
    scan();
  }, 100);
};

const initialize = () => {
  panel = new ResearchPanel();
  chrome.runtime.onMessage.addListener((message: { type?: string }, _sender, sendResponse) => {
    if (message.type !== 'panel:open-current') return;
    if (isBeton) {
      void discoverBetonProfile().then((identity) => {
        if (identity) {
          void panel.open(identity);
          sendResponse({ ok: true });
        } else sendResponse({ ok: false, reason: 'not-found' });
      });
      return true;
    }
    if (isTrucareer) {
      void discoverTrucareerProfile().then((identity) => {
        if (identity) {
          void panel.open(identity);
          sendResponse({ ok: true });
        } else sendResponse({ ok: false, reason: 'not-found' });
      });
      return true;
    }
    discoverProfile();
    if (profileIdentity) {
      void panel.open(profileIdentity);
      sendResponse({ ok: true });
    } else {
      sendResponse({ ok: false });
    }
  });
  scan();
  if (isTrucareer) {
    window.addEventListener('scroll', positionTrucareerButtons, { passive: true });
    window.addEventListener('resize', positionTrucareerButtons);
  }
  new MutationObserver((mutations) => {
    if (
      mutations.some(
        (mutation) =>
          !(mutation.target instanceof Element && mutation.target.closest('[data-ml-ui]')),
      )
    ) {
      scheduleScan();
    }
  }).observe(document.body, { childList: true, subtree: true });
};

initialize();
