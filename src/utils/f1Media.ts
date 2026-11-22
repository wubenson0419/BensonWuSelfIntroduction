/**
 * F1 頁用的圖片（建置時抓取）：車手照與賽道圖。
 *
 * 只使用 Wikipedia 條目的「自由授權」主圖（pageimages 預設只回傳自由授權圖片，
 * 實際檔案在 Wikimedia Commons），並一併取得作者與授權，頁面底部會標示來源。
 * 不下載、不放進倉庫，直接引用 Wikimedia 的圖片網址。
 * 網路失敗時回傳空物件，頁面會改用沒有圖片的版面，不會讓建置失敗。
 */

export interface MediaInfo {
  /** 縮圖網址 */
  src: string;
  /** Commons 檔案頁（標示來源用） */
  filePage: string;
  artist: string;
  license: string;
  licenseUrl: string;
  /** 對應的條目標題（車手或賽道名稱） */
  title: string;
}

export interface DriverInfo {
  name: string;
  code: string;
  number: string;
}

export interface F1Media {
  season: string;
  /** driverId → 名字等基本資料（給沒有 JS 時與圖片說明用） */
  driverInfo: Record<string, DriverInfo>;
  drivers: Record<string, MediaInfo>;
  circuits: Record<string, MediaInfo>;
}

const JOLPICA = 'https://api.jolpi.ca/ergast/f1/current';
const WIKI = 'https://en.wikipedia.org/w/api.php';
const COMMONS = 'https://commons.wikimedia.org/w/api.php';
// Wikimedia 要求 API 呼叫附上可識別的 User-Agent
const HEADERS = { 'User-Agent': 'BensonWuPersonalSite/1.0 (https://bhwu.pages.dev)' };

const titleFromUrl = (url: string) => decodeURIComponent(url.split('/wiki/')[1] ?? '').replace(/_/g, ' ');
const stripHtml = (s = '') => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const chunk = <T,>(arr: T[], n: number) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

/** 抓 JSON；網路偶爾不穩，失敗時最多重試 3 次 */
async function getJSON(url: string, tries = 3): Promise<any> {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return await res.json();
  } catch (err) {
    if (tries <= 1) throw err;
    await new Promise((r) => setTimeout(r, 800));
    return getJSON(url, tries - 1);
  }
}

/** 條目標題 → { 縮圖網址, Commons 檔名 } */
async function pageImages(titles: string[], size: number) {
  const out = new Map<string, { src: string; file: string }>();
  for (const group of chunk(titles, 50)) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      redirects: '1',
      prop: 'pageimages',
      piprop: 'thumbnail|name',
      pithumbsize: String(size),
      titles: group.join('|'),
    });
    const data = await getJSON(`${WIKI}?${params}`);
    // 轉址或正規化後的標題對回原本的標題
    const back = new Map<string, string>();
    for (const r of [...(data.query.normalized ?? []), ...(data.query.redirects ?? [])]) back.set(r.to, back.get(r.from) ?? r.from);
    for (const page of data.query.pages ?? []) {
      if (!page.thumbnail || !page.pageimage) continue;
      const src = String(page.thumbnail.source).split('?')[0];
      out.set(back.get(page.title) ?? page.title, { src, file: page.pageimage });
    }
  }
  return out;
}

/** Commons 檔名 → 作者 / 授權 */
async function licenses(files: string[]) {
  const out = new Map<string, { artist: string; license: string; licenseUrl: string }>();
  for (const group of chunk(files, 50)) {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      formatversion: '2',
      prop: 'imageinfo',
      iiprop: 'extmetadata',
      iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
      titles: group.map((f) => `File:${f}`).join('|'),
    });
    const data = await getJSON(`${COMMONS}?${params}`);
    const back = new Map<string, string>();
    for (const r of data.query.normalized ?? []) back.set(r.to, r.from);
    for (const page of data.query.pages ?? []) {
      const meta = page.imageinfo?.[0]?.extmetadata ?? {};
      const key = (back.get(page.title) ?? page.title).replace(/^File:/, '');
      out.set(key, {
        artist: stripHtml(meta.Artist?.value) || 'Unknown',
        license: stripHtml(meta.LicenseShortName?.value) || 'See file page',
        licenseUrl: meta.LicenseUrl?.value ?? '',
      });
    }
  }
  return out;
}

let cached: Promise<F1Media> | null = null;

export function getF1Media(): Promise<F1Media> {
  cached ??= (async () => {
    try {
      const [driversData, scheduleData] = await Promise.all([
        getJSON(`${JOLPICA}/drivers.json?limit=100`),
        getJSON(`${JOLPICA}.json?limit=100`),
      ]);
      const drivers: { driverId: string; url: string; givenName: string; familyName: string; code?: string; permanentNumber?: string }[] =
        driversData.MRData.DriverTable.Drivers;
      const races: { Circuit: { circuitId: string; url: string } }[] = scheduleData.MRData.RaceTable.Races;
      const circuits = [...new Map(races.map((r) => [r.Circuit.circuitId, r.Circuit])).values()];

      const driverTitles = new Map(drivers.map((d) => [d.driverId, titleFromUrl(d.url)]));
      const circuitTitles = new Map(circuits.map((c) => [c.circuitId, titleFromUrl(c.url)]));

      const [driverImgs, circuitImgs] = await Promise.all([
        pageImages([...driverTitles.values()], 400),
        pageImages([...circuitTitles.values()], 640),
      ]);
      const lic = await licenses([...new Set([...driverImgs.values(), ...circuitImgs.values()].map((i) => i.file))]);

      const build = (titles: Map<string, string>, imgs: Map<string, { src: string; file: string }>) => {
        const result: Record<string, MediaInfo> = {};
        for (const [id, title] of titles) {
          const img = imgs.get(title);
          const l = img && lic.get(img.file);
          if (!img || !l) continue;
          result[id] = {
            src: img.src,
            filePage: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(img.file.replace(/ /g, '_'))}`,
            title,
            ...l,
          };
        }
        return result;
      };

      const driverInfo: Record<string, DriverInfo> = {};
      for (const d of drivers) {
        driverInfo[d.driverId] = { name: `${d.givenName} ${d.familyName}`, code: d.code ?? '', number: d.permanentNumber ?? '' };
      }

      return {
        season: scheduleData.MRData.RaceTable.season ?? '',
        driverInfo,
        drivers: build(driverTitles, driverImgs),
        circuits: build(circuitTitles, circuitImgs),
      };
    } catch (err) {
      console.warn('[f1Media] 抓取圖片失敗，F1 頁將不顯示圖片：', err, (err as { cause?: unknown })?.cause);
      return { season: '', driverInfo: {}, drivers: {}, circuits: {} };
    }
  })();
  return cached;
}
