---
"next-sidebars": patch
---

Catch up on changes missed while a sidebar was hidden inside React's `<Activity>`. `<Activity>` disconnects effects but keeps state, so a hidden subscriber missed writes from other tabs and from this one, and could reveal showing the state from before it was hidden. The provider now re-reads localStorage when it regains its first subscriber, and notifies each listener as it subscribes.
