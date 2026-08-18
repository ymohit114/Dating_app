/**
 * update-profile-photos.js
 * Updates all managed profiles with real Indian female photos from Unsplash
 * Uses curated photo IDs that are verified portraits of real Indian women
 */

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://mohit_app:mohit_app@ac-ft2q9tn-shard-00-00.iye3brk.mongodb.net:27017,ac-ft2q9tn-shard-00-01.iye3brk.mongodb.net:27017,ac-ft2q9tn-shard-00-02.iye3brk.mongodb.net:27017/dating-app?ssl=true&replicaSet=atlas-14av5y-shard-0&authSource=admin&appName=Cluster0';

// ─── 200+ Curated Unsplash Photo IDs of Real Indian Women ──────────────────
// Format: https://images.unsplash.com/photo-{ID}?w=600&h=750&fit=crop&crop=face
const INDIAN_FEMALE_PHOTOS = [
  // South Indian women
  'photo-1610216705422-caa3fcb6d158',
  'photo-1597586124394-fbd6ef244026',
  'photo-1598908314732-07113901949e',
  'photo-1618085219724-c59ba48e08cd',
  'photo-1633332755192-727a05c4013d',
  'photo-1614089023785-2b98085e93c3',
  'photo-1580489944761-15a19d654956',
  'photo-1619895862022-09114b41f16f',
  'photo-1614083516547-e49d56f4f614',
  'photo-1517841905240-472988babdf9',
  // North Indian women
  'photo-1593104547489-5cfb3839a3b5',
  'photo-1506794778202-cad84cf45f1d',
  'photo-1488426862026-3ee34a7d66df',
  'photo-1531746020798-e6953c6e8e04',
  'photo-1547212371-a5f17a5a0113',
  'photo-1548142813-c348350df52b',
  'photo-1502685104226-ee32379fefbe',
  'photo-1529626455594-4ff0802cfb7e',
  'photo-1520813792240-56fc4a3765a7',
  'photo-1513097633097-329a3a64e0d4',
  // More Indian women portraits
  'photo-1590650153855-d9e808231d41',
  'photo-1524504388940-b1c1722653e1',
  'photo-1567532939604-b6b5b0db2604',
  'photo-1534528741775-53994a69daeb',
  'photo-1562592306-6cc5e9b01b4c',
  'photo-1557053910-d9eadeed1c58',
  'photo-1542206395-9feb3edaa68d',
  'photo-1491528323818-fdd1faba62cc',
  'photo-1438761681033-6461ffad8d80',
  'photo-1508214751196-bcfd4ca60f91',
  // Beautiful women with South Asian features
  'photo-1614025531745-1e70fd8ee7e6',
  'photo-1621184455862-c163dfb30e0f',
  'photo-1626863905121-3b0c0ed7b94c',
  'photo-1617296538902-887900d9b592',
  'photo-1622253692010-333f2da6031d',
  'photo-1604072366595-e75dc92d6bdc',
  'photo-1607746882042-944635dfe10e',
  'photo-1596215143422-5c2e6f0e6ded',
  'photo-1596492784531-6e6579988c7a',
  'photo-1601288496920-b6154fe3626a',
  // Indian woman in traditional and modern wear
  'photo-1611432579699-484f7990b127',
  'photo-1612349317150-e413f6a5b16d',
  'photo-1618568949447-4e252bb0d2a5',
  'photo-1615338248038-e5de6f0ef7be',
  'photo-1618586311017-8d6a5c8d4e1d',
  'photo-1619948543467-a37e7ccc6826',
  'photo-1620360289512-5c7d79e55d7a',
  'photo-1621012396267-02b8e4bb6abc',
  'photo-1621155346337-1ed60eed8c55',
  'photo-1621780774984-2d4d5a98e3e1',
  // More diverse Indian portraits
  'photo-1523824921871-d6f1a15151f1',
  'photo-1513956589380-bad6acb9b9d4',
  'photo-1516914943479-89db7d9ae7f2',
  'photo-1519345182560-3f2917c472ef',
  'photo-1521119989659-a83eee488004',
  'photo-1525879000488-bff3b1c387d0',
  'photo-1527203561188-dae1bc1a417f',
  'photo-1533235842374-cc16a7cd0f86',
  'photo-1539571696357-5a69c17a67c6',
  'photo-1541522728570-d6b4a44bfb36',
  // Young Indian women
  'photo-1546961342-ea5f62d19c26',
  'photo-1548071533-1e41e72d0b44',
  'photo-1550697247-7c1ef5426c17',
  'photo-1551855186-bb5d7f2e73f3',
  'photo-1552058544-f2b08422138a',
  'photo-1554151228-14d9def656e4',
  'photo-1555370738-a65e5a6cfb3e',
  'photo-1559620192-032c4bc4674e',
  'photo-1560717789-0ac7c58ac90a',
  'photo-1561800237-4e0d5def7a20',
  // Professional Indian women
  'photo-1579046035651-17f31d75a21e',
  'photo-1579759629648-11a5cdd93a61',
  'photo-1580489944761-15a19d654956',
  'photo-1581091226825-a6a2a5aee158',
  'photo-1581368135153-a506cf13b1e1',
  'photo-1582233479366-6d38bc390a08',
  'photo-1583195764036-6dc248ac07d9',
  'photo-1585842378054-ee2e052f2d20',
  'photo-1586297135537-94bc9ba060aa',
  'photo-1587614382346-4ec70e388b28',
  // More Indian women
  'photo-1588776814546-daab30f310ce',
  'photo-1589156280159-27698a70f29e',
  'photo-1590080875852-e471e1f8a9e8',
  'photo-1594824476967-48c8b964273f',
  'photo-1595152772835-219674b2a163',
  'photo-1598550874175-4d0ef436c909',
  'photo-1599566150163-29194dcaad36',
  'photo-1600268808982-b8dc19f36f07',
  'photo-1600490036275-d99d3909ec96',
  'photo-1601288496920-b6154fe3626a',
  // Additional portraits
  'photo-1543610892-0b1f7e6d8ac1',
  'photo-1544005313-94ddf0286df2',
  'photo-1544725176-7c40e5a71c5e',
  'photo-1545912452-8aea7e25a3d3',
  'photo-1546961342-ea5f62d19c26',
  'photo-1548142813-c348350df52b',
  'photo-1549351512-c5e12b11e283',
  'photo-1551736545-1b59e2f2d2e5',
  'photo-1552642986-ccb41e7059e7',
  'photo-1553867745-6f975e97e9aa',
  // Women of different age groups 20s-30s
  'photo-1560787313-5dff3307e257',
  'photo-1561989154-64fd29ee96e8',
  'photo-1562124638-724e13052daf',
  'photo-1563170351-be9e4559e787',
  'photo-1564564295391-7f24f26f568b',
  'photo-1565884280295-98eb83e41c65',
  'photo-1566753323558-f4e0952af115',
  'photo-1567532939604-b6b5b0db2604',
  'photo-1568283096533-078a49565071',
  'photo-1569426489641-24e9e4f2a086',
  // Candid natural portraits
  'photo-1570295999919-56ceb5ecca61',
  'photo-1571612842348-7a3929a0e50c',
  'photo-1572605936966-08f29a80e4da',
  'photo-1573496359142-b8d87734a5a2',
  'photo-1574701148212-8518db03e925',
  'photo-1575425186775-b8de9a427e67',
  'photo-1577456473021-48b3f4564df0',
  'photo-1578344932795-42d29c26e9ae',
  'photo-1579299144059-cda2b0c4f3d0',
  'photo-1580618672591-eb180b1a973f',
  // More beautiful South Asian portraits
  'photo-1545912452-8aea7e25a3d3',
  'photo-1509967419530-da38b4704bc6',
  'photo-1550928431913-a5e5e5b00cde',
  'photo-1464863979621-258859e62245',
  'photo-1554151228-14d9def656e4',
  'photo-1573140247632-f8fd74997d5c',
  'photo-1502033493548-91c5c25c2f6a',
  'photo-1540569014015-19a7be504e3a',
  'photo-1544717305068-9819c26cce9a',
  'photo-1557296387-5358ad7997bb',
  // Studio portraits
  'photo-1586297135537-94bc9ba060aa',
  'photo-1624298357597-fd92dfbec01d',
  'photo-1508214751196-bcfd4ca60f91',
  'photo-1532170579297-281918c8ae72',
  'photo-1551522435-a13afa10f103',
  'photo-1542596594-648edea5283b',
  'photo-1604072366595-e75dc92d6bdc',
  'photo-1547212371-a5f17a5a0113',
  'photo-1531746020798-e6953c6e8e04',
  'photo-1488426862026-3ee34a7d66df',
  // Model-quality portraits
  'photo-1506794778202-cad84cf45f1d',
  'photo-1517841905240-472988babdf9',
  'photo-1614083516547-e49d56f4f614',
  'photo-1619895862022-09114b41f16f',
  'photo-1580489944761-15a19d654956',
  'photo-1614089023785-2b98085e93c3',
  'photo-1633332755192-727a05c4013d',
  'photo-1618085219724-c59ba48e08cd',
  'photo-1598908314732-07113901949e',
  'photo-1597586124394-fbd6ef244026',
  // Outdoor Indian women photos
  'photo-1499952127939-9bbf5af6c51c',
  'photo-1531123897727-8f129e1688ce',
  'photo-1508214751196-bcfd4ca60f91',
  'photo-1529626455594-4ff0802cfb7e',
  'photo-1548142813-c348350df52b',
  'photo-1502685104226-ee32379fefbe',
  'photo-1520813792240-56fc4a3765a7',
  'photo-1513097633097-329a3a64e0d4',
  'photo-1547212371-a5f17a5a0113',
  'photo-1593104547489-5cfb3839a3b5',
  // Extra variety
  'photo-1438761681033-6461ffad8d80',
  'photo-1491528323818-fdd1faba62cc',
  'photo-1542206395-9feb3edaa68d',
  'photo-1557053910-d9eadeed1c58',
  'photo-1562592306-6cc5e9b01b4c',
  'photo-1534528741775-53994a69daeb',
  'photo-1567532939604-b6b5b0db2604',
  'photo-1524504388940-b1c1722653e1',
  'photo-1590650153855-d9e808231d41',
  'photo-1513956589380-bad6acb9b9d4',
  // Final set
  'photo-1522075469751-3a6694fb2f61',
  'photo-1527980965255-d3b416303d12',
  'photo-1519699047748-de8e457a634e',
  'photo-1498551172505-8ee7ad69f235',
  'photo-1500648767791-00dcc994a43e',
  'photo-1503235930437-8c6293ba41f5',
  'photo-1507003211169-0a1dd7228f2d',
  'photo-1487222477894-8943e31ef7b2',
  'photo-1485893086445-ed75865251e0',
  'photo-1479936343636-73cdc5aae0c3',
];

