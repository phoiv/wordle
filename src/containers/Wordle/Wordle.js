import {useEffect, useState, useRef} from "react";
import './Wordle.scss';
import wordList from '../../json_words.json';
import React from 'react';
import Button from "../../components/Button/Button";
import WordleLine from "../../components/WordleLine/WordleLine";
import AlertMessage from "../../components/AlertMessage/AlertMessage";
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {v4 as uuidv4} from 'uuid';


wordList.forEach((word, i) => {
    word = word.replace('Ϊ', 'Ι')
    word = word.replace('Ϋ', 'Υ')
    wordList[i] = word;
})


//CONSTS FOR GAME//
const keyboard = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'newline',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'newline',
    'del', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER'
]

const greekKeyboard = [
    'Ε', 'Ρ', 'Τ', 'Υ', 'Θ', 'Ι', 'Ο', 'Π', 'newline',
    'Α', 'Σ', 'Δ', 'Φ', 'Γ', 'Η', 'Ξ', 'Κ', 'Λ', 'newline',
    'del', 'Ζ', 'Χ', 'Ψ', 'Ω', 'Β', 'Ν', 'Μ', 'ENTER'
]

const messageLifetime = 1500;


function Wordle() {

    //status for keyboard only ==>
    //open, wrong, exists, exact
    const [letterStatus, setLetterStatus] = useState(
        greekKeyboard.reduce((prev, current, i, array) => {
            if (array[i] != 'newline') prev[array[i]] = 'open'
            return prev
        }, {}));


    const [solution, setSolution] = useState(() => wordList[Math.floor(Math.random() * wordList.length)]);
    const [frequencyTable, setFrequencyTable] = useState(
        //makes an object with the fequency of each letter DUH
        () => {
            let freq = {}
            for (let i = 0; i < solution.length; i++) {
                let l = solution[i];
                l in freq ? freq[l]++ : freq[l] = 1;
            }
            return freq
        }
    )


    const [pastWorldes, setPastWorldes] = useState(new Array(6).fill(""))
    const [hintsTable, setHintsTable] = useState(new Array(6).fill(new Array(5).fill("empty")))
    const [currentWordle, setCurrentWordle] = useState("");
    const [currentLine, setCurrentLine] = useState(0);

    //combine these states
    // const [inputEnabled, setInputEnabled] = useState(true);
    const [animationStage, setAnimationStage] = useState('none');

    const [newAlert, setNewAlert] = useState(false);
    const [alertList, setAlertList] = useState([]);


    const [gameWon, setGameWon] = useState(false)

    // console.log(`CURRENT WORD = ${currentLine} -- ${currentWordle}`)
    // console.log(`ALL WORDS = ${pastWorldes}`)
    // console.log(solution, frequencyTable)
    // console.log(hintsTable)

    useEffect(() => {
        if (animationStage == 'invalid_word') {
            setTimeout(() => {
                setAnimationStage('none');

            }, 1000)
        } else if (animationStage == 'revealing') {
            setTimeout(() => {
                setAnimationStage('none');
            }, 3500)
        }
    }, [animationStage])

    // useEffect(() => {
    //     if (!newAlert) return;
    //     setNewAlert(false)
    //     console.log('hi')
    //     setTimeout(() => {
    //
    //         console.log(alertList)
    //         // let newList = [...alertList]
    //         // console.log('removing..',newList);
    //         // newList.pop()
    //         // console.log('removed..',newList);
    //         // setAlertList(newList);
    //
    //     }, 5000)
    // }, [newAlert])

    const alertListRef = useRef(alertList);
    alertListRef.current = alertList;

    const handleKeyboardClick = (key) => {
        // console.log("PRESSED -> ", key)
        //make this behavour with hoooks
        if (currentLine == 6) return;
        // if (animationStage != 'none') return;
        if (gameWon) return;
        // if (!inputEnabled) return;
        switch (key) {

            case 'del':
                setCurrentWordle(currentWordle => currentWordle.slice(0, -1));
                break;
            case 'ENTER':
                //check for invalid word
                if (currentWordle.length < 5) {
                    setAnimationStage('invalid_word');
                    sendMessage('not enough letters')
                    break;
                }
                if (!wordList.includes(currentWordle)) {
                    setAnimationStage('invalid_word');
                    sendMessage('not in word list')
                    break;
                }


                let newPastWorldes = [...pastWorldes];

                resolveHints(currentWordle)

                newPastWorldes[currentLine] = currentWordle;
                setPastWorldes(newPastWorldes)
                setCurrentLine(currentLine => currentLine + 1)
                setCurrentWordle("");

                break;
            default:
                if (currentWordle.length == 5) break; //world is full, add invalid animation...
                setCurrentWordle(currentWordle => currentWordle + key);
                break;
        }

    }

    function resolveHints(word) {
        console.log('resolving... ', word)
        let newHintsLine = new Array(5).fill('wrong');
        let newLetterStatus = {...letterStatus}
        let freq = {...frequencyTable};
        //loop the word and check with solution for hints
        //we need to loop the words 2 times, first for exact matches and then for general
        //there was a bug with single loop, earlier matches would make later exatc matches not work :o
        for (let i = 0; i < 5; i++) {
            let currentLetter = word[i]
            if (currentLetter == solution[i]) {
                freq[currentLetter]--;
                newHintsLine[i] = 'exact';
                newLetterStatus[currentLetter] = 'exact';
            }
        }

        for (let i = 0; i < 5; i++) {
            let currentLetter = word[i]
            //if word and solution letters match we counted the allready so skip
            if (currentLetter == solution[i]) continue;
            if (freq[currentLetter]) {

                freq[currentLetter]--;
                newHintsLine[i] = 'exists';
                if (newLetterStatus[currentLetter] != 'exact')
                    newLetterStatus[currentLetter] = 'exists';
            } else {
                if (newLetterStatus[currentLetter] != 'exact')
                    newLetterStatus[currentLetter] = 'wrong';
            }
        }
        const newHintsTable = [...hintsTable];
        newHintsTable[currentLine] = newHintsLine;
        setHintsTable(newHintsTable);
        setLetterStatus(newLetterStatus);
        setAnimationStage('revealing');
        //check for win
        if (newHintsLine.every((hint) => hint == 'exact')) {
            console.log('victory');
            setTimeout(() => {
                sendMessage('VICTORY')
            }, 3500)

            setGameWon(true)
        }

    }

    function sendMessage(message) {
        const newList = [...alertList];
        const newMessage = {
            id: uuidv4(),
            message: message
        }
        newList.unshift(newMessage);
        setAlertList(newList)

        setTimeout(() => {
                console.log(alertListRef.current)
                let newAlertList = [...alertListRef.current]
                newAlertList.pop()
                setAlertList(newAlertList)
            },
            messageLifetime)
    }

    return (
        <div className='Wordle-container'>

            <div className={`alert-container`}>
                <TransitionGroup className="todo-list">
                    {alertList.map(({id, message}) => (
                        <CSSTransition
                            key={id}
                            timeout={500}
                            classNames="alert"
                        >
                            <AlertMessage message={message}>

                            </AlertMessage>
                        </CSSTransition>
                    ))}
                </TransitionGroup>
                {/*<CSSTransition*/}
                {/*    in={alert}*/}
                {/*    timeout={{*/}
                {/*        exit: 5000,*/}
                {/*    }}*/}
                {/*    classNames="alert"*/}
                {/*    mountOnEnter*/}
                {/*    unmountOnExit*/}
                {/*    // onEnter={() => setShowButton(false)}*/}
                {/*    // onExited={() => setShowButton(true)}*/}
                {/*>*/}
                {/*    <AlertMessage></AlertMessage>*/}
                {/*</CSSTransition>*/}
            </div>

            <div className='wordle-lines-wrapper'>
                {
                    pastWorldes.map((line, i) => {
                        return <WordleLine key={`line${i}`} word={currentLine == i ? currentWordle : line}
                                           hints={hintsTable[i]}
                                           isInvalid={currentLine == i && animationStage == 'invalid_word' ? true : false}></WordleLine>
                    })
                }
            </div>

            <div className='keyboard'>
                {
                    greekKeyboard.map((letter, i) => {
                        return letter != 'newline' ?
                            <Button key={letter} content={letter} status={letterStatus[letter]}
                                    clicked={() => handleKeyboardClick(letter)}>test</Button>
                            :
                            <div key={`empty${i}`} style={{width: '100%', height: '0px'}}></div>
                    })
                }
            </div>
        </div>
    );
}

export default Wordle;