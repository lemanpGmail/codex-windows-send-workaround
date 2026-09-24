# Codex Windows: message stuck sending / spinning send button — workaround

**Unofficial, reversible workaround for OpenAI Codex Windows.** Targets a specific case where the first reply works, but the second message will not send: an infinite spinner on Send, a grey send arrow, and text remaining in the input while the web version works.

**Français :** contournement du deuxième message bloqué, bouton Envoyer grisé ou cercle qui tourne dans Codex Windows. [Instructions en français](#français).


## v0.2.0 — Startup handling (2026-09-24)

- Repeated clicks while a launcher is already running in the same extracted folder are ignored using a local `launcher.lock` file. The lock is removed on normal completion; a lock belonging to an exited process is recovered on the next launch.
- After a successful retry, the Codex window is shown, restored if minimized, and focused.
- **Click once and allow about 10 seconds.** The eight-second startup wait remains intentional. A second launch is not required to apply the retry.
- Checks: JavaScript syntax and duplicate-launch prevention passed. The window activation change has not yet been validated through a fresh end-to-end Windows startup; this is not a confirmed fix for every white-window occurrence.
- If interrupted and a lock persists, fully quit Codex and any still-running workaround launcher before removing `launcher.lock` from this workaround folder.

**Français :** cette version ignore les doubles lancements depuis le même dossier et affiche Codex après la réparation. Cliquez une fois et attendez environ 10 secondes. Le test anti-double-lancement est passé ; la disparition de toute fenêtre blanche reste à confirmer sur un démarrage complet. En cas de verrou persistant après interruption, quittez Codex et le lanceur avant de supprimer `launcher.lock` dans ce dossier.
## Scope and validation

- Diagnosed package: **OpenAI.Codex 26.917.8451.0**, internal version **26.917.62051**.
- Similar symptoms were reported on two PCs; runtime diagnosis and successful recovery were performed on **one**.
- Two consecutive replies were verified in the **Windows UI**, then another pair after restarting with the original repair launcher. A successful CLI exchange was not counted.
- This portable edition passed syntax/static checks but has not been validated on a second PC. Other versions and other causes of failed sending are untested.
- This concerns the **Codex Windows package**, not every ChatGPT desktop application, network error, or account problem. It is not an official OpenAI fix.

## Symptoms in the diagnosed case

- First message works; second message is stuck sending.
- Send button spins indefinitely; text stays in the composer rather than appearing in the conversation.
- Switching chats clears the spinner, but sending again gets stuck. Reopening an older chat also fails.
- Typing instead of pasting and selecting an explicit local project do not help.
- The web version works. Reinstallation/reset had not resolved the reported issue.
- Logs show no `turn/start` for the blocked send: the interface has not submitted it to the model.

A similar-looking spinner can have another cause. If your message already appears in the conversation and the model is responding slowly, this diagnosis may not apply.

## Download and use

1. Select **Code → Download ZIP** on this repository and extract **all files** into a writable folder.
2. Save unsent drafts and **quit Codex Windows completely**, including any background instance.
3. Double-click **Lancer.cmd** as your normal Windows user. No administrator launch or PowerShell policy change is required by the script.
4. Wait for the launcher result before sending. The launcher intentionally waits about eight seconds for startup; additional checks can take longer.
5. In the same Windows conversation, send `Reply only TEST-1`, wait for the reply, then send `Reply only TEST-2`. Success means receiving **both replies without restarting**.
6. If helpful, use Lancer.cmd for future starts. The normal Codex shortcut does not apply this workaround.

Requires the installed OpenAI.Codex Windows package and **Node.js 22 or newer**. Lancer.cmd first looks for the Node runtime bundled locally with Codex, then for Node on PATH. It downloads nothing. If the selected runtime is missing or too old, the launcher stops.

The console currently displays French status messages. `Requetes locales disponibles` means the local queries are available; it is **not** proof that two messages have succeeded. `Echec` means failure: inspect the local launcher.log, quit Codex completely, and retry only if appropriate.

## What was observed and what the workaround does

Two React Query entries remain `pending/fetching`:

```text
["vscode","codex-home"]
["vscode","codex-home","{\"hostId\":\"local\"}"]
```

This leaves the dependent managed-worktree query waiting on `codex-home-loading`, with `localWorkspaceMaterialization = loading` and `isLocalConfigPending = true`. The composer waits before dispatching the message. A fresh identical request through the same renderer/native bridge returns immediately.

The launcher locates the installed application, starts it with a temporary local Electron inspector, verifies its executable and process ID, and finds the local query cache in the UI. It calls `cancelQueries` and `refetchQueries` only for the selected pending local codex-home queries. It does not invent cache values, reset the whole cache, or bypass agent approvals.

**The cause of the initial unresolved requests is unknown.** A startup race or lost response is only a hypothesis. This retries the blocked prerequisite; it does not patch the underlying application bug. Internal React structures may change in future releases.

## Temporary debugger, privacy and rollback

The launcher temporarily opens the Electron inspector on **127.0.0.1:49372**. This is a privileged debugging interface, accessible locally while open; use it only on a trusted machine. The launcher requests closure when finished and schedules a 90-second closure timer after connecting and verifying the process. If startup fails or the launcher is interrupted before that timer is installed, **quit Codex completely to close the inspector**. Do not expose or forward this port.

The workaround does not modify signed program files, Windows protection settings, agent permissions, stored credentials, history, or projects. It creates a local `launcher.log` in its folder and changes only transient application state. It sends no diagnostic report; Codex itself continues its normal network operations.

**Undo:** quit Codex completely, then launch it with its usual shortcut. Delete this workaround folder if no longer wanted. There is no persistent application patch to uninstall. After a Codex update, try normal startup first.

## Files and reporting results

| File | Purpose |
| --- | --- |
| Lancer.cmd | Finds Node and starts the launcher |
| launch-repaired.mjs | Starts Codex, manages temporary debugging, runs the retry |
| retry-local-paths.js | Selects and retries pending local codex-home queries |
| SIGNALER.md | Technical report in English for maintainers |
| LICENSE | MIT license |

For a useful issue, include the Codex package/internal version, Windows version, whether the first and second replies arrive, and whether the text stays in the input. State whether you used this launcher. **Do not upload raw logs, conversation databases, tokens, private paths or project content.** Error messages in launcher.log can contain local paths; redact before sharing.

## Français

### Problème concerné

Le premier message reçoit une réponse, puis le **deuxième message reste bloqué** : bouton Envoyer grisé, cercle qui tourne, texte encore dans la saisie. Changer de chat enlève le cercle, mais ne répare pas l’envoi. Le web fonctionne. Le diagnostic porte sur **OpenAI.Codex 26.917.8451.0 / 26.917.62051**, pas sur toutes les applications ChatGPT ni toutes les pannes d’envoi.

L’interface attend une information sur son dossier local. Deux requêtes `codex-home` restent suspendues, alors qu’une nouvelle demande identique répond immédiatement. Le script relance uniquement ces requêtes. **La raison exacte de leur blocage initial reste inconnue.**

### Installation et vérification

1. Cliquez sur **Code → Download ZIP**, puis extrayez tous les fichiers dans un dossier accessible en écriture.
2. Copiez vos brouillons et **quittez complètement Codex Windows**, y compris en arrière-plan.
3. Double-cliquez sur **Lancer.cmd**, avec votre compte Windows habituel. Le script ne nécessite ni lancement administrateur ni changement de politique PowerShell.
4. Attendez le résultat du lanceur. Il laisse environ huit secondes au démarrage avant ses vérifications.
5. Dans le même fil Windows, envoyez `Réponds uniquement TEST-1`, attendez la réponse, puis `Réponds uniquement TEST-2`. **Il faut obtenir les deux réponses sans redémarrer.**
6. Si cela fonctionne, utilisez Lancer.cmd aux prochains démarrages. Le raccourci habituel n’applique pas le contournement.

Prérequis : paquet OpenAI.Codex installé et **Node.js 22 minimum**. Le lanceur cherche d’abord le runtime fourni localement avec Codex, puis Node dans PATH ; il ne télécharge rien. Un message de réussite du lanceur indique seulement que les requêtes locales sont disponibles : vérifiez réellement les deux réponses. En cas d’échec, consultez launcher.log puis quittez complètement Codex.

### Limites, accès temporaire et annulation

Deux réponses consécutives ont été vérifiées dans l’interface Windows, puis deux autres après un redémarrage avec le lanceur d’origine. L’édition portable a été vérifiée statiquement, **pas sur le deuxième PC**. Un symptôme semblable peut avoir une autre cause ; les versions ultérieures ne sont pas validées.

Le script ouvre temporairement le débogueur Electron sur **127.0.0.1:49372**. Cet accès local est puissant : utilisez-le sur une machine de confiance. Sa fermeture est demandée à la fin, avec une minuterie de 90 secondes après connexion et vérification. Si le lancement échoue ou est interrompu avant cela, **quittez complètement Codex pour fermer cet accès**. Ne partagez pas ce port sur le réseau.

Aucun fichier signé, réglage de protection Windows, permission d’agent, identifiant enregistré, historique ou projet n’est modifié. Seuls l’état temporaire de l’application et un journal local dans le dossier du lanceur sont concernés. Aucun rapport de diagnostic n’est envoyé.

**Annulation :** quittez Codex et reprenez son raccourci habituel. Vous pouvez supprimer le dossier du contournement. Après une mise à jour de Codex, essayez d’abord le lancement normal.

Pour signaler un résultat, précisez les versions et si les deux réponses arrivent. Ne publiez pas de journaux bruts, conversations, identifiants ou chemins privés. Le rapport technique anglais est dans [SIGNALER.md](SIGNALER.md).

---

Community workaround, not affiliated with or endorsed by OpenAI. MIT license.

