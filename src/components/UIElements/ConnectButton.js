import React from 'react'
import { Button } from "react-bootstrap";

const ConnectButton = ({ connect, account }) => {
    return (
        <Button onClick={connect} className="outlined">
            {account ?
                `${account.slice(0, 6)}...${account.slice(
                    account.length - 4,
                    account.length
                )}` : 'Connect'}
        </Button>
    )
}

export default ConnectButton;