"use client";

import { useState } from "react";
import ScheduleHero from "@/components/schedule/ScheduleHero";
import CompactDaySchedule from "@/components/schedule/CompactDaySchedule";
import TimetableSection from "@/components/schedule/TimetableSection";
import ParticipantInfoSection from "@/components/schedule/ParticipantInfoSection";
import EventModal from "@/components/ui/EventModal";
import { EventItem } from "@/lib/eventsData";

export default function ScheduleClient() {
  const [selectedModalEvent, setSelectedModalEvent] = useState<EventItem | null>(null);

  const handleOpenModal = (event: EventItem) => {
    setSelectedModalEvent(event);
  };

  return (
    <>
      {/* 1. Clear, student-focused hero */}
      <ScheduleHero />

      {/* 2. Compact day schedule (Registration, Opening Ceremony & Valedictory) */}
      <CompactDaySchedule />

      {/* 3. The MAIN FOCUS: One searchable, filterable timetable with all 13 events */}
      <TimetableSection onOpenModal={handleOpenModal} />

      {/* 4. Small section for verified participant information & organiser confirmation flags */}
      <ParticipantInfoSection />

      {/* 5. Interactive Quick View Modal */}
      <EventModal
        event={selectedModalEvent}
        onClose={() => setSelectedModalEvent(null)}
      />
    </>
  );
}
