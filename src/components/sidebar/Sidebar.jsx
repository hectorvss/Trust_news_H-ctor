import React from 'react';
import { SkeletonSidebar } from '../Skeleton';
import DailyBriefingCard from './DailyBriefingCard';
import BiasCard from './BiasCard';
import FavoritesCard from './FavoritesCard';
import HeadlinesCard from './HeadlinesCard';
import BlindSpotsCard from './BlindSpotsCard';
import RelatedTopicsCard from './RelatedTopicsCard';
import LocalNewsCard from './LocalNewsCard';

const Sidebar = ({ 
  navigate, 
  globalHeadlines, 
  favoritesCount, 
  blindSpotsData, 
  relatedTopics, 
  activeTopic,
  loading
}) => {
  if (loading) {
    return (
      <div className="sidebar">
        <SkeletonSidebar />
        <SkeletonSidebar />
        <SkeletonSidebar />
      </div>
    );
  }
  return (
    <div className="sidebar">
      <DailyBriefingCard navigate={navigate} globalHeadlines={globalHeadlines} />
      <BiasCard navigate={navigate} />
      <FavoritesCard navigate={navigate} favoritesCount={favoritesCount} />
      <HeadlinesCard headlines={[
        { t: 'El BCE mantiene los tipos pero apunta a junio.', w: '70%' },
        { t: 'Crisis de vivienda: el precio del alquiler sube un 12%.', w: '35%' },
        { t: 'Sánchez propone un pacto nacional por la IA.', w: '85%' },
        { t: 'La selección española se prepara para el amistoso.', w: '45%' }
      ]} />
      <BlindSpotsCard blindSpotsData={blindSpotsData} />
      <RelatedTopicsCard navigate={navigate} relatedTopics={relatedTopics} activeTopic={activeTopic} />
      <LocalNewsCard navigate={navigate} />
    </div>
  );
};

export default Sidebar;
