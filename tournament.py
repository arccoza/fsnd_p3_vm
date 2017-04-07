#!/usr/bin/env python
#
# tournament.py -- implementation of a Swiss-system tournament
#

import psycopg2


def connect():
    """Connect to the PostgreSQL database.  Returns a database connection."""
    return psycopg2.connect("dbname=tournament")


def qr(query, **kwargs):
    db = connect()
    c = db.cursor()
    # print(c.mogrify(query, kwargs))
    c.execute(query, kwargs)
    for row in c:
        # print(row)
        yield row
    # db.commit()
    db.close()


def qw(query, **kwargs):
    db = connect()
    c = db.cursor()
    print(c.mogrify(query, kwargs))
    c.execute(query, kwargs)
    print(c.rowcount)
    yield c.rowcount
    db.commit()
    db.close()


def deleteMatches(fixture=None):
    """Remove all the match records from the database."""
    ret = None

    if fixture:
        query = '''
                DELETE FROM ONLY matches
                WHERE matches.fid =
                (
                    SELECT id
                    FROM
                        fixtures
                    WHERE
                        fixtures.name = %(fixture)s
                );
                '''
    else:
        query = 'DELETE FROM ONLY matches;'

    for count in qw(query, fixture=fixture):
        ret = count

    return ret


def deletePlayers(fixture=None):
    """Remove all the player records from the database."""
    ret = None

    if fixture:
        query = '''
                DELETE FROM ONLY players
                WHERE players.fid =
                (
                    SELECT id
                    FROM
                        fixtures
                    WHERE
                        fixtures.name = %(fixture)s
                );
                '''
    else:
        query = 'DELETE FROM ONLY players;'

    for count in qw(query, fixture=fixture):
        ret = count

    return ret


def countPlayers(fixture='default'):
    """Returns the number of players currently registered."""
    ret = None

    query = '''
            SELECT count(p.id)
            FROM
                players as p, fixtures as f
            WHERE
                p.fid = f.id
            AND
                f.name = %(fixture)s;
            '''

    for count in qr(query, fixture=fixture):
        print(count[0])
        ret = count[0]

    return ret


def registerPlayer(name, fixture=None):
    """Adds a player to the tournament database.

    The database assigns a unique serial id number for the player.  (This
    should be handled by your SQL database schema, not in your Python code.)

    Args:
      name: the player's full name (need not be unique).
    """
    ret = None

    if fixture:
        query = '''
                INSERT INTO players (name, fid)
                VALUES (%(name)s,
                (
                    SELECT id
                    FROM
                        fixtures
                    WHERE
                        fixtures.name = %(fixture)s
                ));
                '''
    else:
        query = 'INSERT INTO players (name) VALUES (%(name)s);'

    for count in qw(query, fixture=fixture, name=name):
        ret = count

    return ret


def playerStandings(fixture='default'):
    """Returns a list of the players and their win records, sorted by wins.

    The first entry in the list should be the player in first place, or a player
    tied for first place if there is currently a tie.

    Returns:
      A list of tuples, each of which contains (id, name, wins, matches):
        id: the player's unique id (assigned by the database)
        name: the player's full name (as registered)
        wins: the number of matches the player has won
        matches: the number of matches the player has played
    """
    ret = []

    query = '''
            SELECT p.id, p.name,
                SUM(CASE
                        WHEN m.winner = p.id
                        THEN 1
                        ELSE 0
                    END) as wins,
                SUM(CASE
                        WHEN m.winner = p.id
                        THEN 1
                        WHEN m.loser = p.id
                        THEN 1
                        ELSE 0
                    END) as matches
            FROM
                players as p
            JOIN fixtures as f
            ON f.id = p.fid AND f.name = %(fixture)s
            LEFT JOIN matches as m
            ON m.winner = p.id OR m.loser = p.id
            GROUP BY p.id, f.name
            ORDER BY wins;
            '''

    ret = [row for row in qr(query, fixture=fixture)]

    return ret


def reportMatch(winner, loser, fixture='default'):
    """Records the outcome of a single match between two players.

    Args:
      winner:  the id number of the player who won
      loser:  the id number of the player who lost
    """
    ret = None
    mpr = countPlayers(fixture=fixture) / 2

    query = '''
            INSERT INTO matches (winner, loser, round, fid)
            VALUES (
                %(winner)s,
                %(loser)s,
                trunc(
                    (SELECT count(m.id)
                    FROM matches as m, fixtures as f
                    WHERE f.id = m.fid
                    AND f.name = %(fixture)s
                    ) / %(mpr)s
                ) + 1,
                (SELECT id FROM fixtures WHERE name = %(fixture)s)
            );
            '''
    for count in qw(query, winner=winner, loser=loser, mpr=mpr, fixture=fixture):
        ret = count

    return ret


def swissPairings():
    """Returns a list of pairs of players for the next round of a match.

    Assuming that there are an even number of players registered, each player
    appears exactly once in the pairings.  Each player is paired with another
    player with an equal or nearly-equal win record, that is, a player adjacent
    to him or her in the standings.

    Returns:
      A list of tuples, each of which contains (id1, name1, id2, name2)
        id1: the first player's unique id
        name1: the first player's name
        id2: the second player's unique id
        name2: the second player's name
    """

# deletePlayers(fixture='default')
# registerPlayer(name='Zim', fixture='grandslam-2017')
# print(playerStandings())
# reportMatch(32, 34)
