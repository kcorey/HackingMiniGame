//
//  mainTests.swift
//  HackingMiniGame
//
//  Created by Ken Corey on 22/07/2016.
//  Copyright © 2016 Ken Corey. All rights reserved.
//

import XCTest

class mainTests: XCTestCase {

    func testExample() {
        
        let app = MainApp()
        let dict = app.loadText()
        
        print("Got \(dict.count) words.\n")
        
        XCTAssertEqual(dict.count,172820)
    }
    
    func testGetRandomWordOf7() {
        
        let app = MainApp()
        let dict:[String] = ["portofino", "testword", "another", "one", "two", "three"]
        
        // get a random word that's 7 characters long.
        let word = app.getRandomWord(7, dictionary:dict);
        
        XCTAssertEqual(word.characters.count, 7)
        XCTAssertEqual(word, "another")
    }
    
    func testGetTwoRandomWords() {
        
        let app = MainApp()
        let dict:[String] = ["portofino", "testword", "another", "one", "two", "three"]
        
        // get a random word that's 3 characters long.
        let word = app.getRandomWord(3, dictionary:dict);
        var word2 = word;
        while (word2 == word) {
            word2 = app.getRandomWord(3, dictionary:dict);
        }

        XCTAssertEqual(word.characters.count, 3)
        XCTAssertEqual(word2.characters.count, 3)
        XCTAssertNotEqual(word, word2)
    }
    
    func testGetWordList3Chars() {
        
        let app = MainApp()
        let dict:[String] = ["portofino", "testword", "another", "one", "two", "thr", "and"]
        
        // get a word list of words that're 3 characters long.
        let words = app.getWordList(4, wordLength:3, dictionary:dict);
        
        XCTAssertEqual(words.count, 4)
    }
    
    func testScoreGuess() {
        
        let app = MainApp()
        
        let score = app.scoreGuess("two",password:"thr")
        
        XCTAssertEqual(score,1)
        
        let score2 = app.scoreGuess("tho",password:"thr")
        
        XCTAssertEqual(score2,2)
    }
    
    
}
