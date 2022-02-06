import './AlertMessage.scss'

import React from 'react';

function AlertMessage(props) {
    return (

        <div className={`alert-item`}>
            {props.message}
        </div>
    )
}

export default AlertMessage;