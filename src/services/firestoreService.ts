import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  FirestoreJob,
  FirestoreApplication,
  FirestoreContact,
  FirestoreFollowUp,
  FirestoreInterview,
  FirestoreResume,
  FirestoreCoverLetter,
  FirestoreMessage,
  FirestoreActivity,
  FirestoreJobDescription,
  FirestoreJobAnalysis,
  ActivityType,
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Generic helper to log activity
export const logUserActivity = async (
  ownerId: string,
  type: ActivityType,
  description: string,
  jobId?: string
) => {
  try {
    await addDoc(collection(db, 'activity'), {
      ownerId,
      jobId: jobId || '',
      type,
      description,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

// 1. JOBS SERVICES
export const subscribeToJobs = (
  ownerId: string,
  onData: (jobs: FirestoreJob[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'jobs'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const jobs: FirestoreJob[] = [];
      snapshot.forEach((docSnap) => {
        jobs.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      // Sort in memory by updatedAt or createdAt desc
      jobs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(jobs);
    },
    onError
  );
};

export const createJob = async (ownerId: string, jobData: Omit<FirestoreJob, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const newJobDoc: Omit<FirestoreJob, 'id'> = {
    ...jobData,
    ownerId,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await addDoc(collection(db, 'jobs'), newJobDoc);
  await logUserActivity(ownerId, 'Job Saved', `Saved opportunity for ${jobData.role} at ${jobData.company}`, docRef.id);
  return docRef.id;
};

export const updateJob = async (jobId: string, ownerId: string, updates: Partial<FirestoreJob>) => {
  const jobRef = doc(db, 'jobs', jobId);
  const updatedData = {
    ...updates,
    ownerId,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(jobRef, updatedData);
  if (updates.status) {
    await logUserActivity(ownerId, 'Status Changed', `Updated job status to ${updates.status}`, jobId);
  }
};

export const deleteJob = async (jobId: string, ownerId?: string) => {
  const jobRef = doc(db, 'jobs', jobId);
  await deleteDoc(jobRef);
  if (ownerId) {
    await logUserActivity(ownerId, 'Job Deleted' as any, `Deleted job listing`, jobId);
  }
};

// 2. APPLICATIONS SERVICES
export const subscribeToApplications = (
  ownerId: string,
  onData: (apps: FirestoreApplication[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'applications'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const apps: FirestoreApplication[] = [];
      snapshot.forEach((docSnap) => {
        apps.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      apps.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(apps);
    },
    onError
  );
};

export const createApplication = async (
  ownerId: string,
  appData: Omit<FirestoreApplication, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  const docData: Omit<FirestoreApplication, 'id'> = {
    ...appData,
    ownerId,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await addDoc(collection(db, 'applications'), docData);
  await logUserActivity(ownerId, 'Application Submitted', `Applied for ${appData.role} at ${appData.company}`, appData.jobId);
  return docRef.id;
};

export const updateApplication = async (appId: string, ownerId: string, updates: Partial<FirestoreApplication>) => {
  const appRef = doc(db, 'applications', appId);
  await updateDoc(appRef, {
    ...updates,
    ownerId,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteApplication = async (appId: string) => {
  await deleteDoc(doc(db, 'applications', appId));
};

// 3. CONTACTS SERVICES
export const subscribeToContacts = (
  ownerId: string,
  onData: (contacts: FirestoreContact[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'contacts'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const contacts: FirestoreContact[] = [];
      snapshot.forEach((docSnap) => {
        contacts.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      contacts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(contacts);
    },
    onError
  );
};

export const createContact = async (
  ownerId: string,
  contactData: Omit<FirestoreContact, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'contacts'), {
    ...contactData,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await logUserActivity(ownerId, 'Contact Added', `Added contact ${contactData.name} (${contactData.company})`, contactData.jobId);
  return docRef.id;
};

export const updateContact = async (contactId: string, ownerId: string, updates: Partial<FirestoreContact>) => {
  await updateDoc(doc(db, 'contacts', contactId), {
    ...updates,
    ownerId,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteContact = async (contactId: string) => {
  await deleteDoc(doc(db, 'contacts', contactId));
};

// 4. FOLLOW UPS SERVICES
export const subscribeToFollowUps = (
  ownerId: string,
  onData: (followUps: FirestoreFollowUp[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'followUps'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const followUps: FirestoreFollowUp[] = [];
      snapshot.forEach((docSnap) => {
        followUps.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      followUps.sort((a, b) => new Date(a.nextFollowUpDate || 0).getTime() - new Date(b.nextFollowUpDate || 0).getTime());
      onData(followUps);
    },
    onError
  );
};

export const createFollowUp = async (
  ownerId: string,
  data: Omit<FirestoreFollowUp, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'followUps'), {
    ...data,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await logUserActivity(ownerId, 'Follow-up Created', `Created ${data.channel} follow-up for ${data.person} at ${data.company}`, data.jobId);
  return docRef.id;
};

export const updateFollowUp = async (id: string, ownerId: string, updates: Partial<FirestoreFollowUp>) => {
  await updateDoc(doc(db, 'followUps', id), {
    ...updates,
    ownerId,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteFollowUp = async (id: string) => {
  await deleteDoc(doc(db, 'followUps', id));
};

// 5. INTERVIEWS SERVICES
export const subscribeToInterviews = (
  ownerId: string,
  onData: (interviews: FirestoreInterview[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'interviews'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const interviews: FirestoreInterview[] = [];
      snapshot.forEach((docSnap) => {
        interviews.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      interviews.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
      onData(interviews);
    },
    onError
  );
};

export const createInterview = async (
  ownerId: string,
  data: Omit<FirestoreInterview, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'interviews'), {
    ...data,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await logUserActivity(ownerId, 'Interview Added', `Scheduled ${data.round} with ${data.company}`, data.jobId);
  return docRef.id;
};

export const updateInterview = async (id: string, ownerId: string, updates: Partial<FirestoreInterview>) => {
  await updateDoc(doc(db, 'interviews', id), {
    ...updates,
    ownerId,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteInterview = async (id: string) => {
  await deleteDoc(doc(db, 'interviews', id));
};

// 6. RESUMES SERVICES
export const subscribeToResumes = (
  ownerId: string,
  onData: (resumes: FirestoreResume[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'resumes'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const resumes: FirestoreResume[] = [];
      snapshot.forEach((docSnap) => {
        resumes.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      resumes.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(resumes);
    },
    onError
  );
};

export const createResume = async (
  ownerId: string,
  data: Omit<FirestoreResume, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'resumes'), {
    ...data,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await logUserActivity(ownerId, 'Resume Generated', `Saved resume ${data.version || data.name || 'Variant'} for ${data.role || data.targetRole || 'General'}`);
  return docRef.id;
};

export const createResumeVariant = async (
  ownerId: string,
  variantData: {
    name: string;
    targetRole: string;
    targetCompany?: string;
    baseResumeId: string;
    baseResumeName?: string;
    jobId?: string | null;
    variantType: string;
    notes?: string;
    summary: string;
    skills: string[];
    experienceHighlights: string[];
    isMaster?: boolean;
    format?: 'PDF' | 'DOCX' | 'Markdown';
    version?: string;
    status?: string;
  }
): Promise<string> => {
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  
  const payload: Omit<FirestoreResume, 'id'> = {
    ownerId,
    name: variantData.name,
    targetRole: variantData.targetRole,
    role: variantData.targetRole,
    targetCompany: variantData.targetCompany || '',
    company: variantData.targetCompany || '',
    baseResumeId: variantData.baseResumeId,
    baseResumeName: variantData.baseResumeName || '',
    jobId: variantData.jobId || null,
    variantType: variantData.variantType,
    notes: variantData.notes || '',
    summary: variantData.summary,
    skills: variantData.skills,
    experienceHighlights: variantData.experienceHighlights,
    isMaster: !!variantData.isMaster,
    format: variantData.format || 'PDF',
    version: variantData.version || 'v1.0',
    status: variantData.status || 'Active',
    validationStatus: 'Verified',
    downloadCount: 0,
    lastModified: today,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'resumes'), payload);
  await logUserActivity(
    ownerId,
    'Resume Generated',
    `Created resume variant "${variantData.name}" for ${variantData.targetRole}${variantData.targetCompany ? ` at ${variantData.targetCompany}` : ''}`,
    variantData.jobId || undefined
  );
  return docRef.id;
};

export const updateResume = async (id: string, ownerId: string, updates: Partial<FirestoreResume>) => {
  await updateDoc(doc(db, 'resumes', id), {
    ...updates,
    ownerId,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteResume = async (id: string) => {
  await deleteDoc(doc(db, 'resumes', id));
};

// 7. COVER LETTERS SERVICES
export const subscribeToCoverLetters = (
  ownerId: string,
  onData: (cls: FirestoreCoverLetter[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'coverLetters'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const cls: FirestoreCoverLetter[] = [];
      snapshot.forEach((docSnap) => {
        cls.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      cls.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(cls);
    },
    onError
  );
};

export const createCoverLetter = async (
  ownerId: string,
  data: Omit<FirestoreCoverLetter, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'coverLetters'), {
    ...data,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

export const updateCoverLetter = async (id: string, ownerId: string, updates: Partial<FirestoreCoverLetter>) => {
  await updateDoc(doc(db, 'coverLetters', id), {
    ...updates,
    ownerId,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCoverLetter = async (id: string) => {
  await deleteDoc(doc(db, 'coverLetters', id));
};

// 8. MESSAGES SERVICES
export const subscribeToMessages = (
  ownerId: string,
  onData: (messages: FirestoreMessage[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages: FirestoreMessage[] = [];
      snapshot.forEach((docSnap) => {
        messages.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      messages.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(messages);
    },
    onError
  );
};

export const createMessage = async (
  ownerId: string,
  data: Omit<FirestoreMessage, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'messages'), {
    ...data,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await logUserActivity(ownerId, 'Message Drafted', `Drafted ${data.messageType} via ${data.channel}`);
  return docRef.id;
};

// 9. ACTIVITY LOGS
export const subscribeToActivity = (
  ownerId: string,
  onData: (activities: FirestoreActivity[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, 'activity'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const activities: FirestoreActivity[] = [];
      snapshot.forEach((docSnap) => {
        activities.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      activities.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
      onData(activities.slice(0, 20)); // Return latest 20 activities
    },
    onError
  );
};

// 10. JOB DESCRIPTIONS
export const saveJobDescription = async (
  ownerId: string,
  data: Omit<FirestoreJobDescription, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
) => {
  const now = new Date().toISOString();
  // Check if JD for this jobId already exists
  const q = query(
    collection(db, 'jobDescriptions'),
    where('ownerId', '==', ownerId),
    where('jobId', '==', data.jobId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existingDoc = snap.docs[0];
    await updateDoc(doc(db, 'jobDescriptions', existingDoc.id), {
      ...data,
      ownerId,
      updatedAt: now,
    });
    return existingDoc.id;
  } else {
    const docRef = await addDoc(collection(db, 'jobDescriptions'), {
      ...data,
      ownerId,
      createdAt: now,
      updatedAt: now,
    });
    await logUserActivity(ownerId, 'JD Analyzed', `Saved job description for role`, data.jobId);
    return docRef.id;
  }
};

export const subscribeToJobDescription = (
  jobId: string,
  ownerId: string,
  onData: (jd: FirestoreJobDescription | null) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'jobDescriptions'),
    where('ownerId', '==', ownerId),
    where('jobId', '==', jobId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onData(null);
      } else {
        const first = snapshot.docs[0];
        onData({ id: first.id, ...(first.data() as any) });
      }
    },
    (err) => {
      console.error(`Error subscribing to JD for job ${jobId}:`, err);
      if (onError) onError(err);
    }
  );
};

export const getJobDescription = async (
  jobId: string,
  ownerId: string
): Promise<FirestoreJobDescription | null> => {
  try {
    const q = query(
      collection(db, 'jobDescriptions'),
      where('ownerId', '==', ownerId),
      where('jobId', '==', jobId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return { id: first.id, ...(first.data() as any) };
  } catch (err) {
    console.error('Failed to get JD:', err);
    return null;
  }
};

// DUPLICATE JOB CHECKER
export const checkDuplicateJob = async (
  ownerId: string,
  params: {
    jobUrl?: string;
    applicationUrl?: string;
    company?: string;
    role?: string;
    jobId?: string;
    excludeJobId?: string;
  }
): Promise<FirestoreJob | null> => {
  try {
    const q = query(
      collection(db, 'jobs'),
      where('ownerId', '==', ownerId)
    );
    const snapshot = await getDocs(q);
    const jobs: FirestoreJob[] = [];
    snapshot.forEach((d) => {
      if (d.id !== params.excludeJobId) {
        jobs.push({ id: d.id, ...(d.data() as any) });
      }
    });

    const targetUrl = (params.jobUrl || '').trim().toLowerCase();
    const targetAppUrl = (params.applicationUrl || '').trim().toLowerCase();
    const targetComp = (params.company || '').trim().toLowerCase();
    const targetRole = (params.role || '').trim().toLowerCase();
    const targetReqId = (params.jobId || '').trim().toLowerCase();

    for (const j of jobs) {
      const jUrl = (j.jobUrl || '').trim().toLowerCase();
      const jAppUrl = (j.applicationUrl || '').trim().toLowerCase();
      const jComp = (j.company || '').trim().toLowerCase();
      const jRole = (j.role || '').trim().toLowerCase();
      const jReqId = (j.jobId || '').trim().toLowerCase();

      // 1. Exact URL match (if not empty)
      if (targetUrl && jUrl && targetUrl === jUrl) {
        return j;
      }
      // 2. Exact Application URL match (if not empty)
      if (targetAppUrl && jAppUrl && targetAppUrl === jAppUrl) {
        return j;
      }
      // 3. Exact Requisition / Job ID match with same company
      if (targetReqId && jReqId && targetComp && jComp && targetReqId === jReqId && targetComp === jComp) {
        return j;
      }
      // 4. Same company and same role
      if (targetComp && targetRole && jComp === targetComp && jRole === targetRole) {
        return j;
      }
    }
    return null;
  } catch (err) {
    console.error('Error checking duplicate job:', err);
    return null;
  }
};

// DELETE DEMO JOBS
export const deleteDemoJobs = async (ownerId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'jobs'),
      where('ownerId', '==', ownerId),
      where('isDemo', '==', true)
    );
    const snapshot = await getDocs(q);
    let count = 0;
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'jobs', docSnap.id));
      count++;
    }
    if (count > 0) {
      await logUserActivity(ownerId, 'Job Deleted' as any, `Removed ${count} demo job records`);
    }
    return count;
  } catch (err) {
    console.error('Error deleting demo jobs:', err);
    throw err;
  }
};

// 11. Generic CRUD and Subscription wrappers for flexible app use
export const subscribeToCollection = <T>(
  collectionName: string,
  ownerId: string,
  onData: (data: T[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, collectionName),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      onData(items);
    },
    (err) => {
      console.error(`Error subscribing to ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
};

export const createDocument = async <T extends Record<string, any>>(
  collectionName: string,
  ownerId: string,
  data: T
) => {
  const now = new Date().toISOString();
  const docData = {
    ...data,
    ownerId,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await addDoc(collection(db, collectionName), docData);
  return docRef.id;
};

export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  ownerId: string,
  docId: string,
  updates: T
) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, {
    ...updates,
    ownerId,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteDocument = async (collectionName: string, _ownerId: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

export const logActivity = async (
  ownerId: string,
  type: string,
  description: string,
  targetType?: string,
  targetId?: string
) => {
  try {
    await addDoc(collection(db, 'activity'), {
      ownerId,
      type,
      description,
      targetType: targetType || '',
      targetId: targetId || '',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

// 12. JOB ANALYSES SERVICES
export const saveJobAnalysis = async (
  ownerId: string,
  data: Omit<FirestoreJobAnalysis, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const now = new Date().toISOString();
  // Ensure normalized fields
  const payload = {
    ...data,
    role: data.role || data.jobTitle || 'Role',
    jobTitle: data.jobTitle || data.role || 'Role',
    company: data.company || 'Company',
    overallScore: typeof data.overallScore === 'number' ? data.overallScore : (data.overallMatch || 80),
    overallMatch: typeof data.overallMatch === 'number' ? data.overallMatch : (data.overallScore || 80),
    summary: data.summary || data.matchSummary || '',
    matchSummary: data.matchSummary || data.summary || '',
    analysisStatus: data.analysisStatus || data.status || 'completed',
    status: data.status || data.analysisStatus || 'completed',
    evidence: data.evidence || {
      matched: data.matchedKeywords || [],
      partial: data.partialKeywords || [],
      missing: data.missingKeywords || [],
    },
    recommendations: data.recommendations || data.bulletRecommendations || [],
    bulletRecommendations: data.bulletRecommendations || data.recommendations || [],
  };

  // Check if an analysis exists for this (jobId, resumeId) pair
  if (data.jobId && data.resumeId) {
    const q = query(
      collection(db, 'jobAnalyses'),
      where('ownerId', '==', ownerId),
      where('jobId', '==', data.jobId),
      where('resumeId', '==', data.resumeId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const existingDoc = snap.docs[0];
      await updateDoc(doc(db, 'jobAnalyses', existingDoc.id), {
        ...payload,
        ownerId,
        updatedAt: now,
      });
      await logUserActivity(ownerId, 'JD Analyzed', `Updated rigorous JD analysis for ${payload.role} at ${payload.company}`, data.jobId);
      return existingDoc.id;
    }
  }

  const docRef = await addDoc(collection(db, 'jobAnalyses'), {
    ...payload,
    ownerId,
    createdAt: now,
    updatedAt: now,
  });
  await logUserActivity(ownerId, 'JD Analyzed', `Completed trustworthy JD analysis for ${payload.role} at ${payload.company}`, data.jobId || docRef.id);
  return docRef.id;
};

export const subscribeToJobAnalyses = (
  ownerId: string,
  onData: (analyses: FirestoreJobAnalysis[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, 'jobAnalyses'),
    where('ownerId', '==', ownerId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const analyses: FirestoreJobAnalysis[] = [];
      snapshot.forEach((docSnap) => {
        analyses.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      analyses.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onData(analyses);
    },
    (err) => {
      console.error('Error subscribing to jobAnalyses:', err);
      if (onError) onError(err);
    }
  );
};

export const getJobAnalysisForJob = async (
  jobId: string,
  ownerId: string
): Promise<FirestoreJobAnalysis | null> => {
  try {
    const q = query(
      collection(db, 'jobAnalyses'),
      where('ownerId', '==', ownerId),
      where('jobId', '==', jobId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return { id: first.id, ...(first.data() as any) };
  } catch (err) {
    console.error('Failed to get job analysis:', err);
    return null;
  }
};

export const getJobAnalysisForJobAndResume = async (
  jobId: string,
  resumeId: string,
  ownerId: string
): Promise<FirestoreJobAnalysis | null> => {
  try {
    const q = query(
      collection(db, 'jobAnalyses'),
      where('ownerId', '==', ownerId),
      where('jobId', '==', jobId),
      where('resumeId', '==', resumeId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return { id: first.id, ...(first.data() as any) };
  } catch (err) {
    console.error('Failed to get job analysis for job and resume:', err);
    return null;
  }
};


