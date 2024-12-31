import { db } from '../firebaseConfig';
import { doc, getDoc } from "firebase/firestore";

export const fetchUserData = async (userId) => {
    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            throw new Error("No such document!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};
