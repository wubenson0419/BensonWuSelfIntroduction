/**
 * F1 頁（/f1，暫不放在選單）的設定。
 * 賽程、成績、積分都是即時從 Jolpica F1 API 抓的，不用手動更新。
 */

export interface F1Settings {
  /**
   * 支持的車手（Jolpica 的 driverId），會放在最上面的大卡片，
   * 並在積分榜與成績上標註。
   * driverId 可以到 https://api.jolpi.ca/ergast/f1/current/drivers.json 查。
   */
  favorites: string[];
  /** 時間顯示用的時區 */
  timeZone: string;
  /**
   * 車隊代表色（constructorId → 顏色），用在色條與標註。
   * 這些是近似色，不是官方色票；新車隊沒設定時會用灰色。
   */
  teamColors: Record<string, string>;
}

export const F1: F1Settings = {
  favorites: ["max_verstappen", "tsunoda"],
  timeZone: "Asia/Taipei",
  teamColors: {
    red_bull: "#3671C6",
    rb: "#6692FF",
    ferrari: "#E8002D",
    mercedes: "#27F4D2",
    mclaren: "#FF8000",
    aston_martin: "#229971",
    alpine: "#FF87BC",
    williams: "#64C4FF",
    haas: "#B6BABD",
    audi: "#F50537",
    sauber: "#52E252",
    cadillac: "#C8A85A",
  },
};
