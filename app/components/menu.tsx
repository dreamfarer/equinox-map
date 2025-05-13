'use client';
import type { NextPage } from 'next';
import styles from './menu.module.css';
import Category from './menu/category';
import SearchBar from './menu/searchbar';
import { useState } from 'react';

const Menu: NextPage = () => {
  const [questsEnabled, setQuestsEnabled] = useState(true);
  const [mainQuestVisible, setMainQuestVisible] = useState(true);
  const [sideQuestVisible, setSideQuestVisible] = useState(true);

  const toggleQuests = () => {
    const newState = !questsEnabled;
    setQuestsEnabled(newState);
    setMainQuestVisible(newState);
    setSideQuestVisible(newState);
  };

  return (
    <div className={styles.menu}>
      <SearchBar
        onSearch={() => {
          // console.log('Searching for:', query);
          // TO-DO: Implement proper filtering
        }}
      />
      <Category
        title="Locations"
        isActive={questsEnabled}
        onToggle={toggleQuests}
        entries={[
          {
            label: 'Main Quest',
            isActive: mainQuestVisible,
            onToggle: () => setMainQuestVisible(!mainQuestVisible),
          },
          {
            label: 'Side Quest',
            isActive: sideQuestVisible,
            onToggle: () => setSideQuestVisible(!sideQuestVisible),
          },
        ]}
      />
    </div>
  );
};

export default Menu;
