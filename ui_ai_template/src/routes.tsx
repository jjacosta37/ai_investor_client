import { Icon } from './lib/chakra';
import { MdAutoAwesome, MdBookmark, MdPieChart } from 'react-icons/md';

// Auth Imports
import { IRoute } from './types/navigation';

const routes: IRoute[] = [
  {
    name: 'AI Analyst',
    path: '/',
    icon: (
      <Icon as={MdAutoAwesome} width="20px" height="20px" color="inherit" />
    ),
    collapse: false,
  },
  {
    name: 'Holdings',
    path: '/holdings',
    icon: <Icon as={MdPieChart} width="20px" height="20px" color="inherit" />,
    collapse: false,
  },
  {
    name: 'Smart Watchlist',
    path: '/watchlist',
    icon: <Icon as={MdBookmark} width="20px" height="20px" color="inherit" />,
    collapse: false,
  },
];

export default routes;
