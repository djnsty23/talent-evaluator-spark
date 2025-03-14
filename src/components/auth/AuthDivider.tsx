
import React from 'react';

const AuthDivider = () => {
  return (
    <div className="relative w-full flex items-center justify-center">
      <span className="bg-card px-2 text-xs text-muted-foreground z-10">or continue with</span>
      <div className="absolute w-full h-px bg-border/70 top-1/2 -translate-y-1/2"></div>
    </div>
  );
};

export default AuthDivider;
