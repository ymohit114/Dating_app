/**
 * assign-local-photos.js
 * Assigns local photos from public/profile-photos to managed profiles in MongoDB
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb://mohit_app:mohit_app@ac-ft2q9tn-shard-00-00.iye3brk.mongodb.net:27017,ac-ft2q9tn-shard-00-01.iye3brk.mongodb.net:27017,ac-ft2q9tn-shard-00-02.iye3brk.mongodb.net:27017/dating-app?ssl=true&replicaSet=atlas-14av5y-shard-0&authSource=admin&appName=Cluster0';

const PHOTOS_FOLDER = path.join(__dirname, '..', 'public', 'profile-photos');

async function assignPhotos() {
  // 1. Read all local photos
  const allFiles = fs.readdirSync(PHOTOS_FOLDER)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  console.log(`📁 Found ${allFiles.length} photos in public/profile-photos/`);

  // 2. Connect to MongoDB
  console.log('🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  const db = mongoose.connection.db;
  const profilesCollection = db.collection('profiles');

  // 3. Get all managed profiles sorted by name
  const managedProfiles = await profilesCollection
    .find({ isManaged: true })
    .sort({ firstName: 1 })
    .toArray();

  console.log(`👥 Found ${managedProfiles.length} managed profiles`);
  console.log(`📸 Photos: ${allFiles.length} | Profiles: ${managedProfiles.length}`);
  console.log(`ℹ️  First ${Math.min(allFiles.length, managedProfiles.length)} profiles get unique photos, rest cycle through.\n`);

  let updated = 0;
  const withoutPhoto = [];

  for (let i = 0; i < managedProfiles.length; i++) {
    const profile = managedProfiles[i];
    // Cycle through photos if profiles > photos
    const photoFile = allFiles[i % allFiles.length];
    const photoUrl = `/profile-photos/${photoFile}`;

    const photos = [
      { url: photoUrl, thumbnail: photoUrl, isMain: true, order: 0 }
    ];

    await profilesCollection.updateOne(
      { _id: profile._id },
      {
        $set: {
          photos: photos,
          profilePicture: photoUrl,
          avatar: photoUrl,
        }
      }
    );

    updated++;
    if (updated % 25 === 0) {
      console.log(`  ✅ Updated ${updated}/${managedProfiles.length} profiles...`);
    }

    // Track profiles beyond photo count (cycling ones)
    if (i >= allFiles.length) {
      withoutPhoto.push({
        index: i + 1,
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        assignedPhoto: photoFile,
        note: 'cycling (no unique photo)'
      });
    }
  }

  console.log(`\n✅ All ${updated} profiles updated!\n`);

  // 4. Show summary
  const uniqueCount = Math.min(allFiles.length, managedProfiles.length);
  const cyclingCount = managedProfiles.length - uniqueCount;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📸 Photos with UNIQUE photo : ${uniqueCount} profiles`);
  console.log(`🔄 Profiles using CYCLED photo: ${cyclingCount} profiles`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (cyclingCount > 0) {
    console.log(`\n⚠️  ${cyclingCount} profiles share a photo with another profile:`);
    // Get names of cycling profiles
    const cyclingProfiles = managedProfiles.slice(allFiles.length);
    cyclingProfiles.forEach((p, idx) => {
      const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
      const photo = allFiles[(allFiles.length + idx) % allFiles.length];
      console.log(`   Profile #${allFiles.length + idx + 1}: ${name} → ${photo}`);
    });
  }

  await mongoose.disconnect();
  console.log('\n🎉 Done!');
}

assignPhotos().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
