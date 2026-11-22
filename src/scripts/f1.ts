/**
 * F1 頁的即時資料（Jolpica F1 API，免金鑰、允許跨網域）。
 * 每個 API 回應在 sessionStorage 快取 10 分鐘；同時最多 2 個請求，避免超過 API 的速率限制。
 */
import type { F1Media } from '../utils/f1Media';

const API = 'https://api.jolpi.ca/ergast/f1/current';
const CACHE_MS = 10 * 60 * 1000;

interface Config {
    favorites: string[];
    timeZone: string;
    teamColors: Record<string, string>;
    media: F1Media;
}

interface Driver { driverId: string; givenName: string; familyName: string; code?: string; permanentNumber?: string }
interface Constructor { constructorId: string; name: string }
interface Session { date: string; time?: string }
interface Result {
    position: string;
    points?: string;
    status?: string;
    Driver: Driver;
    Constructor: Constructor;
    Time?: { time: string };
    Q1?: string;
    Q2?: string;
    Q3?: string;
}
interface Race {
    season: string;
    round: string;
    raceName: string;
    date: string;
    time?: string;
    Circuit: { circuitId: string; circuitName: string; Location: { locality: string; country: string } };
    FirstPractice?: Session;
    SecondPractice?: Session;
    ThirdPractice?: Session;
    SprintQualifying?: Session;
    Sprint?: Session;
    Qualifying?: Session;
    Results?: Result[];
    QualifyingResults?: Result[];
    SprintResults?: Result[];
}
interface DriverStanding { position: string; points: string; wins: string; Driver: Driver; Constructors: Constructor[] }
interface TeamStanding { position: string; points: string; wins: string; Constructor: Constructor }

