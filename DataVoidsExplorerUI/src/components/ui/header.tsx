import React, {FC} from "react";

interface HeaderProps {
  title: React.ReactNode;
}

const Header: FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-gray-800 py-4">
      <div className="mx-auto px-4">
        <h1 className="text-white text-2xl">{title}</h1>
      </div>
    </header>
  );
};

export { Header };
