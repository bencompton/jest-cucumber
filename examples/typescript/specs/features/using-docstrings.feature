Feature: Certificate manufacturing

Scenario Outline: Print a certificate
    Given <Title> <LastName> has achieved a <Score>
    When I print the certificate
    Then It prints
        """
        Certificate of Mastery
        The title of <Rank> is hereby awarded to:
        <Title> <LastName>
        For achieving a score of <Score>, <Title> <LastName>
        may henceforth use the title <Rank>.
        """

    Examples:

        | Title | LastName  | Score | Rank              |
        | Mr.   | Vega      | 1000  | Novice            |
        | Mrs.  | Wallace   | 2001  | Expert            |
        | Mr.   | Winnfield | 2550  | Grandmaster       |
        | Ms.   | Bunny     | 2800  | Super Grandmaster |

