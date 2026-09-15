# Futsal Watiska

Mobiele zaalvoetbal-inschrijving.

- Eerste 10 spelers worden individueel en willekeurig verdeeld over Team 1 en Team 2.
- Zodra een speler een team heeft, blijft hij daar.
- Vanaf speler 11 zijn spelers invallers.
- Bij verwijdering van een teamspeler gaat de oudste invaller rechtstreeks naar die vrijgekomen plek.
- Admin kan inschrijving sluiten/openen, handmatig randomizen of alles resetten.

Railway:
- Zet `ADMIN_PASSWORD` als environment variable.
- Voor persistentie: Railway Volume gemount op `/data`.
- Zet `DB_PATH=/data/zaalvoetbal.db`.
