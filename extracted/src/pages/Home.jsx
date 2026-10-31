import React from 'react';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import FeaturedReviewsSection from '../components/home/FeaturedReviewsSection';
import FooterSection from '../components/home/FooterSection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <FeaturedReviewsSection />
      <FooterSection />
    </div>
  );
}