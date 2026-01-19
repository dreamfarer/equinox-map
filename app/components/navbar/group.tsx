import React from 'react';
import styles from '@/app/components/navbar/group.module.css';

interface Props {
    children: React.ReactNode;
}

const Group: React.FC<Props> = ({ children }) => {
    return <div className={styles.group}>{children}</div>;
};

export default Group;
