import { Suspense } from 'react';
import DatabaseClientPage from './database-client-page';
import Loading from './loading';
import databaseItems from '@/app/data/database.json';

export default function DatabasePage() {
    return (
        <Suspense fallback={<Loading />}>
            <DatabaseClientPage databaseItems={databaseItems} />
        </Suspense>
    );
}