/* ---------------- 工具 ---------------- */
let cfg: Config;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const fullName = (d: Driver) => `${d.givenName} ${d.familyName}`;
const teamColor = (id?: string) => (id && cfg.teamColors[id]) || '#8a8a93';
const isFav = (id: string) => cfg.favorites.includes(id);
const toDate = (s: Session) => new Date(`${s.date}T${s.time ?? '00:00:00Z'}`);
const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleString('zh-TW', { timeZone: cfg.timeZone, ...opts });
const fmtSession = (d: Date) => fmt(d, { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
const fmtDay = (d: Date) => fmt(d, { month: 'numeric', day: 'numeric' });

// 同時最多 2 個請求
let active = 0;
const queue: (() => void)[] = [];
const slot = () =>
    new Promise<void>((resolve) => {
        if (active < 2) {
            active++;
            resolve();
        } else queue.push(() => { active++; resolve(); });
    });
const release = () => {
    active--;
    queue.shift()?.();
};

async function api<T = any>(path: string): Promise<T> {
    const key = `f1:${path}`;
    try {
        const hit = JSON.parse(sessionStorage.getItem(key) ?? 'null');
        if (hit && Date.now() - hit.t < CACHE_MS) return hit.d;
    } catch { /* 沒有快取 */ }
    await slot();
    try {
        // 以 . 開頭的路徑直接接在 /current 後面（例如 .json），其餘當作子路徑
        const res = await fetch(path.startsWith('.') ? `${API}${path}` : `${API}/${path}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()).MRData;
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch { /* 空間不足就算了 */ }
        return data;
    } finally {
        release();
    }
}

/** 一列排名：名次｜色條｜（頭像）名字＋隊名｜數值 */
function row(opts: { pos: string; title: string; sub?: string; teamId?: string; value?: string; driverId?: string }) {
    const li = document.createElement('li');
    li.className = 'f1-row';
    li.style.setProperty('--team', teamColor(opts.teamId));
    if (opts.driverId && isFav(opts.driverId)) li.classList.add('is-fav');
    const photo = opts.driverId ? cfg.media.drivers[opts.driverId] : undefined;
    li.innerHTML = `
        <span class="f1-row-pos">${esc(opts.pos)}</span>
        <span class="f1-row-bar" aria-hidden="true"></span>
        ${photo ? `<img class="f1-row-photo" src="${esc(photo.src)}" alt="" loading="lazy" decoding="async">` : ''}
        <span class="f1-row-name">${esc(opts.title)}${opts.sub ? `<small>${esc(opts.sub)}</small>` : ''}</span>
        ${opts.value ? `<span class="f1-row-value">${esc(opts.value)}</span>` : ''}`;
    return li;
}

/* ---------------- 下一站 ---------------- */
function countdown(el: HTMLElement, target: Date) {
    const tick = () => {
        const diff = target.getTime() - Date.now();
        if (diff <= 0) {
            el.innerHTML = '<p class="f1-live">比賽進行中 / 剛結束</p>';
            return;
        }
        const parts: [number, string][] = [
            [Math.floor(diff / 86400000), '天'],
            [Math.floor(diff / 3600000) % 24, '時'],
            [Math.floor(diff / 60000) % 60, '分'],
            [Math.floor(diff / 1000) % 60, '秒'],
        ];
        el.innerHTML = parts.map(([n, u]) => `<span><strong>${String(n).padStart(2, '0')}</strong><small>${u}</small></span>`).join('');
        setTimeout(tick, 1000);
    };
    tick();
}

function renderNext(root: HTMLElement, race: Race | undefined) {
    const q = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector<T>(s)!;
    if (!race) {
        q('[data-next-name]').textContent = '本季已經結束，明年見！';
        return;
    }
    q('[data-next-round]').textContent = `Round ${race.round}`;
    q('[data-next-name]').textContent = race.raceName;
    q('[data-next-place]').textContent = `${race.Circuit.circuitName} · ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`;
    countdown(q('[data-next-countdown]'), toDate({ date: race.date, time: race.time }));

    const map = cfg.media.circuits[race.Circuit.circuitId];
    if (map) {
        const fig = q('[data-next-circuit]');
        const img = fig.querySelector('img')!;
        img.src = map.src;
        img.alt = `${race.Circuit.circuitName} 賽道圖`;
        fig.hidden = false;
    }

    const sessions: [string, Session | undefined][] = [
        ['FP1', race.FirstPractice],
        ['FP2', race.SecondPractice],
        ['FP3', race.ThirdPractice],
        ['衝刺排位', race.SprintQualifying],
        ['衝刺賽', race.Sprint],
        ['排位賽', race.Qualifying],
        ['正賽', { date: race.date, time: race.time }],
    ];
    q('[data-next-sessions]').innerHTML = sessions
        .filter((s): s is [string, Session] => !!s[1])
        .map(([name, s]) => `<li><span>${name}</span><time>${fmtSession(toDate(s))}</time></li>`)
        .join('');
}

/* ---------------- 支持的車手 ---------------- */
function renderFavorites(root: HTMLElement, standings: DriverStanding[], last: Race | undefined) {
    for (const id of cfg.favorites) {
        const card = root.querySelector<HTMLElement>(`[data-fav="${CSS.escape(id)}"]`);
        if (!card) continue;
        const s = standings.find((x) => x.Driver.driverId === id);
        const team = s?.Constructors[0];
        card.style.setProperty('--team', teamColor(team?.constructorId));
        const set = (sel: string, v: string) => {
            const el = card.querySelector(sel);
            if (el) el.textContent = v;
        };
        set('[data-fav-team]', team?.name ?? '本季未出賽');
        set('[data-fav-pos]', s ? `P${s.position}` : '—');
        set('[data-fav-pts]', s?.points ?? '—');
        set('[data-fav-wins]', s?.wins ?? '—');
        const r = last?.Results?.find((x) => x.Driver.driverId === id);
        // 完賽或被套圈都算有名次，其他狀態（退賽、未起跑…）顯示 DNF
        const finished = !r?.status || /Finished|Lap/i.test(r.status);
        set('[data-fav-last]', r ? (finished ? `P${r.position}` : 'DNF') : '—');
    }
}

/* ---------------- 積分榜 ---------------- */
function renderStandings(root: HTMLElement, drivers: DriverStanding[], teams: TeamStanding[]) {
    const d = root.querySelector<HTMLElement>('[data-standings="drivers"]')!;
    const t = root.querySelector<HTMLElement>('[data-standings="teams"]')!;
    d.replaceChildren(
        ...drivers.map((s) =>
            row({ pos: s.position, title: fullName(s.Driver), sub: s.Constructors[0]?.name, teamId: s.Constructors[0]?.constructorId, value: s.points, driverId: s.Driver.driverId }),
        ),
    );
    t.replaceChildren(
        ...teams.map((s) => row({ pos: s.position, title: s.Constructor.name, teamId: s.Constructor.constructorId, value: s.points })),
    );

    const tabs = root.querySelectorAll<HTMLButtonElement>('[data-tab]');
    tabs.forEach((btn) =>
        btn.addEventListener('click', () => {
            tabs.forEach((b) => {
                const on = b === btn;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-selected', String(on));
            });
            d.hidden = btn.dataset.tab !== 'drivers';
            t.hidden = btn.dataset.tab !== 'teams';
        }),
    );
}

/* ---------------- 整季賽程 ---------------- */
const resultValue = (r: Result, kind: 'race' | 'quali' | 'sprint') => {
    if (kind === 'quali') return r.Q3 || r.Q2 || r.Q1 || '';
    if (r.Time?.time) return r.Time.time;
    return r.status ?? '';
};

async function loadResults(body: HTMLElement, round: string, hasSprint: boolean) {
    const kinds: { key: 'race' | 'quali' | 'sprint'; label: string; path: string; field: keyof Race }[] = [
        { key: 'race', label: '正賽', path: `${round}/results.json?limit=30`, field: 'Results' },
        { key: 'quali', label: '排位', path: `${round}/qualifying.json?limit=30`, field: 'QualifyingResults' },
        ...(hasSprint ? [{ key: 'sprint' as const, label: '衝刺賽', path: `${round}/sprint.json?limit=30`, field: 'SprintResults' as keyof Race }] : []),
    ];

    const tabs = document.createElement('div');
    tabs.className = 'f1-tabs f1-tabs--small';
    const list = document.createElement('ol');
    list.className = 'f1-table';
    body.replaceChildren(tabs, list);

    const show = async (i: number) => {
        tabs.querySelectorAll('button').forEach((b, j) => {
            b.classList.toggle('is-active', i === j);
            b.setAttribute('aria-pressed', String(i === j));
        });
        list.innerHTML = '<li class="f1-muted">讀取中…</li>';
        try {
            const k = kinds[i];
            const data = await api(k.path);
            const results = (data.RaceTable.Races[0]?.[k.field] as Result[] | undefined) ?? [];
            if (results.length === 0) {
                list.innerHTML = '<li class="f1-muted">沒有資料</li>';
                return;
            }
            list.replaceChildren(
                ...results.map((r) =>
                    row({
                        pos: r.position,
                        title: fullName(r.Driver),
                        sub: r.Constructor.name,
                        teamId: r.Constructor.constructorId,
                        value: resultValue(r, k.key),
                        driverId: r.Driver.driverId,
                    }),
                ),
            );
        } catch {
            list.innerHTML = '<li class="f1-muted">讀取失敗，稍後再試</li>';
        }
    };

    kinds.forEach((k, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = k.label;
        b.addEventListener('click', () => show(i));
        tabs.append(b);
    });
    show(0);
}

function renderCalendar(root: HTMLElement, races: Race[], winners: Race[], nextRound?: string) {
    const host = root.querySelector<HTMLElement>('[data-calendar]')!;
    const winnerOf = new Map(winners.map((r) => [r.round, r.Results?.[0]]));
    host.replaceChildren(
        ...races.map((race) => {
            const winner = winnerOf.get(race.round);
            const done = !!winner;
            const isNext = race.round === nextRound;
            const el = document.createElement(done ? 'details' : 'div');
            el.className = 'f1-race-row';
            if (isNext) el.classList.add('is-next');
            if (winner) el.style.setProperty('--team', teamColor(winner.Constructor.constructorId));

            const status = done
                ? `<span class="f1-badge f1-badge--done${isFav(winner!.Driver.driverId) ? ' is-fav' : ''}"><span class="material-symbols-outlined" aria-label="冠軍">emoji_events</span>${esc(winner!.Driver.code ?? winner!.Driver.familyName)}</span>`
                : isNext
                  ? '<span class="f1-badge f1-badge--next">下一站</span>'
                  : '<span class="f1-badge">未開始</span>';
            const head = `
                <span class="f1-race-round">R${race.round}</span>
                <span class="f1-race-name">${esc(race.raceName)}<small>${esc(race.Circuit.Location.locality)}, ${esc(race.Circuit.Location.country)}${race.Sprint ? ' · 衝刺週末' : ''}</small></span>
                <time class="f1-race-date">${fmtDay(toDate({ date: race.date, time: race.time }))}</time>
                ${status}`;

            if (!done) {
                el.innerHTML = head;
                return el;
            }
            el.innerHTML = `<summary>${head}<span class="material-symbols-outlined f1-race-arrow" aria-hidden="true">expand_more</span></summary><div class="f1-race-body"></div>`;
            const body = el.querySelector<HTMLElement>('.f1-race-body')!;
            let loaded = false;
            el.addEventListener('toggle', () => {
                if ((el as HTMLDetailsElement).open && !loaded) {
                    loaded = true;
                    loadResults(body, race.round, !!race.Sprint);
                }
            });
            return el;
        }),
    );
}

/* ---------------- 進入點 ---------------- */
export async function initF1() {
    const root = document.querySelector<HTMLElement>('[data-f1-root]');
    const raw = document.getElementById('f1-config')?.textContent;
    if (!root || !raw) return;
    cfg = JSON.parse(raw);

    // 下一站與積分先載入（畫面上方），賽程表接著載入
    const nextP = api('next.json');
    const driversP = api('driverStandings.json?limit=40');
    const teamsP = api('constructorStandings.json?limit=20');
    const lastP = api('last/results.json?limit=30');
    const scheduleP = api('.json?limit=40'); // = /current.json，整季賽程
    const winnersP = api('results/1.json?limit=40');

    try {
        const next: Race | undefined = (await nextP).RaceTable.Races[0];
        renderNext(root, next);

        const [drivers, teams, last] = await Promise.all([driversP, teamsP, lastP]);
        const driverList: DriverStanding[] = drivers.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
        const teamList: TeamStanding[] = teams.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];
        renderFavorites(root, driverList, last.RaceTable.Races[0]);
        renderStandings(root, driverList, teamList);
        root.querySelector<HTMLElement>('[data-standings-status]')!.hidden = true;

        const [schedule, winners] = await Promise.all([scheduleP, winnersP]);
        renderCalendar(root, schedule.RaceTable.Races, winners.RaceTable.Races, next?.round);
        document.dispatchEvent(new CustomEvent('layout:changed'));
    } catch {
        root.querySelectorAll<HTMLElement>('.f1-status').forEach((el) => {
            el.hidden = false;
            el.textContent = 'F1 資料暫時抓不到，等等再重新整理看看。';
        });
    }
}
