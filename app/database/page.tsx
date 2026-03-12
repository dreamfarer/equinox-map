import { Suspense } from 'react';
import DatabaseClientPage from './database-client-page';
import Loading from './loading';

export default function DatabasePage() {
    return (
        <Suspense fallback={<Loading />}>
            <DatabaseClientPage />
        </Suspense>
    );
}
