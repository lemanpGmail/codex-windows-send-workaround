# Codex Windows : contournement de l'envoi bloque

Contournement communautaire non officiel pour OpenAI.Codex 26.917.8451.0
(version interne 26.917.62051). Ce paquet ne contient aucun journal personnel.

## Utilisation
1. Enregistrez vos brouillons et quittez completement Codex Windows.
2. Extrayez tout le ZIP dans un dossier accessible en ecriture.
3. Double-cliquez sur Lancer.cmd et attendez la fin du lanceur.
4. Testez deux messages dans le meme fil Windows.

Le lanceur cherche Node.js dans le runtime fourni avec Codex puis dans PATH.
Node.js 22 minimum est necessaire ; aucun telechargement automatique.
Utilisez ce lanceur a chaque demarrage si le contournement vous est utile.
En cas d'echec, consultez launcher.log et quittez Codex avant de reessayer.
Ne publiez pas ce journal sans le relire : les erreurs peuvent contenir des chemins locaux.

## Diagnostic
Le premier message recoit une reponse, puis Envoyer tourne et le texte reste dans
la saisie, sans turn/start. Sur la machine inspectee, deux requetes codex-home
restent pending/fetching, bloquant la preparation du dossier et le compositeur.
Une nouvelle requete identique par le meme pont natif repond immediatement.
Le script annule puis relance uniquement les requetes locales codex-home pending.
Il ne fabrique aucune valeur de cache. La cause initiale exacte reste inconnue.

Deux reponses consecutives dans Windows ont ete verifiees, puis deux autres apres
redemarrage avec le lanceur d'origine. Cette edition portable est verifiee
statiquement, mais pas validee sur un deuxieme PC. Un symptome similaire peut
avoir une autre cause. Le script depend de structures internes de cette version.

## Acces temporaire et annulation
Le lanceur ouvre le debogueur Electron sur 127.0.0.1:49372 et verifie l'identite
du processus lance avant d'utiliser l'interface. Il demande sa fermeture a la fin ;
un delai de fermeture de 90 secondes est aussi programme apres connexion.
Si le lanceur est interrompu avant connexion, quittez completement Codex pour
fermer cet acces temporaire. Aucun fichier signe, protection Windows, permission
d'agent, identifiant, historique ou projet n'est modifie. Aucun diagnostic envoye.

Pour annuler : quittez Codex et utilisez son raccourci habituel. Vous pouvez
supprimer ce dossier. Aucune installation ni modification persistante de Codex.

## Partage
Partagez le ZIP ou les sources avec cette notice. Ne joignez pas de journaux bruts,
de bases d'historique ou de configurations personnelles. SIGNALER.md contient
un rapport anglais pret a copier pour les mainteneurs. Code sous licence MIT.
