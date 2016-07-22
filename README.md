Hacking Mini-Game
=================

An OSX Fallout-3-a-like command-line minigame

This game is based on the spec at:
https://www.reddit.com/r/dailyprogrammer/comments/263dp1/5212014_challenge_163_intermediate_fallouts/

---
```
The popular video games Fallout 3 and Fallout: New Vegas has a computer hacking mini game.
This game requires the player to correctly guess a password from a list of same length words. Your challenge is to implement this game yourself.
The game works like the classic game of Mastermind The player has only 4 guesses and on each incorrect guess the computer will indicate how many letter positions are correct.
For example, if the password is MIND and the player guesses MEND, the game will indicate that 3 out of 4 positions are correct (M_ND). If the password is COMPUTE and the player guesses PLAYFUL, the game will report 0/7. While some of the letters match, they're in the wrong position.
Ask the player for a difficulty (very easy, easy, average, hard, very hard), then present the player with 5 to 15 words of the same length. The length can be 4 to 15 letters. More words and letters make for a harder puzzle. The player then has 4 guesses, and on each incorrect guess indicate the number of correct positions.
Here's an example game:
Difficulty (1-5)? 3
SCORPION
FLOGGING
CROPPERS
MIGRAINE
FOOTNOTE
REFINERY
VAULTING
VICARAGE
PROTRACT
DESCENTS
Guess (4 left)? migraine
0/8 correct
Guess (3 left)? protract
2/8 correct
Guess (2 left)? croppers
8/8 correct
You win!
You can draw words from our favorite dictionary file: enable1.txt . Your program should completely ignore case when making the position checks.
```
----------------------------------------

#Limitations

1. The whole array of strings to use are brought into an array of Strings.  1.5Mb worth.  A Trie would save much memory potentially.  Memory could run out.

2. I use brute force to iterate through the array and find strings. Collisions are checked for, but not the case where there aren't enough words of the required length.

3. This isn't terribly extendable, as the text file is bundled with the app.  Fine for testing, but hardly bullet-proof...and it doesn't allow for later expansion, other languages, etc.

4. Almost no error checking is done on the input.  If the word "blah" is in the list, but you enter "blat", no effort is made to ensure you're using a word that's in the list.  (In Fallout, you can *only* choose words on the screen, so this isn't an issue.)

5. The tests only test before the runGame() loop.  They do not test the runGame loop itself.

6. The runGame loop is too long.

7. The runGame has pyramided.  It has 7 levels of indention at its core.

8. The runGame loop wasn't TDD'd into place.
