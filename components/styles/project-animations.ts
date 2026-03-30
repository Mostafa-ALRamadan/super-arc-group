// Animation styles for project cards - saved from ProjectsPreview component
export const projectCardAnimations = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.8s ease-out forwards;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Hover animation style for project cards
export const projectCardHoverStyle = {
  transition: 'all 0.3s ease-out',
  cursor: 'pointer'
};

// Animation delay pattern for staggered entrance
export const getAnimationDelay = (index: number, baseDelay: number = 0.6) => ({
  opacity: 1,
  transform: 'translateY(0)',
  transition: `all 1s ease-out ${baseDelay + index * 0.1}s`
});
