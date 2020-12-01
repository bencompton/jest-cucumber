# language: nl

Functionaliteit: Taal test

    Achtergrond: Voor inloggen heb je inloggegevens nodig

    Rule: Regel is niet vertaalt

    Scenario: Invullen van een correct wachtwoord
        Gegeven ik heb voorheen een wachtwoord aangemaakt
        Als ik het correcte wachtwoord invoer
        Dan krijg ik toegang

    Abstract Scenario: Verkoop <Artikel> voor €<Bedrag>
        Gegeven ik heb een <Artikel>
        Als ik <Artikel> verkoop
        Dan zou ik €<Bedrag> ontvangen

        Voorbeelden:

            | Artikel                                        | Bedrag |
            | Autographed Neil deGrasse Tyson book           | 100    |
            | Rick Astley t-shirt                            | 22     |
            | An idea to replace EVERYTHING with blockchains | 0      |

    Scenario: Mijn salaris storten
        Gegeven mijn account balans is €10
        Wanneer ik €1000000 krijg betaald voor het schrijven van geweldige code
        Dan zou mijn account balans €1000010 zijn

    Scenario: een artikel toevoegen aan mijn takenlijst
        Gegeven mijn ziet mijn takenlijst er zo uit:
        | TaakNaam            | Prioriteit |
        | Fix bugs in my code | medium     |
        | Document my hours   | medium     |
        Wanneer ik de volgende taken toevoeg:
        | TaakNaam                              | Prioriteit |
        | Watch cat videos on YouTube all day   | high       |
        Dan zou ik de volgende takenlijst zien:
        | TaakNaam                              | Prioriteit |
        | Watch cat videos on YouTube all day   | high       |
        | Sign up for unemployment              | high       |
