const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json'); // Get from Firebase console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Replace this with your actual JSON data
const cafes = [
  {
    name: "Cafe A",
    address: "123 Matcha Lane",
    state: "Selangor"
  },
  // more cafes...
];

async function uploadData() {
  const batch = db.batch();
  cafes.forEach((cafe) => {
    const docRef = db.collection('cafes').doc(); // auto-ID
    batch.set(docRef, cafe);
  });
  await batch.commit();
  console.log('Cafe data uploaded to Firestore.');
}

uploadData();
