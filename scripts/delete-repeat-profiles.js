const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://mohit_app:mohit_app@ac-ft2q9tn-shard-00-00.iye3brk.mongodb.net:27017,ac-ft2q9tn-shard-00-01.iye3brk.mongodb.net:27017,ac-ft2q9tn-shard-00-02.iye3brk.mongodb.net:27017/dating-app?ssl=true&replicaSet=atlas-14av5y-shard-0&authSource=admin&appName=Cluster0';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const profiles = db.collection('profiles');
  const users = db.collection('users');

  // Get all managed profiles sorted same as assign script
  const all = await profiles.find({ isManaged: true }).sort({ firstName: 1 }).toArray();
  console.log('Total managed profiles:', all.length);

  // First 130 = unique photo → keep. Rest 79 = cycling → delete
  const toDelete = all.slice(130);
  console.log('Profiles to delete (repeat photo):', toDelete.length);

  const profileIds = toDelete.map(p => p._id);
  const userIds = toDelete.map(p => p.userId).filter(Boolean);

  const profileResult = await profiles.deleteMany({ _id: { $in: profileIds } });
  const userResult = await users.deleteMany({ _id: { $in: userIds } });

  console.log('✅ Profiles deleted:', profileResult.deletedCount);
  console.log('✅ User accounts deleted:', userResult.deletedCount);

  const remaining = await profiles.countDocuments({ isManaged: true });
  console.log('📊 Remaining managed profiles:', remaining);

  await mongoose.disconnect();
  console.log('🎉 Done!');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
