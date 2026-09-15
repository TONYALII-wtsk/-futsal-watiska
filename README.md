# Zaalvoetbal inschrijvingsapp

## Wat zit erin?
- Eén veld: `Naam`
- Eerste 10 inschrijvingen worden automatisch random verdeeld over 2 teams van 5.
- Nummer 11+ komt automatisch op de invallerslijst in inschrijfvolgorde.
- Server bepaalt het tijdstip; deelnemers kunnen hun plaats niet beïnvloeden via hun telefoonklok.
- Adminpaneel met wachtwoord.
- Inschrijving openen/sluiten.
- Teams opnieuw randomizen.
- Spelers verwijderen.
- Mobielvriendelijke interface.

## Lokaal testen
1. Installeer Node.js 18+.
2. Open een terminal in deze map.
3. Voer `npm install` uit.
4. Stel `ADMIN_PASSWORD` in (bijvoorbeeld via `.env`, of als omgevingsvariabele).
5. Voer `npm start` uit.
6. Open `http://localhost:3000`.

## Online zetten
Deze versie heeft een echte SQLite-database op de server en is daarom bedoeld voor een hostingplatform met permanente opslag (bijv. een VPS/Railway-achtige hosting). Zet daar:
- `npm install` als build/install stap
- `npm start` als startcommando
- `ADMIN_PASSWORD` als geheime environment variable

Voor productie is een permanente disk/volume nodig voor `zaalvoetbal.db`.
