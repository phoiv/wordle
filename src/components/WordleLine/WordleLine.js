import './WordleLine.scss'

import React from 'react';

function WordleLine(props) {
    return (

        <div className={`worlde-line ${props.isInvalid ? 'invalid' : null}`}>
            {
                props.hints.map((hint, i) => {
                    return <div className={hint}>{props.word[i]}</div>
                })
            }
        </div>
    )

}

export default WordleLine;