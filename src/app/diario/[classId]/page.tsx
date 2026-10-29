'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ClassDiaryView from '@/components/ClassDiaryView';

export default function DiarioSpecificClassPage() {
  const params = useParams();
  const classId = typeof params?.classId === 'string' ? params.classId : undefined;

  return <ClassDiaryView initialClassId={classId} />;
}
