// Connect to Redis using REDIS_URL
import { createClient } from "redis";

// Create and cache the Redis client
let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is required");
    }
    
    redisClient = createClient({
      url: redisUrl,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    await redisClient.connect();
  }
  return redisClient;
}

/**
 * Generate a random 4-digit code
 */
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate a unique learner ID
 */
function generateLearnerId() {
  return `learner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new learner profile with a unique code
 * Returns: { learnerId, code, name }
 */
export async function createProfile(nickname = "") {
  const redis = await getRedisClient();
  let code;
  let codeExists = true;
  
  // Generate a unique code (check if it already exists)
  while (codeExists) {
    code = generateCode();
    const existing = await redis.get(`code:${code}`);
    if (!existing) {
      codeExists = false;
    }
  }
  
  const learnerId = generateLearnerId();
  
  const profile = {
    learnerId,
    name: nickname || "Learner",
    code,
    createdAt: new Date().toISOString(),
  };
  
  // Store the mapping: code -> learnerId
  await redis.set(`code:${code}`, learnerId);
  
  // Store the profile: learnerId -> profile
  await redis.set(`profile:${learnerId}`, JSON.stringify(profile));
  
  // Initialize empty progress
  const initialProgress = {
    modules: [],
    activeModuleId: "",
    activeLessonId: "",
  };
  await redis.set(`progress:${learnerId}`, JSON.stringify(initialProgress));
  
  return profile;
}

/**
 * Get learner profile by code
 * Returns: { learnerId, code, name } or null if not found
 */
export async function getProfileByCode(code) {
  if (!code) return null;
  
  const redis = await getRedisClient();
  const learnerId = await redis.get(`code:${code}`);
  if (!learnerId) return null;
  
  const profileStr = await redis.get(`profile:${learnerId}`);
  if (!profileStr) return null;
  
  return JSON.parse(profileStr);
}

/**
 * Get learner profile by learnerId
 * Returns: { learnerId, code, name } or null if not found
 */
export async function getProfile(learnerId) {
  if (!learnerId) return null;
  
  const redis = await getRedisClient();
  const profileStr = await redis.get(`profile:${learnerId}`);
  if (!profileStr) return null;
  
  return JSON.parse(profileStr);
}

/**
 * Save progress for a learner
 * progressData should match your current localStorage structure:
 * {
 *   modules: [...],
 *   activeModuleId: "...",
 *   activeLessonId: "..."
 * }
 */
export async function saveProgress(learnerId, progressData) {
  if (!learnerId) {
    throw new Error("learnerId is required");
  }
  
  // Verify learner exists
  const profile = await getProfile(learnerId);
  if (!profile) {
    throw new Error("Learner profile not found");
  }
  
  const redis = await getRedisClient();
  // Save progress
  await redis.set(`progress:${learnerId}`, JSON.stringify(progressData));
  
  return { success: true };
}

/**
 * Load progress for a learner
 * Returns: progress data or null if not found
 */
export async function loadProgress(learnerId) {
  if (!learnerId) return null;
  
  const redis = await getRedisClient();
  const progressStr = await redis.get(`progress:${learnerId}`);
  if (!progressStr) {
    // Return empty progress structure if none exists
    return {
      modules: [],
      activeModuleId: "",
      activeLessonId: "",
    };
  }
  
  return JSON.parse(progressStr);
}
