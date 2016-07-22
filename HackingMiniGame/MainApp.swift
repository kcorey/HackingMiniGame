//
//  MainApp.swift
//  HackingMiniGame
//
//  Created by Ken Corey on 22/07/2016.
//  Copyright © 2016 Ken Corey. All rights reserved.
//

import Foundation

class MainApp {

    func loadText() -> [String] {

        var bundle:NSBundle
        
        if let bundlepath = NSBundle.mainBundle().pathForResource("bundle", ofType: "bundle") {
            
            bundle = NSBundle(path:bundlepath)!
        }
        else {
            
            bundle = NSBundle(forClass: self.dynamicType)
        }
        
        let path = bundle.pathForResource("englishdictionary", ofType: "txt")!
        let url = NSURL.fileURLWithPath(path)
        
        var result = Array<String>()
        
        do {
            
            let lines = try NSString(contentsOfURL: url, encoding: NSUTF8StringEncoding)
            let properEOL = lines.stringByReplacingOccurrencesOfString("\r", withString: "")
            
            result = properEOL.componentsSeparatedByCharactersInSet(NSCharacterSet.newlineCharacterSet())
            
        } catch  {
            
            print("Ack!  Couldn't load the contents of \(url.absoluteString)\n")
        }
        
        return result
    }
    
    func getRandomWord(wordLength:Int, dictionary:[String]) -> String {
        
        var result:String = ""
        
        var target = Int(arc4random_uniform((UInt32)(dictionary.count)))
        
        while (dictionary[target].characters.count != wordLength) {
            
            target = Int(arc4random_uniform((UInt32)(dictionary.count)))
        }
        
        result = dictionary[target]
        
        return result
    }
    
    func getWordList(wordCount:Int, wordLength:Int, dictionary:[String]) -> [String] {
        
        var result:[String] = []
        var word = ""

        while (result.count < wordCount) {
            
            word = getRandomWord(wordLength, dictionary: dictionary)
            if (!result.contains(word)) {
                
                result.append(word)
            }
        }
        
        return result
    }
    
    func scoreGuess(guess:String, password:String) -> Int {
        
        var score = 0;
        
        for (passwordElement, guessElement) in zip(password.characters, guess.characters) {
            
            if (passwordElement == guessElement) {
                
                score += 1
            }
        }
        
        return score
    }
    
    func printWordList(wordList:[String]) {
    
        for word in wordList {
            
            print("\(word)\n")
        }
    }
    
    func runGame() {
        
        var difficulty = 3
        var wordList:[String] = []
        var password = ""
        var wordLengths:[Int] = [4,7,10,13,15]
        var wordCounts:[Int] = [5,8,10,12,15]
        var guesses = 3
        var difficultyInput = "junk"
        let dictionary = loadText()
        
        while (difficultyInput != "") {
            
            print("Difficulty (1-5)? ")
            difficultyInput = readLine(stripNewline: true)!
            if let difficultyInt = Int(difficultyInput) {
                
                difficulty = difficultyInt
            }
            difficulty -= 1
            
            var wordInput = ""
            var wordScore = 0
            
            if (difficulty >= 0
                && difficulty <= 4) {
                
                wordList = getWordList(wordCounts[difficulty],wordLength: wordLengths[difficulty], dictionary: dictionary)
                
                password = wordList[Int(arc4random_uniform((UInt32)(wordList.count)))]
                
                printWordList(wordList)
                
                guesses = 3
                
                while (guesses >= 0) {
                    
                    print("Guess (\(guesses) left)? ")
                    wordInput = readLine(stripNewline: true)!
                    
                    wordScore = scoreGuess(wordInput, password: password)
                    
                    if (wordInput == password) {
                        
                        //You win!
                        print("You win!")
                        guesses = -1
                    }
                    else {
                        
                        guesses -= 1
                        
                        // print score.
                        print("\(wordScore)/\(password.characters.count) correct")
                        
                        if (guesses < 0) {
                            
                            // You lose!
                            print("You lose, it was \(password)!")
                        }
                    }
                }
            }
        }
    }
}
