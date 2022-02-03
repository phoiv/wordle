import './Button.scss'
import React from 'react';

function Button(props) {
    return (
        <div className={`key-button ${props.status}`} onClick={props.clicked}>
            {props.content}
        </div>
    );
}

export default Button;