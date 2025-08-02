import React from 'react';

const FloatingOrbs = () => {
  const orbs = [
    { color: 'bg-gradient-to-r from-pink-500 to-rose-500', size: 'w-32 h-32', position: 'top-20 left-20', animation: 'animate-float' },
    { color: 'bg-gradient-to-r from-yellow-400 to-orange-500', size: 'w-24 h-24', position: 'top-40 right-32', animation: 'animate-float2' },
    { color: 'bg-gradient-to-r from-blue-400 to-purple-500', size: 'w-40 h-40', position: 'bottom-32 left-40', animation: 'animate-float3' },
    { color: 'bg-gradient-to-r from-emerald-400 to-cyan-500', size: 'w-28 h-28', position: 'bottom-20 right-20', animation: 'animate-float' },
    { color: 'bg-gradient-to-r from-purple-500 to-pink-500', size: 'w-36 h-36', position: 'top-1/2 left-10', animation: 'animate-float2' },
    { color: 'bg-gradient-to-r from-orange-400 to-red-500', size: 'w-20 h-20', position: 'top-1/3 right-1/4', animation: 'animate-float3' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {orbs.map((orb, index) => (
        <div
          key={index}
          className={`floating-orb ${orb.color} ${orb.size} ${orb.position} ${orb.animation}`}
          style={{
            animationDelay: `${index * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingOrbs;