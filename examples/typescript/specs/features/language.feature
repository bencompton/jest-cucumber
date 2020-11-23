# language: nl

Functionaliteit: Inloggen

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

        Voorbeelden: :

            | Artikel                                        | Bedrag |
            | Handtekening Neil deGrasse Tyson boek          | 100    |
            | Rick Astley t-shirt                            | 22     |
            | Een idee om ALLES te vervangen met blockchains | 0      |


        # add all possibilities

