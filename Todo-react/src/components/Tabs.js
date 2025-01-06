import React from 'react';
import Button from './Button'; 
import './Styles.css'; 

const Tabs = ({ activeTab, onTabChange, taskCounts }) => {
  const handleTabChange = (tab) => {
    console.log(`Tab changed from "${activeTab}" to "${tab}"`); 
    onTabChange(tab);
  };

  return (
    <div className="tabs-container">
      <Button
        label={`All (${taskCounts.all})`}
        onClick={() => handleTabChange('all')}
        className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} 
      />
      <Button
        label={`In-Progress (${taskCounts.inProgress})`}
        onClick={() => handleTabChange('in-progress')}
        className={`tab-button ${activeTab === 'in-progress' ? 'active' : ''}`}
      />
      <Button
        label={`Completed (${taskCounts.completed})`}
        onClick={() => handleTabChange('completed')}
        className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
      />
    </div>
  );
};

export default Tabs;
