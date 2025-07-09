import React from 'react';
import { NavLink } from 'react-router-dom';

export const MainNav: React.FC = () => {
  const navItems = [
    { path: '/artists', label: 'Artists' },
    { path: '/releases', label: 'Releases' },
    { path: '/concerts', label: 'Concerts' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="main-nav">
      <ul>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};