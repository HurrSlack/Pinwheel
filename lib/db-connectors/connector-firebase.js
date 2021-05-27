const firebaseAdmin = require("firebase-admin");

/**
 * Connect to Google Cloud Firebase. Requires a "service account" object
 * provided as the config.
 * @link https://firebase.google.com/docs/admin/setup#initialize-sdk
 */
class FirebaseConnector {
  constructor(config) {
    this.credential = config;
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(this.credential),
    });
    this.db = firebaseAdmin.firestore();
  }
  async connect() {
    // no action necessary
  }
  async disconnect() {
    // unsure if this action is really necessary
    // await this.db.terminate();
  }
  async load(poastDescriptor) {
    const doc = await this.db
      .collection(poastDescriptor.type)
      .doc(poastDescriptor.slack_id)
      .get();
    return doc.exists ? doc.data() : poastDescriptor;
  }
  async save(poast) {
    await this.db.collection(poast.type).doc(poast.slack_id).set(poast);
  }
}

module.exports = FirebaseConnector;
