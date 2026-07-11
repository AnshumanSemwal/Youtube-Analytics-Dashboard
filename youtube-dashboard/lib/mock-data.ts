// Mock data for the public demo page.
// Dates are generated dynamically so "Last 28 days" always shows data.
// Values are hardcoded to look realistic for a K-drama YouTube channel.

export const MOCK_CHANNEL = {
    title:           "KdramaReality",
    handle:          "@kdramareality",
    subscriberCount: "14800",
    totalViews:      "2847293",
    totalVideos:     "124",
  };
  
  export const MOCK_VIDEOS = [
    { id: "v01", videoId: "mock_v01", title: "Crash Landing on You — Every Scene That Made Us Cry",           views: 283490, likes: 5278, comments: 412, publishedAt: "2024-12-15" },
    { id: "v02", videoId: "mock_v02", title: "Vincenzo — The Most Satisfying Villain Ending Ever",            views: 195230, likes: 4102, comments: 318, publishedAt: "2024-11-28" },
    { id: "v03", videoId: "mock_v03", title: "My Mister — The Kdrama That Changed Me Forever",               views: 156780, likes: 3890, comments: 502, publishedAt: "2024-10-12" },
    { id: "v04", videoId: "mock_v04", title: "Alchemy of Souls — Mind-Blowing Plot Twists Explained",        views: 134560, likes: 2940, comments: 276, publishedAt: "2024-09-05" },
    { id: "v05", videoId: "mock_v05", title: "Twenty Five Twenty One — The Ending That Broke Us All",        views: 128900, likes: 3450, comments: 891, publishedAt: "2024-08-20" },
    { id: "v06", videoId: "mock_v06", title: "Business Proposal — Funniest Moments Compilation",             views: 112340, likes: 2780, comments: 234, publishedAt: "2024-07-14" },
    { id: "v07", videoId: "mock_v07", title: "Goblin — Why This OST Still Hits Different in 2024",           views: 98760,  likes: 2310, comments: 198, publishedAt: "2024-06-30" },
    { id: "v08", videoId: "mock_v08", title: "Queen of Tears — I Was Not Prepared For This",                 views: 87430,  likes: 1980, comments: 312, publishedAt: "2024-06-10" },
    { id: "v09", videoId: "mock_v09", title: "Lovely Runner — Every Episode Left Me Screaming",              views: 76540,  likes: 1870, comments: 267, publishedAt: "2024-05-22" },
    { id: "v10", videoId: "mock_v10", title: "My Love From the Star — Still Perfect After 10 Years",         views: 68920,  likes: 1650, comments: 189, publishedAt: "2024-04-15" },
    { id: "v11", videoId: "mock_v11", title: "Hospital Playlist — The Friendships We All Want",              views: 61340,  likes: 1540, comments: 223, publishedAt: "2024-03-28" },
    { id: "v12", videoId: "mock_v12", title: "Flower of Evil — Hidden Clues You Missed on First Watch",      views: 54780,  likes: 1320, comments: 178, publishedAt: "2024-03-05" },
    { id: "v13", videoId: "mock_v13", title: "Hometown Cha-Cha-Cha Will Make You Cry Every Episode",         views: 49230,  likes: 1240, comments: 156, publishedAt: "2024-02-18" },
    { id: "v14", videoId: "mock_v14", title: "Signal — The Time Travel Logic Fully Explained",               views: 43560,  likes: 1080, comments: 134, publishedAt: "2024-02-01" },
    { id: "v15", videoId: "mock_v15", title: "It's Okay to Not Be Okay — Most Powerful Scenes",              views: 38970,  likes:  980, comments: 167, publishedAt: "2024-01-15" },
    { id: "v16", videoId: "mock_v16", title: "Reply 1988 — Why It's The Greatest Kdrama of All Time",        views: 34210,  likes:  870, comments: 201, publishedAt: "2023-12-20" },
    { id: "v17", videoId: "mock_v17", title: "Misaeng — The Most Realistic Work Drama Ever Made",            views: 29840,  likes:  760, comments: 112, publishedAt: "2023-12-05" },
    { id: "v18", videoId: "mock_v18", title: "Pachinko — A Show That Transcends the Genre",                  views: 25430,  likes:  650, comments: 98,  publishedAt: "2023-11-12" },
    { id: "v19", videoId: "mock_v19", title: "Moon Lovers — The Tragedy That Haunts Us Still",               views: 21780,  likes:  590, comments: 87,  publishedAt: "2023-10-28" },
    { id: "v20", videoId: "mock_v20", title: "Strong Woman Bong-soon — Rewatching in 2024",                  views: 18340,  likes:  480, comments: 76,  publishedAt: "2023-10-05" },
  ];
  
  // Raw view counts for 90 days — realistic variation with a few spikes
  const RAW_VIEWS = [
    820, 890, 760, 940, 1020, 870, 1340, 920, 880, 790,
    1050, 980, 860, 1120, 950, 1280, 890, 920, 1460, 870,
    940, 1020, 880, 760, 890, 1100, 970, 850, 920, 1050,
    780, 860, 1200, 940, 1020, 890, 870, 1380, 920, 860,
    1050, 930, 880, 760, 1020, 940, 890, 1140, 870, 980,
    1020, 860, 920, 1050, 870, 1420, 940, 890, 1020, 870,
    860, 980, 1100, 920, 870, 1020, 940, 860, 780, 920,
    1050, 880, 960, 1020, 870, 940, 1280, 890, 920, 1050,
    870, 980, 940, 860, 1020, 920, 890, 1140, 870, 940,
  ];
  
  // Watch time in minutes (~4 min average view duration)
  const RAW_WATCHTIME = RAW_VIEWS.map((v) => Math.round(v * 4.2));
  
  /**
   * Returns daily metrics for the last `days` days.
   * Dates are dynamically generated so the demo always has current data.
   */
  export function getMockMetrics(days: number) {
    const startIdx = 90 - days;
  
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
  
      const idx = startIdx + i;
      const views     = RAW_VIEWS[idx]     ?? 900;
      const watchMins = RAW_WATCHTIME[idx] ?? 3780;
  
      return {
        date:      date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        views,
        watchTime: Math.round((watchMins / 60) * 10) / 10,
      };
    });
  }