import React, { FC } from 'react';
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';
import { Link, useLocation } from 'react-router-dom';

export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    const isHomePage = path === '/' && location.pathname === '/';
    const isCurrentPath =
      location.pathname.startsWith(path) && location.pathname !== '/';
    return isHomePage || isCurrentPath;
  };

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <Link
            to='/'
            className={`${styles.link} ${location.pathname === '/' && styles.link_active}`}
          >
            {(() => {
              const iconType =
                location.pathname === '/' ? 'primary' : 'secondary';
              return <BurgerIcon type={iconType} />;
            })()}
            <p className='text text_type_main-default ml-2 mr-10'>
              Конструктор
            </p>
          </Link>
          <Link
            to='/feed'
            className={`${styles.link} ${isActive('/feed') && styles.link_active}`}
          >
            {(() => {
              const iconType = isActive('/feed') ? 'primary' : 'secondary';
              return <ListIcon type={iconType} />;
            })()}
            <p className='text text_type_main-default ml-2'>Лента заказов</p>
          </Link>
        </div>
        <div className={styles.logo}>
          <Link to='/'>
            <Logo className='' />
          </Link>
        </div>
        <div className={styles.link_position_last}>
          <Link
            to='/profile'
            className={`${styles.link} ${isActive('/profile') && styles.link_active}`}
          >
            {(() => {
              const iconType = isActive('/profile') ? 'primary' : 'secondary';
              return <ProfileIcon type={iconType} />;
            })()}
            <p className='text text_type_main-default ml-2'>
              {userName || 'Личный кабинет'}
            </p>
          </Link>
        </div>
      </nav>
    </header>
  );
};
