/**
 * Backfill embeddings for all existing posts that don't have one.
 *
 * Usage:
 *   npx ts-node src/scripts/backfillEmbeddings.ts
 *
 * Or from compiled JS:
 *   node dist/scripts/backfillEmbeddings.js
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Post from '../models/Post';
import {
    generateEmbedding,
    composeEmbeddingText,
    isEmbeddingConfigured,
} from '../services/embeddingService';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/posts-app';
const BATCH_DELAY_MS = 500; // delay between API calls to avoid rate limits

async function backfill() {
    if (!isEmbeddingConfigured()) {
        console.error('❌ OpenRouter API key is not configured. Cannot generate embeddings.');
        process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    const posts = await Post.find({
        $or: [
            { embedding: { $exists: false } },
            { embedding: { $size: 0 } },
            { embedding: null },
        ],
    });

    console.log(`📝 Found ${posts.length} posts without embeddings.\n`);

    let success = 0;
    let failed = 0;

    for (const post of posts) {
        const text = composeEmbeddingText({
            caption: post.caption,
            location: post.location,
            type: post.type,
        });

        try {
            const embedding = await generateEmbedding(text);
            await Post.findByIdAndUpdate(post._id, { embedding });
            success++;
            console.log(`  ✅ [${success}/${posts.length}] "${text.slice(0, 60)}..." (${embedding.length}d)`);
        } catch (err) {
            failed++;
            console.error(`  ❌ [${failed}] Failed for post ${post._id}:`, (err as Error).message);
        }

        // Small delay to be polite to the API
        if (posts.indexOf(post) < posts.length - 1) {
            await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
    }

    console.log(`\n🏁 Done! ${success} succeeded, ${failed} failed.`);
    await mongoose.disconnect();
    process.exit(0);
}

backfill().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
