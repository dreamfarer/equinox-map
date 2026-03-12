import { Suspense } from 'react';
import DatabaseClientPage from './database-client-page';
import Loading from './loading';
import databaseItems from '@/app/data/database.json';
import { buildFilterOptions } from '@/lib/database';

export default function DatabasePage() {
    return (
        <Suspense fallback={<Loading />}>
            <DatabaseClientPage
                allDatabaseItems={databaseItems}
                filterOptions={buildFilterOptions(databaseItems)}
            />
        </Suspense>
    );
}
