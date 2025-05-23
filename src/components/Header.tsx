import React from 'react';
import { Split } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="mb-12">
      <div className="flex items-center justify-center mb-4">
        <Split className="h-12 w-12 text-indigo-600" />
      </div>
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
        photo splicer fr
      </h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto">
        Upload photos for splicing! Made by Ilkay Aya & bolt.new
      </p>
    </header>
  );
};

export default Header;
