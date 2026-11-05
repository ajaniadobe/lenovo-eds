// delayed functionality: tag managers and other third-party scripts (loaded ~3s after load)
import('./martech.js').then((m) => m.loadTags());
