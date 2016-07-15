import { useRouterHistory } from 'react-router';
import { createHistory } from 'history';

const customHistory = useRouterHistory(createHistory)({ basename: '/patch-library-spa' });

export default customHistory;