import React, { FC } from 'react';


interface DialogProps {
    leaveCallback: (leave: boolean) => any
}



const Dialog: FC<DialogProps> = ({leaveCallback}) => {

  const leave = async (leave: boolean) => {
    await leaveCallback(leave)();
  }

  return (
    <div>
      <br/>
      <br/>
      <br/>
      <br/>
        <h2>Are you sure you want to leave the page?</h2>

        <button onClick={() => {leave(true)}}>Leave</button>
        <button onClick={() => {leave(false)}}>Keep on page</button>
    </div>
  )
};

export default Dialog;