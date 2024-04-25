import React, { memo, useCallback, useState } from 'react';
// import './index.css';

function Chat({ dataChannel }) {
    const [text, setText] = useState('');
    const [chat, setChat] = useState([]);

    const handleOnSend = useCallback((e) => {
        e.preventDefault();
        try {
            dataChannel.send(text);
        }
        catch (error) {
            console.log(error);
        }
        setChat((prevState) => [...prevState, [text, 1]])
        setText('');
    }, [text, dataChannel]);

    dataChannel.onmessage = (e) => {
        // console.log(e.data);
        setChat((prevState) => [...prevState, [e.data, 0]]);
    }

    return (
        <div className='parent-chat'>

            <div className='chat'>
                {
                    chat.map((ele, index) => {


                        if (ele[1]) {
                            return (
                                <div key={index} className='manage-right'>{ele[0]}</div>
                            )
                        } else {
                            return (
                                <div key={index} className='manage-left'>{ele[0]}</div>
                            )
                        }

                    }
                    )
                }
            </div>

            <form style={{ width: '100%' }} className='text-field' onSubmit={handleOnSend}>
                <input value={text} onChange={(e) => setText(e.target.value)} />
                <button onClick={handleOnSend}>click</button>
            </form>

        </div>
    )
}

export default memo(Chat);