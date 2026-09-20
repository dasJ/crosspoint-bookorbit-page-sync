# BookOrbit page sync plugin for Crosspoint Reader

This plugin - inspired by [crosspoint-bookorbit-plugin](https://github.com/samfoy/crosspoint-bookorbit-plugin) provides page sync for [Crosspoint Reader](https://crosspointreader.com/) against a [BookOrbit](https://bookorbit.app/) KOReader sync endpoint.
This information is rendered in BookOrbit in the "Reading Log" tab of books and is supposed to also fill out streaks and achievements automatically.

This plugin only syncs stats to BookOrbit. It does not replace the the KOReader Sync that syncs the current reading location bi-directionally.

## State

At the time of writing, plugin support in Crosspoint Reader is work in progress ([PR here](https://github.com/crosspoint-reader/crosspoint-reader/pull/3114)).
But even with that PR merged, this plugin also requires the sessions API which is part of [this PR](https://github.com/crosspoint-reader/crosspoint-reader/pull/3204).
Until both PRs are merged and released, a custom Crosspoint Reader build with these two PRs is required.

## Installation/Update

Either clone the repository or use the green button on the top-right to download a ZIP of this repository and extract it.
Copy the `bookorbit-page-sync` directory to your SD card into `.crosspoint/plugins` so that `device.json` is found at `.crosspoint/plugins/bookorbit-page-sync/device.json`.
Updating is just extracting the same files at the same location. Be carefule to not overwrite `.crosspoint/plugins/bookorbit-page-sync/config.json` or you need to set up the plugin again.

Configuration can be done in the web interface under "Settings".
