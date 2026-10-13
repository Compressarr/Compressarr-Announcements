# Compressarr Announcements

Short news items from the [Compressarr](https://github.com/Compressarr/Compressarr) project: upcoming changes, beta releases,
catalog releases, things worth knowing. Compressarr reads one file from this repository, `announcements.json`, and lights a small
bell in its top bar when there is a message from the last 30 days you have not seen.

## What Compressarr does with this

- It asks GitHub for `announcements.json` once when it starts and then about once a day. Nothing about you or your computer is
  sent - it is an ordinary download of a public file. GitHub can see your IP address, as with any download.
- It can be turned off: **Settings > Show announcements from the Compressarr project**. When it is off, Compressarr never asks.
- An announcement is **text and, at most, a link**. It cannot change a setting, install anything or run anything.
- Text is shown as plain text. A link is only clickable when it points at the Compressarr GitHub page or compressarr.tv.
- Offline or unreachable: nothing happens, and nothing is shown as an error.

## Posting an announcement (maintainers)

1. Add an entry to `announcements.json`.
2. Run `node validate.js` - it applies the same rules the app does.
3. Commit to `main`. That is the publish; no Compressarr release is needed.

```json
{
  "id": "2026-10-beta6",
  "date": "2026-10-14",
  "kind": "beta",
  "title": "Compressarr 2.2.0-beta.6 is out",
  "text": "Adds the preset catalog, the ffmpeg download channel and HDR guards. Beta builds are optional.",
  "link": "https://github.com/Compressarr/Compressarr/releases/tag/v2.2.0-beta.6",
  "important": false,
  "minAppVersion": null,
  "maxAppVersion": "2.2.0-beta.5",
  "expires": null
}
```

| Field | Meaning |
|---|---|
| `id` | Required. Unique and **never reused** - Compressarr remembers which ids a person has read |
| `date` | Required. `yyyy-mm-dd`. A message is shown for 30 days from this date |
| `title` | Required. Plain text, up to 120 characters |
| `text` | Optional. Plain text, up to 1,000 characters |
| `kind` | `release`, `beta`, `catalog` or `notice`. Shown as a small label |
| `link` | Optional. `https` to `github.com/Compressarr/...` or `compressarr.tv` (`github.com/MrWizardCT/...`, where the project used to live, is also accepted) |
| `important` | Optional. Listed first. It does not change how the bell behaves |
| `welcome` | Optional. Marks the welcome message: an install that has not read it yet shows it as new once, whenever it was posted, and it is not dropped after 30 days while unread. Only the newest message marked welcome counts. Use it for one message, not a series |
| `minAppVersion`, `maxAppVersion` | Optional, inclusive. Only versions in range see it. A pre-release is below its release: `2.2.0-beta.5` < `2.2.0` |
| `expires` | Optional. `yyyy-mm-dd`. Hidden after that date |

Limits: the file is at most 64 KB and the app reads at most 50 entries. An entry that breaks a rule is skipped on its own; it never
hides the others. `"schema": 1` is the file format - a newer format number makes older Compressarr versions ignore the file.

To correct a message, edit it before it has been widely seen, or publish a new entry with a new id. To withdraw one, set `expires`
to a past date.

A fresh Compressarr install treats everything dated before its first check as already read, so a new user is not greeted with a pile
of old news.
