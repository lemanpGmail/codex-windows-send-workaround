Title: Windows send stuck before turn/start: pending codex-home queries block composer

Build: OpenAI.Codex 26.917.8451.0, internal 26.917.62051.

First message receives a response. Later sends spin on Send with text still in
the composer and no turn/start dispatched. Similar symptoms were reported on two
PCs; runtime diagnosis was performed on only one. Web works. Reinstallation,
reset and selecting an explicit project did not resolve the symptom.

Observed renderer state:
- localWorkspaceMaterialization = loading
- isLocalConfigPending = true
- ["vscode","codex-home"] stays pending/fetching
- ["vscode","codex-home","{\"hostId\":\"local\"}"] stays pending/fetching
- dependent managed-worktree-state query is disabled (codex-home-loading)

A fresh codex-home call through the same renderer/native bridge returns immediately.
Cancelling and refetching only these exact pending local queries resolves the
composer state. Two consecutive UI replies were verified, followed by another
pair after restart with a launcher that repeats this targeted retry.

The initial unresolved-promise cause is unknown. A startup race or response loss
is a hypothesis, not a confirmed finding. No signed files, credentials, history,
projects, agent permissions or Windows security settings were changed.

The workaround uses a temporary loopback Electron inspector and internal React
Query state. It is unofficial and version-dependent, not a permanent upstream fix.
The portable distribution has not been validated on the second PC.
