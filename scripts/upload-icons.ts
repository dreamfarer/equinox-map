/**
 * Upload the icons in `public/icon` to the Cloudflare R2 bucket that serves
 * them. Only new and changed icons are uploaded and nothing is ever deleted.
 *
 * Usage:
 *   npm run icons:upload
 *   npm run icons:upload -- --dry-run
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';

const root = path.resolve(__dirname, '..');
const iconsDir = path.join(root, 'public/icon');
const prefix = 'icon/';
const batchSize = 8;

const contentTypes: Record<string, string> = {
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
};

function exitWithError(message: string): never {
    console.error(`Error: ${message}`);
    process.exit(1);
}

/** Create the client from the credentials of the R2 API token in `.env`. */
function createClient(): { client: S3Client; bucket: string } {
    const envPath = path.join(root, '.env');
    if (existsSync(envPath)) process.loadEnvFile(envPath);

    const {
        R2_ENDPOINT: endpoint,
        R2_BUCKET: bucket,
        R2_ACCESS_KEY_ID: accessKeyId,
        R2_SECRET_ACCESS_KEY: secretAccessKey,
    } = process.env;
    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
        exitWithError(
            'R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be set in .env, see how-to-update.md.'
        );
    }

    const client = new S3Client({
        region: 'auto',
        // Cloudflare displays the endpoint with the bucket appended.
        endpoint: new URL(endpoint).origin,
        credentials: { accessKeyId, secretAccessKey },
        // R2 doesn't support the checksums recent SDK versions add by default.
        requestChecksumCalculation: 'WHEN_REQUIRED',
        responseChecksumValidation: 'WHEN_REQUIRED',
    });
    return { client, bucket };
}

/** List the ETag of every icon in the bucket, which is the MD5 of its content. */
async function listRemoteIcons(
    client: S3Client,
    bucket: string
): Promise<Map<string, string>> {
    const remoteIcons = new Map<string, string>();
    let continuationToken: string | undefined;

    do {
        const response = await client.send(
            new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            })
        );
        for (const object of response.Contents ?? []) {
            if (!object.Key) continue;
            remoteIcons.set(
                object.Key,
                (object.ETag ?? '').replaceAll('"', '')
            );
        }
        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return remoteIcons;
}

async function uploadIcons(): Promise<void> {
    const isDryRun = process.argv.includes('--dry-run');
    const { client, bucket } = createClient();
    const remoteIcons = await listRemoteIcons(client, bucket);

    const files = (await readdir(iconsDir, { recursive: true }))
        .filter((file) => path.extname(file) in contentTypes)
        .sort();
    const keys = new Set<string>();
    const pending: { key: string; body: Buffer; isNew: boolean }[] = [];

    for (const file of files) {
        const key = prefix + file.split(path.sep).join('/');
        const body = await readFile(path.join(iconsDir, file));
        const hash = createHash('md5').update(body).digest('hex');
        keys.add(key);
        if (remoteIcons.get(key) !== hash) {
            pending.push({ key, body, isNew: !remoteIcons.has(key) });
        }
    }

    for (let i = 0; i < pending.length; i += batchSize) {
        await Promise.all(
            pending
                .slice(i, i + batchSize)
                .map(async ({ key, body, isNew }) => {
                    if (!isDryRun) {
                        await client.send(
                            new PutObjectCommand({
                                Bucket: bucket,
                                Key: key,
                                Body: body,
                                ContentType: contentTypes[path.extname(key)],
                            })
                        );
                    }
                    console.log(`${isNew ? 'Added' : 'Updated'} ${key}`);
                })
        );
    }

    // Keys ending with a slash are the folders created by the Cloudflare dashboard.
    const orphans = [...remoteIcons.keys()].filter(
        (key) => !keys.has(key) && !key.endsWith('/')
    );
    if (orphans.length > 0) {
        const list = isDryRun
            ? `:\n${orphans.map((key) => `- ${key}`).join('\n')}`
            : ', list them with --dry-run.';
        console.warn(
            `\n${orphans.length} icon(s) in the bucket are not part of public/icon and were left untouched${list}`
        );
    }

    console.log(
        `\n${isDryRun ? 'Dry run, would have uploaded' : 'Uploaded'} ${pending.length} of ${files.length} icon(s) to ${bucket}, the rest is up to date.`
    );
}

uploadIcons().catch((err) => {
    exitWithError(err instanceof Error ? err.message : String(err));
});
