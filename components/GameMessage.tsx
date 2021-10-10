import React from "react";
import styles from "../styles/GameMessage.module.css";

interface GameMessageProps {
  retryAction: () => void;
  show: boolean;
}

export const GameMessage: React.FC<GameMessageProps> = ({
  show,
  retryAction,
  children,
}) => {
  return (
    <div
      className={`${styles.container} ${show ? styles.showing : styles.hidden}`}
    >
      <div>{children}</div>
      <button className={styles.button} onClick={retryAction}>
        Play Again
      </button>
    </div>
  );
};

export default GameMessage;
