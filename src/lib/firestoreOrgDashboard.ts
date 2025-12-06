import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Firestore,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

// Types
export interface EvacuationCenter {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  capacity: number;
  currentEvacuees: number;
  volunteers: string[];
  resources: Record<string, number>;
  createdAt?: any;
  updatedAt?: any;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: any;
  urgent: boolean;
}

export interface EvacueesTrend {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface Resources {
  food: number;
  water: number;
  medicalKits: number;
  fuel: number;
  blankets: number;
  updatedAt?: any;
}

// CRUD for Evacuation Centers
export const createEvacuationCenter = async (
  orgId: string,
  center: Omit<EvacuationCenter, "id">
) => {
  const ref = doc(collection(db, `organizations/${orgId}/evacuationCenters`));
  await setDoc(ref, {
    ...center,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getEvacuationCenters = async (orgId: string) => {
  const snap = await getDocs(
    collection(db, `organizations/${orgId}/evacuationCenters`)
  );
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EvacuationCenter[];
};

export const updateEvacuationCenter = async (
  orgId: string,
  centerId: string,
  data: Partial<EvacuationCenter>
) => {
  const ref = doc(db, `organizations/${orgId}/evacuationCenters/${centerId}`);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
};

export const deleteEvacuationCenter = async (
  orgId: string,
  centerId: string
) => {
  await deleteDoc(
    doc(db, `organizations/${orgId}/evacuationCenters/${centerId}`)
  );
};

export const subscribeEvacuationCenters = (
  orgId: string,
  cb: (centers: EvacuationCenter[]) => void
): Unsubscribe => {
  return onSnapshot(
    collection(db, `organizations/${orgId}/evacuationCenters`),
    (snap) => {
      cb(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as EvacuationCenter[]
      );
    }
  );
};

// CRUD for Announcements
export const createAnnouncement = async (
  orgId: string,
  announcement: Omit<Announcement, "id" | "createdAt">
) => {
  const ref = doc(collection(db, `organizations/${orgId}/announcements`));
  await setDoc(ref, { ...announcement, createdAt: serverTimestamp() });
  return ref.id;
};

export const getAnnouncements = async (orgId: string) => {
  const snap = await getDocs(
    collection(db, `organizations/${orgId}/announcements`)
  );
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Announcement[];
};

export const updateAnnouncement = async (
  orgId: string,
  announcementId: string,
  data: Partial<Announcement>
) => {
  const ref = doc(db, `organizations/${orgId}/announcements/${announcementId}`);
  await updateDoc(ref, data);
};

export const deleteAnnouncement = async (
  orgId: string,
  announcementId: string
) => {
  await deleteDoc(
    doc(db, `organizations/${orgId}/announcements/${announcementId}`)
  );
};

export const subscribeAnnouncements = (
  orgId: string,
  cb: (announcements: Announcement[]) => void
): Unsubscribe => {
  return onSnapshot(
    collection(db, `organizations/${orgId}/announcements`),
    (snap) => {
      cb(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[]
      );
    }
  );
};

// CRUD for Resources (single doc)
export const setResources = async (orgId: string, resources: Resources) => {
  const ref = doc(db, `organizations/${orgId}/resources/main`);
  await setDoc(ref, { ...resources, updatedAt: serverTimestamp() });
};

export const getResources = async (orgId: string) => {
  const ref = doc(db, `organizations/${orgId}/resources/main`);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Resources) : null;
};

export const subscribeResources = (
  orgId: string,
  cb: (resources: Resources | null) => void
): Unsubscribe => {
  const ref = doc(db, `organizations/${orgId}/resources/main`);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? (snap.data() as Resources) : null);
  });
};

// CRUD for Evacuees Trend (single doc per day)
export const setEvacueesTrend = async (orgId: string, trend: EvacueesTrend) => {
  const ref = doc(db, `organizations/${orgId}/evacueesTrend/${trend.date}`);
  await setDoc(ref, trend);
};

export const getEvacueesTrend = async (orgId: string) => {
  const snap = await getDocs(
    collection(db, `organizations/${orgId}/evacueesTrend`)
  );
  return snap.docs.map((doc) => doc.data() as EvacueesTrend);
};

export const subscribeEvacueesTrend = (
  orgId: string,
  cb: (trend: EvacueesTrend[]) => void
): Unsubscribe => {
  return onSnapshot(
    collection(db, `organizations/${orgId}/evacueesTrend`),
    (snap) => {
      cb(snap.docs.map((doc) => doc.data() as EvacueesTrend));
    }
  );
};