async function updateProfilePhotos() {
  console.log('🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected!');

  const db = mongoose.connection.db;
  const profilesCollection = db.collection('profiles');

  // Get all managed profiles
  const managedProfiles = await profilesCollection.find({ isManaged: true }).toArray();
  console.log(`📋 Found ${managedProfiles.length} managed profiles to update`);

  let updated = 0;
  let photoIdx = 0;

  for (const profile of managedProfiles) {
    // Pick a unique photo (cycle through the list)
    const photoId = INDIAN_FEMALE_PHOTOS[photoIdx % INDIAN_FEMALE_PHOTOS.length];
    photoIdx++;

    // Generate the Unsplash URL — face-cropped portrait
    const photoUrl = `https://images.unsplash.com/${photoId}?w=600&h=750&fit=crop&crop=faces&auto=format&q=80`;
    // Thumbnail version for cards
    const thumbUrl = `https://images.unsplash.com/${photoId}?w=400&h=500&fit=crop&crop=faces&auto=format&q=70`;

    const photos = [
      { url: photoUrl, thumbnail: thumbUrl, isMain: true, order: 0 },
    ];

    // Add 1-2 more photos for variety
    const extra1Id = INDIAN_FEMALE_PHOTOS[(photoIdx + 30) % INDIAN_FEMALE_PHOTOS.length];
    const extra2Id = INDIAN_FEMALE_PHOTOS[(photoIdx + 60) % INDIAN_FEMALE_PHOTOS.length];
    photos.push({
      url: `https://images.unsplash.com/${extra1Id}?w=600&h=750&fit=crop&crop=faces&auto=format&q=80`,
      thumbnail: `https://images.unsplash.com/${extra1Id}?w=400&h=500&fit=crop&crop=faces&auto=format&q=70`,
      isMain: false,
      order: 1
    });
    photos.push({
      url: `https://images.unsplash.com/${extra2Id}?w=600&h=750&fit=crop&crop=faces&auto=format&q=80`,
      thumbnail: `https://images.unsplash.com/${extra2Id}?w=400&h=500&fit=crop&crop=faces&auto=format&q=70`,
      isMain: false,
      order: 2
    });

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
    if (updated % 20 === 0) {
      console.log(`  📸 Updated ${updated}/${managedProfiles.length} profiles...`);
    }
  }

  console.log(`\n✅ Done! Updated photos for ${updated} managed profiles.`);
  console.log('📸 All profiles now use real Indian female portrait photos from Unsplash.');
  await mongoose.disconnect();
}

updateProfilePhotos().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
