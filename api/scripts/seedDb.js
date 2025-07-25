import * as userRepo from "../src/repositories/userRepository.js";
import { publicUser } from "../src/schemas/userSchema.js";
import HubService from "../src/services/HubService.js";
import * as secretService from "../src/services/secretService.js";

const seedUser = async (email, password, role) => {
  if (!email || !password) throw new Error("Set email & password in env variables.");
  const passwordHash = await secretService.generatePasswordHash(password);
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);
  let userDb = await userRepo.getByEmail(email);
  if (userDb) {
    if (userDb.role !== role) {
      await userRepo.update(userDb.public_id, { role });
      console.log(`Updated user ${userDb.email} to ${role} role.`);
      return;
    }
    console.log(`${roleTitle} type user already exists: ${userDb.email}`);
    return;
  }

  const publicId = secretService.generatePublicId("user");
  userDb = await userRepo.create(email, passwordHash, null, role, publicId);
  userDb = await userRepo.update(userDb.public_id, { is_confirmed: true });
  await new HubService({ user: publicUser.parse(userDb) }).copyStarterTemplates();
  console.log(`${roleTitle} type user created: ${userDb.email}`);
};

const seedAdmin = async () => {
  const email = process.env.DB_SEED_ADMIN_EMAIL;
  const password = process.env.DB_SEED_ADMIN_PASSWORD;
  await seedUser(email, password, "admin");
};

const seedDemoUser = async () => {
  const email = process.env.DB_SEED_DEMO_EMAIL;
  const password = process.env.DB_SEED_DEMO_PASSWORD;
  await seedUser(email, password, "user");
};

const seedDb = async () => {
  await seedAdmin().catch((err) => {
    console.error("Error seeding admin:", err);
    throw err;
  });
  await seedDemoUser().catch((err) => {
    console.error("Error seeding demo user:", err);
  });
};

export default seedDb;
